import { Injectable } from '@nestjs/common';
import { TokenService } from './token.service';
import { UserService } from '../../user/services/user.service';
import { LoginDto, OwnerSignupDto, SignupDto } from '../auth.dto';
import { ClientService, OwnerService } from '../../user/services';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly ownerService: OwnerService,
  ) {}

  public async signup(signupDto: SignupDto) {
    const userId = await this.userService.createUser(signupDto);
    await this.clientService.createNewClient(userId);
    const token = await this.tokenService.generateToken({
      userId,
      role: 'client',
    });
    return { token, role: 'client' };
  }

  public async login(loginDto: LoginDto) {
    const userId = await this.userService.validateLoginCredentials(loginDto);
    await this.userService.validateLoginCredentials(loginDto);
    const token = await this.tokenService.generateToken({
      userId,
      role: 'client',
    });
    return { token, role: 'client' };
  }

  public async ownerSignup(userId: string, ownerSignupDto: OwnerSignupDto) {
    await this.ownerService.createNewOwner(userId, ownerSignupDto);
    const token = await this.tokenService.generateToken({
      userId,
      role: 'owner',
    });
    return { token, role: 'owner' };
  }

  public async switchToOwner(userId: string) {
    await this.ownerService.findOwnerByClientId(userId);
    const token = await this.tokenService.generateToken({
      userId,
      role: 'owner',
    });
    return { token, role: 'owner' };
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
