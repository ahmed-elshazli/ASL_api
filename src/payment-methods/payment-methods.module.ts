import { Module } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethod, PaymentMethodSchema } from './schemas/payment-method.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
    MongooseModule.forFeature([
      {
        name: PaymentMethod.name,
        schema: PaymentMethodSchema,
      },
    ]),
  ],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
