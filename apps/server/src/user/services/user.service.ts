import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserInterface } from '../user.interface';
import { LoginDto } from 'src/auth/auth.dto';
import * as bcrypt from 'bcrypt';
import { convertBinaryHexToUUID, convertUUIDtoBinaryHex } from 'src/utils';
import { User } from '../entities';
import { UpdateUserDto } from '../user.dto';

@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) {}

  public async createUser(userData: CreateUserInterface) {
    const { email, password, DoB, firstName, lastName } = userData;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const { v4 : uuidv4 } = await import('uuid');
    const userId = uuidv4();
    await this.databaseService.execute(
      `
      CALL CreateUser(?, ?, ?, ?, ?, ?);
      `,
      [
        convertUUIDtoBinaryHex(userId),
        email,
        hashedPassword,
        firstName,
        lastName,
        new Date(DoB),
      ],
      {
        ER_DUP_ENTRY: () => {
          throw new ConflictException('Email already exist');
        },
      },
    );
    return userId;
  }

  public async validateLoginCredentials(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const result = await this.databaseService.execute<User>(
      `Call FindUserByEmail(?)`,
      [email],
    );
    if (result.length === 0) {
      throw new BadRequestException('User not found');
    }
    const user = result[0];
    const validatePassword = bcrypt.compareSync(password, user.password);
    if (!validatePassword) {
      throw new BadRequestException('Invalid credentials');
    }
    return user.id;
  }

  public async findUserById(userId: string): Promise<User> {
    console.log('Finding user by ID:', userId);
    const result = await this.databaseService.execute<User>(
      `CALL FindUserById(?)`,
      [convertUUIDtoBinaryHex(userId)],
    );
    if (result.length === 0) {
      throw new BadRequestException('User not found');
    }
    return result[0];
  }

  public async findOwnerByUserId(userId: string): Promise<User> {
    const result = await this.databaseService.execute<User>(
      `CALL FindOwnerByUserId(?)`,
      [convertUUIDtoBinaryHex(userId)],
    );
    if (result.length === 0) {
      throw new BadRequestException('Owner not found');
    }
    return result[0];
  }

  public async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<void> {
    const {
      firstName = null,
      lastName = null,
      phoneNumber = null,
      avatar = null,
      dob = null,
    } = updateUserDto;
    await this.databaseService.execute(
      `
      CALL UpdateUser(?, ?, ?, ?, ?, ?);
      `,
      [
        convertUUIDtoBinaryHex(userId),
        firstName,
        lastName,
        phoneNumber,
        avatar,
        dob,
      ],
    );
  }

  public async getUsers(status?: string, role?: string) {
    try {
      const result = await this.databaseService.execute(
        `CALL GetUsersByRoleAndStatus(?, ?)`,
        [
          role === undefined ? null : role,
          status === undefined ? null : status === 'active' ? 1 : 0,
        ],
      );
      return result;
    } catch {
      throw new BadRequestException('Error');
    }
  }
}
