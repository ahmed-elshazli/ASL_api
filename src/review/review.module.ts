import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  WebsiteReview,
  WebsiteReviewSchema,
} from './schema/review.schema';

import { WebsiteReviewService } from './review.service';
import { WebsiteReviewController } from './review.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WebsiteReview.name,
        schema: WebsiteReviewSchema,
      },
    ]),
  ],
  controllers: [WebsiteReviewController],
  providers: [WebsiteReviewService],

})
export class ReviewsModule {}