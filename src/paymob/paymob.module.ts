import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PaymobService } from './paymob.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [PaymobService],
  exports: [PaymobService],
})
export class PaymobModule {}