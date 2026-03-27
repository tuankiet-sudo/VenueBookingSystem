import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Token } from '../entities/token.entity';
import * as config from '../../config';
import dayjs from 'dayjs';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    @Inject(config.commonConfig.KEY) private appCommonConfig: config.CommonConfigType,
  ) {}

  public async generateToken(payload: any): Promise<string> {
    const data = {
      ...payload,
      expiredAt: dayjs().add(1, 'year').toDate().toString(),
    };
    return this.jwtService.signAsync(data);
  }

  public async verifyToken(token: string): Promise<Token> {
    const payload = await this.jwtService.verifyAsync<Token>(token, {
      secret: this.appCommonConfig.jwtSecret,
    });
    return payload;
  }
}
