import { Module } from '@nestjs/common';
import { SocketModule } from './socket.module';

@Module({
  imports: [SocketModule],
})
export class AppModule { }
