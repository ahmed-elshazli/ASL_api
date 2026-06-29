import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
} from './schema/subscription-plan.schema';
import { Model } from 'mongoose';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { ApiFeatures } from 'src/common/utils/api-features';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    @InjectModel(SubscriptionPlan.name)
    private readonly subscriptionPlanModel: Model<SubscriptionPlanDocument>,
  ) {}

  async create(dto: CreateSubscriptionPlanDto) {
    const exists = await this.subscriptionPlanModel.exists({
      name: dto.name,
    });

    if (exists) {
      throw new ConflictException('Subscription plan already exists');
    }

    const plan = await this.subscriptionPlanModel.create(dto);

    return plan;
  }

  async findAll(query: BuildQueryDto) {
    const baseQuery = this.subscriptionPlanModel.find().lean();

    const features = new ApiFeatures(baseQuery, query)
      .filter()
      .search(['name', 'description']);

    const total = await features.count();

    features.sort().limitFields().paginate(total);

    const data = await features.exec();

    return {
      results: data.length,
      pagination: features.paginationResult,
      data,
    };
  }

  async findOne(id: string) {
    const plan = await this.subscriptionPlanModel.findById(id).lean();

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  async update(id: string, dto: UpdateSubscriptionPlanDto) {
    await this.findOne(id);

    if (dto.name) {
      const exists = await this.subscriptionPlanModel.exists({
        name: dto.name,
        _id: { $ne: id },
      });

      if (exists) {
        throw new ConflictException('Subscription plan already exists');
      }
    }

    return this.subscriptionPlanModel.findByIdAndUpdate(id, dto, {
      returnDocument:"after",
      runValidators: true,
    }).lean();
  }


async toggleStatus(id: string) {
  const plan = await this.subscriptionPlanModel.findById(id);

  if (!plan) {
    throw new NotFoundException('Subscription plan not found');
  }

  plan.isActive = !plan.isActive;

  await plan.save();

  return {
    message: plan.isActive
      ? 'Subscription plan has been activated successfully.'
      : 'Subscription plan has been deactivated successfully.',
    data: plan,
  };
}

  async remove(id: string) {
    const plan = await this.subscriptionPlanModel.findById(id);

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    plan.isActive = false;

    await plan.save();

    return {
      message: 'Subscription plan has been deactivated',
    };
  }
}
