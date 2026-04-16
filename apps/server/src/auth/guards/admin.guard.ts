import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from '../services';
import { UserService } from '../../user/services';
import dayjs from 'dayjs';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      // 2. Verify the token
      const payload = await this.tokenService.verifyToken(token);
      if (dayjs().isAfter(dayjs(payload.expiredAt).toDate())) {
        throw new UnauthorizedException('User not valid');
      }
      const user = await this.userService.findUserById(payload.userId);
      if (user.isActive === 0 || user.isAdmin === 0) {
        throw new BadRequestException('Account is not administrator');
      }
      // 3. Attach payload to the request object
      // This allows you to access 'req.user' in your controller
      request.user = {
        userId: payload.userId,
        role: 'admin',
      };
    } catch (err) {
      throw err;
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // Format is usually "Bearer <token>"
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
