import {
    WebSocketGateway,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from "@nestjs/websockets";
import "dotenv/config";
import { Socket } from "socket.io";
import { RoomService } from "./services/room.service";
import { Logger, UsePipes, ValidationPipe } from "@nestjs/common";
import { EMIT_EVENT, LISTEN_EVENT } from "@/room/room.events";
import { CreateRoomDto } from "@/room/dto/create-room.dto";
import { WebsocketService } from "@/websocket/websocket.service";
import { JoinRoomDto } from "@/room/dto/join-room.dto";
import { RoomRepository } from "@/room/room.repository";
import { ReactionDto } from "@/room/dto/reaction.dto";
import { RoomLeaveService } from "@/room/services/room-leave.service";
import { RoomCreateService } from "@/room/services/room-create.service";
import { RoomJoinService } from "@/room/services/room-join.service";
import { websocketConfig } from "@/websocket/websocket.config";

@WebSocketGateway(websocketConfig)
export class RoomGateway implements OnGatewayDisconnect {
    private logger: Logger = new Logger("Room Gateway");

    public constructor(
        private readonly roomService: RoomService,
        private readonly roomLeaveService: RoomLeaveService,
        private readonly roomCreateService: RoomCreateService,
        private readonly roomJoinService: RoomJoinService,
        private readonly socketService: WebsocketService,
        private readonly roomRepository: RoomRepository
    ) {}

    public async handleDisconnect(client: Socket) {
        await this.handleLeaveRoom(client);
    }

    @SubscribeMessage(LISTEN_EVENT.CREATE)
    @UsePipes(new ValidationPipe({ transform: true }))
    public async handleCreateRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: CreateRoomDto
    ) {
        // TODO: try - catch 로 에러 핸들링을 통해 이벤트 Emit 을 여기서 하기
        await this.roomCreateService.createRoom({ ...dto, socketId: client.id });
    }

    @SubscribeMessage(LISTEN_EVENT.JOIN)
    @UsePipes(new ValidationPipe({ transform: true }))
    public async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: JoinRoomDto
    ) {
        await this.roomJoinService.joinRoom({ ...dto, socketId: client.id });
    }

    @SubscribeMessage(LISTEN_EVENT.LEAVE)
    public async handleLeaveRoom(client: Socket) {
        await this.roomLeaveService.leaveRoom(client);
    }

    @SubscribeMessage(LISTEN_EVENT.FINISH)
    public async handleFinishRoom(client: Socket) {
        const roomId = await this.roomService.finishRoom(client.id);
        this.socketService.emitToRoom(roomId, EMIT_EVENT.FINISH);
    }

    @SubscribeMessage(LISTEN_EVENT.REACTION)
    @UsePipes(new ValidationPipe({ transform: true }))
    public async handleReaction(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: ReactionDto
    ) {
        const room = await this.roomRepository.getRoom(dto.socketId);
        if (!room) return;
        this.socketService.emitToRoom(room.id, EMIT_EVENT.REACTION, dto);
    }
}
