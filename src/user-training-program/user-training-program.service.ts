import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserProgramStatus,
  UserTrainingProgram,
  UserTrainingProgramDocument,
} from './schemas/user-training-program.schema';
import { TrainingProgram } from '../training-program/schemas/training-program.schema';
import { User } from 'src/users/schema/users.schema';
import { AssignProgramDto } from './dto/create-user-training-program.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { ApiFeatures } from 'src/common/utils/api-features';
import { CompleteExerciseDto } from './dto/complete-exercise.dto';

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

  async assignProgram(dto: AssignProgramDto): Promise<UserTrainingProgram> {
    const { userId, programId, durationInDays, repeatCount } = dto;

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const program = await this.programModel.findById(programId);
    if (!program) throw new NotFoundException('Program not found');

    const existing = await this.utpModel.findOne({
      userId,
      programId,
      status: UserProgramStatus.ACTIVE,
    });

    if (existing) throw new BadRequestException('Program already active');

    const startedAt = new Date();
    const endDate = new Date(startedAt);
    endDate.setDate(endDate.getDate() + durationInDays);

    return await this.utpModel.create({
      userId,
      programId,
      durationInDays,
      repeatCount,
      totalExercises: program.exercises.length,
      currentRound: 0,
      startedAt,
      endDate,
    });
  }

  async findAll(query: BuildQueryDto) {
    const baseQuery = this.utpModel.find().lean();

    const features = new ApiFeatures(baseQuery, query).filter();

    const total = await features.count();

    features.sort().limitFields().paginate(total);

    const data = await features.exec();

    return {
      results: data.length,
      pagination: features.paginationResult,
      data,
    };
  }

async getUserPrograms(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
    throw new BadRequestException('Invalid userId');
  }

  const result = await this.utpModel
    .find({ userId: userId.toString() })
    .populate({
      path: 'programId',
      populate: {
        path: 'exercises.exerciseId',
        model: 'Exercise',
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  return result;
}

  async getProgramUsers(programId: string) {
    if (!Types.ObjectId.isValid(programId)) {
      throw new BadRequestException('Invalid programId');
    }
   const result= await  this.utpModel.find({ programId }).populate('userId','fullName email phone').sort({ createdAt: -1 }).lean();
    return result

  }

  async deleteUserProgram(userId: string, programId: string) {
    const assignment = await this.utpModel.findOne({ userId, programId });

    if (!assignment) throw new NotFoundException('Program assignment not found');

    if (assignment.status === UserProgramStatus.COMPLETED) {
      throw new BadRequestException('Cannot delete a completed program');
    }

    await this.utpModel.deleteOne({ _id: assignment._id });

    return { message: 'Program removed successfully from user' };
  }

async completeExercise(
  programId: string,
  userId: string,
  dto: CompleteExerciseDto,
) {


  const program = await this.utpModel.findOne({
    _id:programId,
    userId:userId.toString(),
    status: UserProgramStatus.ACTIVE,
  });



  if (!program) {
    throw new NotFoundException('Program not found or not active');
  }

  // Program expired
  if (new Date() > program.endDate) {
    program.status = UserProgramStatus.EXPIRED;
    await program.save();

    throw new BadRequestException('Program has expired');
  }

  // Prevent duplicate completion in the current round only
  const alreadyCompleted = program.completedExercises.some(
    (exercise) =>
      exercise.exerciseId.equals(dto.exerciseId) &&
      exercise.round === program.currentRound,
  );

  if (alreadyCompleted) {
    throw new BadRequestException(
      'Exercise already completed in this round',
    );
  }

  // Save completion history
  program.completedExercises.push({
    exerciseId: new Types.ObjectId(dto.exerciseId),
    round: program.currentRound,
    completedAt: new Date(),
  });

  // ==========================
  // Progress
  // ==========================

  const totalRequiredCompletions =
    program.totalExercises * program.repeatCount;

  const totalCompleted = program.completedExercises.length;

  program.progress =
    totalRequiredCompletions === 0
      ? 0
      : Math.round((totalCompleted / totalRequiredCompletions) * 100);

  // ==========================
  // Current Round Progress
  // ==========================

  const completedCurrentRound = program.completedExercises.filter(
    (exercise) => exercise.round === program.currentRound,
  ).length;

  const isCurrentRoundCompleted =
    completedCurrentRound === program.totalExercises;

  // ==========================
  // Next Round / Finish Program
  // ==========================

  if (isCurrentRoundCompleted) {
    const isLastRound =
      program.currentRound === program.repeatCount - 1;

    if (isLastRound) {
      program.status = UserProgramStatus.COMPLETED;
      program.completedAt = new Date();
      program.progress = 100;
    } else {
      program.currentRound += 1;
    }
  }

  await program.save();

  return {
    message: 'Exercise completed successfully',
    progress: program.progress,
    currentRound: program.currentRound,
    status: program.status,
  };
}
}