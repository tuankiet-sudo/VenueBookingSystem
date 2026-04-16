import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { UpdateOwnerDto, UpdateUserDto, UserProfileDto } from './user.dto';
import { AdminGuard, AuthGuard, OwnerGuard } from '../auth/guards';
import { User } from '../auth/decorators';
import { OwnerService } from './services';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly ownerService: OwnerService,
  ) {}

  @Patch('/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@User() user: Express.User, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(user.userId, updateUserDto);
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@User() user: Express.User) {
    if (user.role === 'client') {
      return this.userService.findUserById(user.userId);
    } else {
      return this.userService.findOwnerByUserId(user.userId);
    }
  }

  @Patch('/owner/me')
  @UseGuards(OwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update owner profile' })
  @ApiResponse({
    status: 200,
    description: 'Owner profile updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  updateOwner(@User() user: Express.User, @Body() dto: UpdateOwnerDto) {
    return this.ownerService.updateOwner(user.userId, dto);
  }

  @Get('/list')
  @UseGuards(AdminGuard)
  async getUsers(
    @Query('status') isActive?: string,
    @Query('role') role?: string,
  ) {
    const data = this.userService.getUsers(isActive, role);
    return data;
  }
}
