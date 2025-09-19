/* eslint-disable prettier/prettier */
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppLogger } from 'src/common/logger/logger.service';
import { jwtConstants } from 'src/modules/auth/constants/constant';

interface JwtPayload {
  sub: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly logger: AppLogger,
    private readonly jwtService: JwtService,
  ){}

  afterInit() {
    this.logger.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {

     try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers.authorization as string)?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Missing token');
      }

      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.access_token_secret,
      });


      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (client as any).userId = payload.sub;

      await client.join(`user:${payload.sub}`);

      this.logger.log(`Client ${client.id} connected as user:${payload.sub}`);
    } catch (err) {
      this.logger.error(`Unauthorized client ${client.id}`, err);
      client.disconnect();
    }

    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }


  @SubscribeMessage('notifications')
  async handleSubscribe(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    await client.join(`user:${data}`);
    client.emit('joined', { message: `Joined room ${data}` });
  }

  sendNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notifications', notification);
  }
}
