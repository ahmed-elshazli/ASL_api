import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
  Patch,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiBearerAuth,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { BuildQueryDto } from '../common/dto/base-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {  CurrentUserId } from 'src/common/decorators/current-user.decorator';
import { UserRole } from './enums/roles.enum';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Users')
@ApiBearerAuth()
@Roles(UserRole.ADMIN,UserRole.DOCTOR)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiOperation({ summary: 'create new user' })
  @ApiCreatedResponse({ description: 'User created successfully' })
  @Post('create')
  @UseInterceptors(FilesInterceptor('images', 1))
  create(
    @Body() dto: CreateUserDto,
    
  ) {
    return this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ description: 'List of users' })
  // @SkipThrottle()
  @Get()
  async findAll(@Query() query: BuildQueryDto) {
    return this.usersService.findAll(query);
  }
  @ApiOperation({ summary: 'Change user password' })
  @ApiOkResponse({ description: 'Password changed  successfully' })
 @Roles(UserRole.ADMIN,UserRole.DOCTOR,UserRole.PATIENT)
  @Patch('change-password')
  async changePassword(
     @CurrentUserId() userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({ type: UserResponseDto })
  @Get(':id')
  async findOne(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({ type: UserResponseDto })
  @UseInterceptors(FilesInterceptor('images', 2))
  @Roles(UserRole.ADMIN,UserRole.DOCTOR,UserRole.PATIENT)
  @Patch('update-profile')
  async update(
    @CurrentUserId() id: string,
    @Body() dto: UpdateUserDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(id, dto, files);
  }

  @ApiOperation({ summary: 'Deactivate || Reactive user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({ description: 'User deactivated ||Reactive successfully' })
  @Patch(':id/activations')
  async deactivateUser(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.toggleUserActive(id);
  }

  @ApiOperation({ summary: 'Delete user permanently' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({ description: 'User deleted successfully' })
  
  @Delete(':id/delete')
  async softDelete(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.softDelete(id);
  }
}
