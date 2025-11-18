import { Injectable } from "@nestjs/common";
import { RoomEntity } from "@/room/room.entity";
import { RoomRepository } from "@/room/room.repository";
import { RoomListResponseDto } from "@/room/dto/all-room.dto";
import { Socket } from "socket.io";
import { CreateRoomDto, CreateRoomResponseDto } from "@/room/dto/create-room.dto";
import { JoinRoomDto, JoinRoomResponseDto } from "@/room/dto/join-room.dto";
import { Transactional } from "typeorm-transactional";
import { Room, RoomStatus } from "@/room/domain/room";
import { EMIT_EVENT } from "@/room/room.events";
import { createHash } from "node:crypto";
import { QuestionRepository } from "@/question-list/repository/question.respository";
import {
    FullRoomException,
    InProgressException,
    RoomNotFoundException,
} from "@/room/exceptions/join-room-exceptions";
import { InfraService } from "@/infra/infra.service";
import { QuestionListRepository } from "@/question-list/repository/question-list.repository";

@Injectable()
export class RoomService {
    private static ROOM_ID_CREATE_KEY = "room_id";

    public constructor(
        private readonly roomRepository: RoomRepository,
        private readonly infraService: InfraService,
        private readonly questionListRepository: QuestionListRepository,
        private readonly questionRepository: QuestionRepository
    ) {}

    public async leaveRoom(socket: Socket) {
        const rooms = await this.infraService.getSocketMetadata(socket);
        for await (const roomId of rooms.joinedRooms)
            await this.processRoomLeave(socket.id, roomId);
    }

    @Transactional()
    public async createRoom(
        createRoomDto: CreateRoomDto,
        socket: Socket
    ): Promise<CreateRoomResponseDto> {
        const currentTime = Date.now();
        const questionData = await this.useQuestionList(createRoomDto.questionListId);
        const roomObj = {
            ...createRoomDto,
            id: await this.generateRoomId(),
            inProgress: false,
            connectionMap: {},
            participants: 0,
            createdAt: currentTime,
            maxQuestionListLength: questionData.content.length,
            questionListTitle: questionData.title,
            currentIndex: 0,
            host: {
                socketId: socket.id,
                nickname: createRoomDto.nickname,
                createAt: currentTime,
            },
        };

        const room = new Room(roomObj).build();

        await this.roomRepository.setRoom(room);

        return {
            nickname: createRoomDto.nickname,
            participants: 0,
            questionListContents: questionData.content,
            socketId: socket.id,
            ...roomObj,
        };
    }

    public async joinRoom(joinRoomDto: JoinRoomDto, socket: Socket): Promise<JoinRoomResponseDto> {
        const { roomId, nickname } = joinRoomDto;

        const room = Room.fromEntity(await this.roomRepository.getRoom(roomId));

        if (!socket) throw new Error("Invalid Socket");
        if (!room.entity) throw new RoomNotFoundException();

        await this.infraService.joinRoom(socket, room.entity.id);

        if (room.entity.inProgress) throw new InProgressException();
        if (this.isFullRoom(room)) throw new FullRoomException();

        room.addConnection({
            socketId: socket.id,
            createAt: Date.now(),
            nickname,
        });

        await this.roomRepository.setRoom(room.build());

        const questionListContents = await this.questionRepository.getContentsByQuestionListId(
            room.entity.questionListId
        );

        const obj = room.toObject();
        delete obj.connectionMap[socket.id];
        return {
            participants: room.getParticipants(),
            ...obj,
            questionListContents,
        };
    }

    public async getPublicRoom(inProgress?: boolean): Promise<RoomListResponseDto[]> {
        const rooms = await this.roomRepository.getAllRoom();

        const filterFunction = (room: RoomEntity) =>
            room.status === RoomStatus.PUBLIC &&
            (inProgress === undefined || room.inProgress === inProgress);

        return rooms
            .filter(filterFunction)
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((room) => Room.fromEntity(room))
            .map((room) => ({
                ...room.toObject(),
                host: room.getHost(),
                participants: room.getParticipants(),
                connectionMap: undefined,
            }));
    }

    public async setProgress(roomId: string, socketId: string, status: boolean) {
        const room = Room.fromEntity(await this.roomRepository.getRoom(roomId));

        if (!room.entity) throw new Error("cannot set progress");
        if (room.getHost().socketId !== socketId) throw new Error("only host can set process");

        room.entity.inProgress = status;
        if (!room.entity.inProgress) room.entity.currentIndex = 0;
        await this.roomRepository.setRoom(room.build());
        return status;
    }

    public async setIndex(roomId: string, socketId: string, index: number) {
        const room = Room.fromEntity(await this.roomRepository.getRoom(roomId));

        // TODO : 리팩토링 할 필요가 있어보임.
        if (
            !room.entity ||
            !room.entity.inProgress ||
            room.getHost().socketId !== socketId ||
            index < 0 ||
            index >= room.entity.maxQuestionListLength
        )
            return -1;

        room.entity.currentIndex = index;
        await this.roomRepository.setRoom(room.build());
        return index;
    }

    public async getIndex(roomId: string) {
        return (await this.roomRepository.getRoom(roomId)).currentIndex;
    }

    public async increaseIndex(roomId: string, socketId: string) {
        const room = Room.fromEntity(await this.roomRepository.getRoom(roomId));

        if (!room.entity || room.getHost().socketId !== socketId || !room.entity.inProgress)
            return -1;

        const index = await this.setIndex(roomId, socketId, (await this.getIndex(roomId)) + 1);

        if (index === -1) return room.entity.maxQuestionListLength - 1;

        return index;
    }

    public async finishRoom(roomId: string) {
        await this.roomRepository.removeRoom(roomId);
        return roomId;
    }

    private async processRoomLeave(socketId: string, roomId: string) {
        const room = Room.fromEntity(await this.roomRepository.getRoom(roomId));
        if (!room.entity) return;

        room.removeConnection(socketId);

        if (!Object.keys(room.getConnection()).length) return this.deleteRoom(room.entity.id);

        await this.roomRepository.setRoom(room.build());

        if (room.getHost().socketId === socketId) await this.handleHostChange(socketId, room);

        this.infraService.emitToRoom(roomId, EMIT_EVENT.QUIT, { socketId });
    }

    private async handleHostChange(socketId: string, room: Room) {
        if (room.getHost().socketId !== socketId) return;

        const newHost = await this.delegateHost(room);

        // TODO : throw new Exception : host changed
        // 에러를 던지는 방식이 아닌 다른 방식으로 해결해야함.
        this.infraService.emitToRoom(room.entity.id, EMIT_EVENT.CHANGE_HOST, {
            nickname: newHost.nickname,
            socketId: newHost.socketId,
        });
    }

    private async deleteRoom(roomId: string) {
        await this.roomRepository.removeRoom(roomId);
        this.infraService.emitToRoom(roomId, EMIT_EVENT.QUIT, { roomId });
    }

    private getNewHost(room: Room) {
        return Object.values(room.getConnection()).sort((a, b) => a.createAt - b.createAt)[0];
    }

    private async delegateHost(room: Room) {
        const newHost = this.getNewHost(room);

        const found = room.getConnection()[newHost.socketId];
        if (!found) throw new Error("invalid new host id");

        room.setHost(newHost);

        await this.roomRepository.setRoom(room.build());
        return newHost;
    }

    private isFullRoom(room: Room): boolean {
        return room.entity.maxParticipants <= Object.keys(room.getConnection()).length;
    }

    @Transactional()
    private async useQuestionList(questionListId: number) {
        const questionData = await this.questionListRepository.findOne({
            where: { id: questionListId },
        });
        const questions = await this.questionRepository.getContentsByQuestionListId(questionListId);
        questionData.usage += 1;
        await this.questionListRepository.save(questionData);
        return {
            title: questionData.title,
            content: questions,
        };
    }

    // TODO: 동시성 고려해봐야하지 않을까?
    private async generateRoomId() {
        const client = this.infraService.getRedisClient();

        const idString = await client.get(RoomService.ROOM_ID_CREATE_KEY);

        let id: number;
        if (idString && !isNaN(parseInt(idString))) {
            id = await client.incr(RoomService.ROOM_ID_CREATE_KEY);
        } else {
            id = parseInt(await client.set(RoomService.ROOM_ID_CREATE_KEY, "1"));
        }

        return createHash("sha256")
            .update(id + "")
            .digest("hex");
    }
}
