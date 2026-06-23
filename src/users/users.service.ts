import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { USERS_REPOSITORY } from './repositories/users.repository.interface';
import type { IUsersRepository } from './repositories/users.repository.interface';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { BuildQueryDto } from '../common/dto/base-query.dto';
import type { CreateUserDto } from './dto/create-user.dto';
import type { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UploadService } from 'src/common/storage/upload.service';
import { generateTokens } from 'src/common/utils/generate-token';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto } from './dto/response.dto';
import { WeightLogService } from 'src/weight-log/weight-log.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly imageService: UploadService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
     private readonly weightLogService: WeightLogService,
  ) {}

  async create(
    dto: CreateUserDto,
  ): Promise<AuthResponseDto> {
    // 1. Check if user exists
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }


    const user = await this.usersRepository.create(dto);
    await this.weightLogService.create(
  user._id.toString(),
  user.weight,
);
  

    // 3.Generate tokens
    const tokens = await generateTokens(
      user._id.toString(),
      user.role,
      this.jwtService,
      this.configService,
    );
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 12);
    await this.usersRepository.updateById(user._id.toString(), {
      refreshToken: hashedRefreshToken,
    });

    // 6. Return response
    return {
      user: UserResponseDto.fromEntity(user),
      accessToken: tokens.accessToken,
    };
  }

  async findAll(query: BuildQueryDto) {
    const { results, pagination, data } =
      await this.usersRepository.findAll(query);

    return {
      results,
      pagination,
      data: data.map((user) => UserResponseDto.fromEntity(user)),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user)
      throw new NotFoundException(`No active user found with id: ${id}`);

    return UserResponseDto.fromEntity(user);
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    files?: Express.Multer.File[],
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);

    if (!user)
      throw new NotFoundException(`No active user found with id: ${id}`);

    if (dto.email) {
      const emailTaken = await this.usersRepository.findByEmailExcludingId(
        dto.email,
        id,
      );

      if (emailTaken) throw new ConflictException('Email already used');
    }

    if (files?.length) {
      dto['images'] = await this.imageService.replace(user.images, files);
    }

    if (
  dto.weight !== undefined &&
  dto.weight !== user.weight
) {
  await this.weightLogService.create(
    user._id.toString(),
    dto.weight,
  );
}

    const updated = await this.usersRepository.updateById(
      user._id.toString(),
      dto,
    );

    if (!updated) {
      throw new NotFoundException('User not found during update');
    }

    return UserResponseDto.fromEntity(updated);
  }

  async toggleUserActive(
    userId: string,
  ): Promise<{ message: string; isActive: boolean }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.isActive) {
      user.isActive = false;
      user.refreshToken = undefined;
      await this.usersRepository.save(user);
      return { message: 'User deactivated successfully', isActive: false };
    }

    user.isActive = true;
    await this.usersRepository.save(user);
    return { message: 'User activated successfully', isActive: true };
  }

  async hardDelete(id: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    await this.imageService.deleteImages(user.images);
    await this.usersRepository.deleteOne(user);

    return { message: 'User deleted permanently' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepository.findByIdWithPassword(userId);
    if (!user) throw new NotFoundException(`User not found with id: ${userId}`);

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new ForbiddenException('Current password is incorrect');

    if (dto.password !== dto.confirmPassword) {
      throw new ForbiddenException('Password and confirm password must match');
    }

    user.password = dto.password;
    await this.usersRepository.save(user);

    const newTokens = await generateTokens(
      user._id.toString(),
      user.role,
      this.jwtService,
      this.configService,
    );

   const hashedRefreshToken = await bcrypt.hash(newTokens.refreshToken, 12);
    await this.usersRepository.updateById(user._id.toString(), {
      refreshToken: hashedRefreshToken,
    });

    return {
      message: 'Password changed successfully',
      newTokens: {
        accessToken: newTokens.accessToken,
      },
    };
  }
}
