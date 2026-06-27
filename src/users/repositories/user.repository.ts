import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '../schema/users.schema';
import type {
  IUsersRepository,
  PaginatedUsers,
} from './users.repository.interface';
import type { BuildQueryDto } from '../../common/dto/base-query.dto';
import { ApiFeatures } from '../../common/utils/api-features';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // ── Queries ────────────────────────────────────────────────

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).lean();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').lean();
  }

  async findByEmailExcludingId(
    email: string,
    excludeId: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, _id: { $ne: excludeId } }).lean();
  }

 async findById(id: string): Promise<UserDocument | null> {
  return this.userModel.findOne({
    _id: id,
    isActive: true,
  });
}

  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+password').lean();
  }

  async findAll(query: BuildQueryDto): Promise<PaginatedUsers> {
    const features = new ApiFeatures(this.userModel.find().lean(), query)
      .filter()
      .search(['email', 'fullName']);

    const total = await features.count();
    features.sort().limitFields().paginate(total);

    const data = await features.exec();

    return {
      results: data.length,
      pagination: features.paginationResult,
      data,
    };
  }

  // ── Mutations ──────────────────────────────────────────────

  async create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data);
  }


  async updateById(id: string, data: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
      runValidators: true,
    }).exec();
  }
  async save(doc: UserDocument): Promise<UserDocument> {
    return doc.save();
  }

  async deleteOne(doc: UserDocument): Promise<void> {
    await doc.deleteOne();
  }
}
