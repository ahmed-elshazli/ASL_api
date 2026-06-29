import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { WebsiteReviewService } from './review.service';
import { CreateWebsiteReviewDto } from './dto/create-review.dto';
import { UpdateWebsiteReviewDto } from './dto/update-review.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';

import {
  CurrentUserId,
} from 'src/common/decorators/current-user.decorator';

import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/roles.enum';

import { ParseObjectIdPipe } from '@nestjs/mongoose';

@ApiTags('Reviews')
@Controller('reviews')
export class WebsiteReviewController {
  constructor(
    private readonly websiteReviewService: WebsiteReviewService,
  ) {}

  // =========================
  // Create Review
  // =========================
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a website review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @Post()
  create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateWebsiteReviewDto,
  ) {
    return this.websiteReviewService.create(userId, dto);
  }

  // =========================
  // Get My Review
  // =========================
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get logged-in user review' })
  @ApiResponse({ status: 200 })
  @Get('me')
  findMyReview(@CurrentUserId() userId: string) {
    return this.websiteReviewService.findMyReview(userId);
  }

  // =========================
  // Update My Review
  // =========================
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update logged-in user review' })
  @ApiResponse({ status: 200, description: 'Review updated' })
  @Patch('update')
  update(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateWebsiteReviewDto,
  ) {
    return this.websiteReviewService.update(userId, dto);
  }

  // =========================
  // Delete My Review
  // =========================
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete logged-in user review' })
  @ApiResponse({ status: 200, description: 'Review deleted' })
  @Delete('me')
  remove(@CurrentUserId() userId: string) {
    return this.websiteReviewService.remove(userId);
  }

  // =========================
  // Toggle Publish (Admin)
  // =========================
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle publish status (Admin)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200 })
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Patch(':id/toggle-publish')
  togglePublish(
    @Param('id', ParseObjectIdPipe) reviewId: string,
  ) {
    return this.websiteReviewService.togglePublish(reviewId);
  }

  // =========================
  // Get All Reviews (Admin)
  // =========================
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reviews (Admin)' })
  @ApiResponse({ status: 200 })
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Get()
  findAll(@Query() query: BuildQueryDto) {
    return this.websiteReviewService.findAll(query);
  }

  // =========================
  // Get Published Reviews (Public)
  // =========================
  @Public()
  @ApiOperation({ summary: 'Get published reviews (Public)' })
  @ApiResponse({ status: 200 })
  @Get('published')
  findAllPublished(@Query() query: BuildQueryDto) {
    return this.websiteReviewService.findAllPublished(query);
  }

  // =========================
  // Statistics
  // =========================
  @Public()
  @ApiOperation({ summary: 'Get reviews statistics' })
  @ApiResponse({ status: 200 })
  @Get('statistics')
  getStatistics() {
    return this.websiteReviewService.getStatistics();
  }
}