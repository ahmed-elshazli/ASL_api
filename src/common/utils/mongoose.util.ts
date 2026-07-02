import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid user id');
  }

  return new Types.ObjectId(id);
}

export function buildUserIdMatch(userId: Types.ObjectId): {
  $or: [{ userId: Types.ObjectId }, { userId: string }];
} {
  return {
    $or: [
      { userId },
      { userId: userId.toString() },
    ],
  };
}