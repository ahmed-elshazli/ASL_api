import { PartialType } from '@nestjs/swagger';
import { CreateWebsiteReviewDto } from './create-review.dto';

export class UpdateWebsiteReviewDto  extends PartialType(CreateWebsiteReviewDto ) {}
