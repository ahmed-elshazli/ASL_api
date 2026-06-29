import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';


import { CreateWebsiteReviewDto } from './dto/create-review.dto';
import { WebsiteReview, WebsiteReviewDocument } from './schema/review.schema';
import { UpdateWebsiteReviewDto } from './dto/update-review.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { ApiFeatures } from 'src/common/utils/api-features';


@Injectable()
export class WebsiteReviewService {
  constructor(
    @InjectModel(WebsiteReview.name)
    private readonly reviewModel: Model<WebsiteReviewDocument>,
  ) {}

  /**
   * Create Review
   */
  async create(
    userId: string,
    dto: CreateWebsiteReviewDto,
  ): Promise<WebsiteReview> {
    const exists = await this.reviewModel.exists({
      user: new Types.ObjectId(userId),
    });

    if (exists) {
      throw new ConflictException(
        'You have already submitted a review.',
      );
    }

    return this.reviewModel.create({
      user: userId,
      ...dto,
    });
  }

  /**
   * Get All Published Reviews
   */
  async findAll(query:BuildQueryDto) {
    const baseQuery =this.reviewModel
      .find() .populate('user', 'fullName email image').lean();
          const features = new ApiFeatures(baseQuery, query)
            .filter()
            .search(['rating', 'description']);
      
        
            const total = await features.count();
      
          features.sort().limitFields().paginate(total);
      
          const data = await features.exec();
      
          return {
            results: data.length,
            pagination: features.paginationResult,
            data,
          };
    
      
     
   
  }

  /**
   * Get All Published Reviews
   */

   async findAllPublished(query:BuildQueryDto) {
    const baseQuery =this.reviewModel
      .find({isPublished:true}).populate('user', 'fullName email image').lean();
          const features = new ApiFeatures(baseQuery, query)
            .filter()
            .search(['rating', 'description']);
      
        
            const total = await features.count();
      
          features.sort().limitFields().paginate(total);
      
          const data = await features.exec();
      
          return {
            results: data.length,
            pagination: features.paginationResult,
            data,
          };
  }

  /**
   * Get Logged User Review
   */
  async findMyReview(
    userId: string
  ) {
    return this.reviewModel
      .findOne({
        user: userId,
      })
      .populate('user', 'fullName email image')
      .lean();
  }

  /**
   * Update Review
   */
  async update(
    userId: string,
    dto: UpdateWebsiteReviewDto,
  ): Promise<WebsiteReview> {
    const review = await this.reviewModel.findOneAndUpdate(
      {
        user: userId,
      },
      dto,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    return review;
  }

async togglePublish(reviewId: string) {
  const review = await this.reviewModel.findById(reviewId).select('isPublished');

  if (!review) {
    throw new NotFoundException('Review not found.');
  }

  return this.reviewModel.findByIdAndUpdate(
    reviewId,
    {
      isPublished: !review.isPublished,
    },
    {
      new: true,
      runValidators: true,
    },
  );
}

  /**
   * Delete Review
   */
  async remove(userId: string): Promise<void> {
    const result = await this.reviewModel.findOneAndDelete({
      user: userId,
    });

    if (!result) {
      throw new NotFoundException('Review not found.');
    }
  }

  /**
   * Reviews Statistics
   */
async getStatistics() {
  const [stats] = await this.reviewModel.aggregate([
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const result = stats ?? {
    averageRating: 0,
    totalReviews: 0,
  };

  return {
    averageRating: Number(result.averageRating.toFixed(2)),
    totalReviews: result.totalReviews,
  };
}
}