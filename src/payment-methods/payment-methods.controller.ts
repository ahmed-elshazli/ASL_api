import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/roles.enum';

@ApiTags('Payment Methods')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new payment method',
  })

  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodsService.create(createPaymentMethodDto);
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @Get()
  @ApiOperation({
    summary: 'Get all active payment methods',
  })

  findAll() {
    return this.paymentMethodsService.findAll();
  }

  @Get('admin')
  @ApiOperation({
    summary: 'Get all payment methods for admin',
  })

  findAllForAdmin() {
    return this.paymentMethodsService.findAllForAdmin();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get payment method by id',
  })

  findOne(@Param('id') id: string) {
    return this.paymentMethodsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update payment method',
  })

  update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.update(id, updatePaymentMethodDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({
    summary: 'Activate or deactivate payment method',
  })

  toggleStatus(@Param('id') id: string) {
    return this.paymentMethodsService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete payment method',
  })

  remove(@Param('id') id: string) {
    return this.paymentMethodsService.remove(id);
  }
}