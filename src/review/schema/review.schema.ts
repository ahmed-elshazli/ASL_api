import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/users/schema/users.schema';

export type WebsiteReviewDocument = HydratedDocument<WebsiteReview>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class WebsiteReview {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
    index: true,
  })
  user: Types.ObjectId;

  @Prop({
    required: true,
    min: 1,
    max: 5,
  })
  rating: number;

  @Prop({
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 1000,
  })
  comment: string;

  @Prop({
    default: false,
  })
  isPublished: boolean;


}

export const WebsiteReviewSchema =
  SchemaFactory.createForClass(WebsiteReview);

/**
 * Indexes
 */


// Sort latest reviews
WebsiteReviewSchema.index({
  createdAt: -1,
});

// Filter by rating
WebsiteReviewSchema.index({
  rating: 1,
});

// Admin dashboard
WebsiteReviewSchema.index({
  isPublished: 1,
  createdAt: -1,
});