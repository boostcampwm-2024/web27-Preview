import { RoomDto } from "@/room/dto/room.dto";
import { RoomRepository } from "@/room/room.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RoomHostService {
    public constructor(private readonly roomRepository: RoomRepository) {}

    private getNewHost(room: RoomDto) {
        return room.connectionList[0];
    }

    public async delegateHost(roomId: string) {
        const room = await this.roomRepository.getRoom(roomId);
        if (!room) throw new Error("Invalid room Id");

        const newHost = this.getNewHost(room);

        const found = room.connectionList.find(
            (connection) => connection.socketId === newHost.socketId
        );
        if (!found) throw new Error("invalid new host id");

        room.host = newHost;

        await this.roomRepository.setRoom(room);
        return newHost;
    }
}
