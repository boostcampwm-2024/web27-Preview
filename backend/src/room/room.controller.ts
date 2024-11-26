import { Controller, Get } from "@nestjs/common";
import { RoomService } from "./services/room.service";

@Controller("rooms")
export class RoomController {
    constructor(private readonly roomService: RoomService) {}

    @Get()
    public async getPublicRoom() {
        const rooms = await this.roomService.getPublicRoom();
        return rooms.map((room) => ({
            ...room,
            connectionList: undefined,
        }));
    }
}
