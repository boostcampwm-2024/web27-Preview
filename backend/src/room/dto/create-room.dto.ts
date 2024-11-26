import { IsEnum, IsNotEmpty, IsNumber, Max, Min } from "class-validator";
import { RoomStatus } from "@/room/room.entity";

export class CreateRoomDto {
    @IsNotEmpty()
    title: string;

    @IsEnum(RoomStatus, {
        message: "Status must be either PUBLIC or PRIVATE",
    })
    status: RoomStatus;

    @IsNotEmpty()
    nickname: string;

    @IsNotEmpty()
    category: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    maxParticipants: number;

    @IsNumber()
    questionListId: number;
}

export class CreateRoomInternalDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    category: string;

    @IsEnum(RoomStatus, {
        message: "Status must be either PUBLIC or PRIVATE",
    })
    status: RoomStatus;

    @IsNotEmpty()
    nickname: string;

    @IsNotEmpty()
    socketId: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    maxParticipants: number;

    @IsNumber()
    questionListId: number;
}
