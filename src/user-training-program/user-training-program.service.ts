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
    const { userId, programId } = dto;

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const program = await this.programModel.findById(programId);
    if (!program) throw new NotFoundException('Program not found');

    const existing = await this.utpModel.findOne({
      userId,
      programId,
      status: UserProgramStatus.ACTIVE,
    });

    if (existing) {
      throw new BadRequestException('Program already active');
    }

    return await this.utpModel.create({
      ...dto,
      totalExercises: program.exercises.length,
    });
  }

  async findAll(query:BuildQueryDto){

     const baseQuery = this.utpModel.find().lean();
    
        const features = new ApiFeatures(baseQuery, query)
          .filter()
          
    
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


  return this.utpModel
    .find({ userId :new Types.ObjectId(userId)})
    .populate('programId')
    .lean();
}
  // get all users assigned to a program
  async getProgramUsers(programId: string) {

    

  if (!Types.ObjectId.isValid(programId)) {
    throw new BadRequestException('Invalid programId');
  }
    
    return this.utpModel.find({ programId }).populate('userId').lean();
  }




  async deleteUserProgram(userId: string, programId: string) {
  const assignment = await this.utpModel.findOne({
    userId,
    programId,
  });

  if (!assignment) {
    throw new NotFoundException('Program assignment not found');
  }

  // optional safety: prevent deleting completed program
  if (assignment.status === UserProgramStatus.COMPLETED) {
    throw new BadRequestException(
      'Cannot delete a completed program',
    );
  }

  await this.utpModel.deleteOne({
    _id: assignment._id,
  });

  return {
    message: 'Program removed successfully from user',
  };
}
}
