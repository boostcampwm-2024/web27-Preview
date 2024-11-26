import { RoomStatus } from "@/room/room.entity";

export interface Connection {
    socketId: string;
    createAt: number;
    nickname: string;
}

export interface RoomDto {
    id: string;
    title: string;
    category: string;
    inProgress: boolean;
    host: Connection;
    status: RoomStatus;
    participants: number;
    maxParticipants: number;
    createdAt: number;
    connectionList: Connection[];
}
