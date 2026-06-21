import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserTrainingProgram,
  UserTrainingProgramDocument,
} from './schemas/user-training-program.schema';
import { TrainingProgram } from '../training-program/schemas/training-program.schema';
import { User } from 'src/users/schema/users.schema';
import { AssignProgramDto } from './dto/create-user-training-program.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';

@Injectable()
export class UserTrainingProgramService {
  constructor(
    @InjectModel(UserTrainingProgram.name)
    private readonly utpModel: Model<UserTrainingProgramDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(TrainingProgram.name)
    private readonly programModel: Model<TrainingProgram>,
  ) {}

  async assignPrograms(dto: AssignProgramDto) {
    const { userId, programIds } = dto;

    // 1) Validate user exists
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    // 2) Validate programs exist
    const programs = await this.programModel.find({
      _id: { $in: programIds },
    });

    if (programs.length !== programIds.length) {
      throw new BadRequestException('Some programs not found');
    }

    // 3) Avoid duplicates
    const existing = await this.utpModel.find({
      userId,
      programId: { $in: programIds },
    });

    const existingSet = new Set(
      existing.map((e) => e.programId.toString()),
    );

    // 4) Prepare new relations
    const toInsert = programIds
      .filter((id) => !existingSet.has(id))
      .map((programId) => ({
        userId,
        programId,
        assignedAt: new Date(),
      }));

    // 5) Bulk insert
    if (toInsert.length > 0) {
      await this.utpModel.insertMany(toInsert);
    }

    return {
      message: 'Programs assigned successfully',
      assigned: toInsert.length,
    };
  }

 







  async getUserPrograms(userId: string) {
    return this.utpModel
      .find({ userId })
      .populate('programId')
      .lean();
  }

  // get all users assigned to a program
  async getProgramUsers(programId: string) {
    return this.utpModel
      .find({ programId })
      .populate('userId')
      .lean();
  }

  async removeProgram(userId: string, programId: string) {
    const result = await this.utpModel.findOneAndDelete({
      userId,
      programId,
    });

    if (!result) {
      throw new BadRequestException('Assignment not found');
    }

    return { message: 'Program removed from user' };
  }
}