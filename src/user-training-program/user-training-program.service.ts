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
    _id: new Types.ObjectId(programId),
    userId: new Types.ObjectId(userId),
    status: UserProgramStatus.ACTIVE,
  });

  if (!program)
    throw new NotFoundException('Program not found or not active');

  //  Expiry check
  if (new Date() > program.endDate) {
    program.status = UserProgramStatus.EXPIRED;
    await program.save();
    throw new BadRequestException('Program has expired');
  }

  //  prevent duplicate completion
  const alreadyDone = program.completedExercises.some(
    (e) => e.exerciseId.toString() === dto.exerciseId,
  );

  if (alreadyDone) {
    throw new BadRequestException('Exercise already completed');
  }

  //  add completion event (NO RESET EVER)
  program.completedExercises.push({
    exerciseId: new Types.ObjectId(dto.exerciseId),
    completedAt: new Date(),
  });

  // ================================
  // 📊 PROGRESS CALCULATION (FIXED)
  // ================================
  const totalProgramExercises =
    program.totalExercises * program.repeatCount;

  const completedSoFar =
    program.currentRound * program.totalExercises +
    program.completedExercises.length;

  program.progress =
    totalProgramExercises > 0
      ? Math.round((completedSoFar / totalProgramExercises) * 100)
      : 0;

  //  ROUND COMPLETION LOGIC (FIXED)
  const isRoundCompleted =
    program.completedExercises.length >= program.totalExercises;

  const isLastRound =
    program.currentRound >= program.repeatCount - 1;

  if (isRoundCompleted && !isLastRound) {
    program.currentRound += 1;

  }

  // ================================
  // 🏁 FINAL COMPLETION
  // ================================
  if (isRoundCompleted && isLastRound) {
    program.status = UserProgramStatus.COMPLETED;
    program.completedAt = new Date();
    program.progress = 100;
  }

  // 💾 SAVE
  await program.save();

  return {
    message: 'Exercise completed successfully',
    progress: program.progress,
    currentRound: program.currentRound,
    status: program.status,
  };
}
}