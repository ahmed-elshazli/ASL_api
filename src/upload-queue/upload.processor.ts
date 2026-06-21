import {
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Exercise,
  ExerciseDocument,
} from '../exercises/schemas/exercise.schema';

import { UploadService } from 'src/common/storage/upload.service';

interface QueueFile {
  buffer: {
    type: string;
    data: number[];
  };
  mimetype: string;
}

@Processor('image-upload')
@Injectable()
export class UploadProcessor extends WorkerHost {
  private readonly logger = new Logger(UploadProcessor.name);

  constructor(
    private readonly uploadService: UploadService,
    @InjectModel(Exercise.name)
    private readonly exerciseModel: Model<ExerciseDocument>,
  ) {
    super();
  }

  async process(
    job: Job<{
      exerciseId: string;
      files: QueueFile[];
    }>,
  ): Promise<{ success: boolean; count: number }> {
    const { exerciseId, files } = job.data;

    this.logger.log(`Starting upload job ${job.id}`);

    try {
      await this.updateStatus(exerciseId, 'processing');

      if (!files?.length) {
        await this.updateStatus(exerciseId, 'completed');
        return { success: true, count: 0 };
      }

      const buffers = files.map((file) =>
        Buffer.from(file.buffer.data),
      );

      // 🔥 SAFE parallel upload with concurrency control
      const images = await this.uploadInBatches(
        buffers,
        files,
        exerciseId,
      );

      const updated = await this.exerciseModel.findByIdAndUpdate(
        exerciseId,
        {
          images,
          uploadStatus: 'completed',
        },
        { returnDocument: 'after' },
      );

      if (!updated) {
        throw new NotFoundException('Exercise not found');
      }

      this.logger.log(`Job ${job.id} completed`);

      return {
        success: true,
        count: images.length,
      };
    } catch (error: any) {
      this.logger.error(
        `Job ${job.id} failed`,
        error?.stack || error,
      );

      await this.updateStatus(exerciseId, 'failed');

      throw error;
    }
  }

  // 🔥 controlled concurrency (prevents Cloudinary overload)
private async uploadInBatches(
  buffers: Buffer[],
  files: QueueFile[],
  exerciseId: string,
): Promise<string[]> {
  const results: string[] = [];

  const CONCURRENCY = 3;

  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const chunkFiles = files.slice(i, i + CONCURRENCY);

    // convert chunk only to Express.Multer.File[]
    const multerFiles = chunkFiles.map((file) => ({
      fieldname: 'images',
      originalname: 'queue-image',
      encoding: '7bit',
      mimetype: file.mimetype,
      buffer: Buffer.from(file.buffer.data),
      size: file.buffer.data.length,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    })) as Express.Multer.File[];

    const uploaded = await this.uploadService.upload(multerFiles);

    results.push(...uploaded);
  }

  return results;
}

  private async updateStatus(
    exerciseId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
  ) {
    const result = await this.exerciseModel.findByIdAndUpdate(
      exerciseId,
      { uploadStatus: status },
    );

    if (!result) {
      throw new NotFoundException('Exercise not found');
    }
  }
}