import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import "dotenv/config";
import { Server, Socket } from "socket.io";
import { RoomService } from "./room.service";
import { Logger, UsePipes, ValidationPipe } from "@nestjs/common";
import { EMIT_EVENT, LISTEN_EVENT } from "@/room/room.events";
import {
    CreateRoomDto,
    FinishRoomDto,
    JoinRoomDto,
    MoveIndexDto,
    ReactionDto,
    RoomIdDto,
} from "@/room/dto";
import { InfraService } from "@/infra/infra.service";
import { RoomRepository } from "@/room/room.repository";

import { gatewayConfig } from "@/infra/infra.config";

import { FullRoomException, InProgressException } from "@/room/exceptions/join-room-exceptions";
import { createAdapter } from "@socket.io/redis-adapter";

@WebSocketGateway(gatewayConfig)
export class RoomGateway implements OnGatewayDisconnect, OnGatewayInit, OnGatewayConnection {
    @WebSocketServer()
    private server: Server;
    private logger: Logger = new Logger("Websocket");

    public constructor(
        private readonly roomService: RoomService,
        private readonly infraService: InfraService,
        private readonly roomRepository: RoomRepository
    ) {}

    public afterInit() {
        const pubClient = this.infraService.getRedisClient();
        const subClient = pubClient.duplicate();
        const redisAdapter = createAdapter(pubClient, subClient);
        this.server.adapter(redisAdapter);
        this.infraService.setServer(this.server);
    }

    public async handleDisconnect(client: Socket) {
        await this.handleLeaveRoom(client);
        this.logger.log(`Client disconnected: ${client.id}`);
        await this.infraService.removeSocketMetadata(client);
    }

    public async handleConnection(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        await this.infraService.createSocketMetadata(client);
    }

    @SubscribeMessage(LISTEN_EVENT.CREATE)
    @UsePipes(new ValidationPipe({ transform: true }))
    public async handleCreateRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: CreateRoomDto
    ) {
        const createRoomResponseDto = await this.roomService.createRoom(dto, client);
        client.emit(EMIT_EVENT.CREATE, createRoomResponseDto);
    }

    @SubscribeMessage(LISTEN_EVENT.JOIN)
    @UsePipes(new ValidationPipe({ transform: true }))
    public async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: JoinRoomDto
    ) {
        try {
            const joinRoomResponseDto = await this.roomService.joinRoom(dto, client);
            client.emit(EMIT_EVENT.JOIN, joinRoomResponseDto);
        } catch (e) {
            if (e instanceof InProgressException) client.emit(EMIT_EVENT.IN_PROGRESS, {});
            else if (e instanceof FullRoomException) client.emit(EMIT_EVENT.FULL, {});
            else throw e;
        }
    }

    @SubscribeMessage(LISTEN_EVENT.LEAVE)
    public async handleLeaveRoom(client: Socket) {
        await this.roomService.leaveRoom(client);
    }

    @SubscribeMessage(LISTEN_EVENT.FINISH)
    @UsePipes(new ValidationPipe({ transform: true }))
    public async handleFinishRoom(@MessageBody() dto: FinishRoomDto) {
        const roomId = await this.roomService.finishRoom(dto.roomId);
        this.infraService.emitToRoom(roomId, EMIT_EVENT.FINISH);
    }

    @SubscribeMessage(LISTEN_EVENT.REACTION)
    @UsePipes(new ValidationPipe({ transform: true }))
    public async handleReaction(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: ReactionDto
    ) {
        const room = await this.roomRepository.getRoom(dto.roomId);

        if (!room) return;

        this.infraService.emitToRoom(room.id, EMIT_EVENT.REACTION, {
            socketId: client.id,
            reactionType: dto.reactionType,
        });
    }

    @SubscribeMessage(LISTEN_EVENT.START_PROGRESS)
    public async handleStartProgress(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: RoomIdDto
    ) {
        return this.toggleProgress(dto.roomId, client.id, true, EMIT_EVENT.START_PROGRESS);
    }

    @SubscribeMessage(LISTEN_EVENT.STOP_PROGRESS)
    public async handleStopProgress(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: RoomIdDto
    ) {
        return this.toggleProgress(dto.roomId, client.id, false, EMIT_EVENT.STOP_PROGRESS);
    }

    @SubscribeMessage(LISTEN_EVENT.NEXT_QUESTION)
    public async handleNextQuestion(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: RoomIdDto
    ) {
        this.infraService.emitToRoom(dto.roomId, EMIT_EVENT.NEXT_QUESTION, {
            currentIndex: await this.roomService.increaseIndex(dto.roomId, client.id),
        });
    }

    @SubscribeMessage(LISTEN_EVENT.CURRENT_INDEX)
    public async handleCurrentIndex(@MessageBody() dto: RoomIdDto) {
        this.infraService.emitToRoom(dto.roomId, EMIT_EVENT.CURRENT_INDEX, {
            currentIndex: await this.roomService.getIndex(dto.roomId),
        });
    }

    @SubscribeMessage(LISTEN_EVENT.MOVE_INDEX)
    public async handleMoveIndex(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: MoveIndexDto
    ) {
        this.infraService.emitToRoom(dto.roomId, EMIT_EVENT.MOVE_INDEX, {
            currentIndex: await this.roomService.setIndex(dto.roomId, client.id, dto.index),
        });
    }

    private async toggleProgress(
        roomId: string,
        socketId: string,
        toStatus: boolean,
        eventName: string
    ) {
        try {
            const status = await this.roomService.setProgress(roomId, socketId, toStatus);
            this.infraService.emitToRoom(roomId, eventName, {
                status: "success",
                inProgress: status,
            });
        } catch {
            this.infraService.emitToRoom(roomId, eventName, {
                status: "error",
            });
        }
    }
}
