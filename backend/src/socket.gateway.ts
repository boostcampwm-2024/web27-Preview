import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

interface User {
  id: string;
  email: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // CORS 설정
  },
})

export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users: { [key: string]: User[] } = {};
  private socketToRoom: { [key: string]: string } = {};
  private maximum = 4; // 최대 사용자 수

  handleConnection(socket: any) {
    console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: any) {
    console.log(`Client disconnected: ${socket.id}`);
    const roomID = this.socketToRoom[socket.id];
    if (roomID) {
      const room = this.users[roomID];
      if (room) {
        this.users[roomID] = room.filter(user => user.id !== socket.id);
        if (this.users[roomID].length === 0) {
          delete this.users[roomID];
        } else {
          this.server.to(roomID).emit('user_exit', { id: socket.id });
        }
      }
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(socket: any, data: { room: string; email: string }) {
    if (this.users[data.room]) {
      if (this.users[data.room].length === this.maximum) {
        socket.emit('room_full');
        return;
      }
      this.users[data.room].push({ id: socket.id, email: data.email });
    } else {
      this.users[data.room] = [{ id: socket.id, email: data.email }];
    }

    this.socketToRoom[socket.id] = data.room;
    socket.join(data.room);
    console.log(`[${data.room}]: ${socket.id} enter`);

    const usersInThisRoom = this.users[data.room].filter(user => user.id !== socket.id);
    socket.emit('all_users', usersInThisRoom);
  }

  @SubscribeMessage('offer')
  handleOffer(@MessageBody() data: { offerReceiveID: string; sdp: any; offerSendID: string; offerSendEmail: string }) {
    this.server.to(data.offerReceiveID).emit('getOffer', {
      sdp: data.sdp,
      offerSendID: data.offerSendID,
      offerSendEmail: data.offerSendEmail,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() data: { answerReceiveID: string; sdp: any; answerSendID: string }) {
    this.server.to(data.answerReceiveID).emit('getAnswer', {
      sdp: data.sdp,
      answerSendID: data.answerSendID,
    });
  }

  @SubscribeMessage('candidate')
  handleCandidate(@MessageBody() data: { candidateReceiveID: string; candidate: any; candidateSendID: string }) {
    this.server.to(data.candidateReceiveID).emit('getCandidate', {
      candidate: data.candidate,
      candidateSendID: data.candidateSendID,
    });
  }
}