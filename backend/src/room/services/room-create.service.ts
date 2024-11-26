import { Injectable } from "@nestjs/common";
import { CreateRoomInternalDto } from "@/room/dto/create-room.dto";
import { EMIT_EVENT } from "@/room/room.events";
import { WebsocketService } from "@/websocket/websocket.service";
import { RoomRepository } from "@/room/room.repository";
import { QuestionListRepository } from "@/question-list/question-list.repository";
import { RoomJoinService } from "@/room/services/room-join.service";
import { createHash } from "node:crypto";
import "dotenv/config";

@Injectable()
export class RoomCreateService {
    private static ROOM_ID_CREATE_KEY = "room_id";

    public constructor(
        private readonly roomRepository: RoomRepository,
        private readonly socketService: WebsocketService,
        private readonly questionListRepository: QuestionListRepository,
        private readonly roomJoinService: RoomJoinService
    ) {}

    public async createRoom(dto: CreateRoomInternalDto) {
        const { socketId, nickname } = dto;
        const id = await this.generateRoomId();
        const currentTime = Date.now();
        const questionListContents = await this.questionListRepository.getContentsByQuestionListId(
            dto.questionListId
        );

        const roomDto = {
            ...dto,
            id,
            inProgress: false,
            connectionList: [],
            participants: 0,
            questionListContents,
            createdAt: currentTime,
            host: {
                socketId: dto.socketId,
                nickname,
                createAt: currentTime,
            },
        };

        await this.roomRepository.setRoom(roomDto);

        await this.roomJoinService.joinRoom({ roomId: id, socketId, nickname }, true);

        this.socketService.emitToRoom(id, EMIT_EVENT.CREATE, roomDto);
    }

    // TODO: 동시성 고려해봐야하지 않을까?
    private async generateRoomId() {
        const client = this.socketService.getRedisClient();

        const idString = await client.get(RoomCreateService.ROOM_ID_CREATE_KEY);

        let id: number;
        if (idString && !isNaN(parseInt(idString))) {
            id = await client.incr(RoomCreateService.ROOM_ID_CREATE_KEY);
        } else {
            id = parseInt(await client.set(RoomCreateService.ROOM_ID_CREATE_KEY, "1"));
        }

        return createHash("sha256")
            .update(id + process.env.SESSION_HASH)
            .digest("hex");
    }
}
