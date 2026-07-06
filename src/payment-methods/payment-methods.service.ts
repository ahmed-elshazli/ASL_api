import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  PaymentMethod,
  PaymentMethodDocument,
} from './schemas/payment-method.schema';

import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';


@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectModel(PaymentMethod.name)
    private readonly paymentMethodModel: Model<PaymentMethodDocument>,
  ) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto) {
    const exists = await this.paymentMethodModel.findOne({
      type: createPaymentMethodDto.type,
      accountNumber: createPaymentMethodDto.accountNumber,
    });

    if (exists) {
      throw new BadRequestException('Payment method already exists');
    }

    const paymentMethod = await this.paymentMethodModel.create(
      createPaymentMethodDto,
    );

    return {
      message: 'Payment method created successfully',
      paymentMethod,
    };
  }

  async findAll() {
    return await this.paymentMethodModel.find({ isActive: true }).lean();

  }

  async findAllForAdmin() {
    return await this.paymentMethodModel.find().lean();
  }

  async findOne(id: string) {
    const paymentMethod = await this.paymentMethodModel.findOne({
      _id: id,
     
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    return paymentMethod;
  }

  async update(id: string, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    const paymentMethod = await this.paymentMethodModel.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
      },
      updatePaymentMethodDto,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    return {
      message: 'Payment method updated successfully',
      paymentMethod,
    };
  }

  async toggleStatus(id: string) {
    const paymentMethod = await this.findOne(id);

    paymentMethod.isActive = !paymentMethod.isActive;

    await paymentMethod.save();

    return {
      message: `Payment method ${
        paymentMethod.isActive ? 'activated' : 'deactivated'
      } successfully`,
      paymentMethod,
    };
  }

  async remove(id: string) {
    const paymentMethod = await this.paymentMethodModel.findByIdAndDelete(id);
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    return {
      message: 'Payment method deleted successfully',
    };
  }
}
