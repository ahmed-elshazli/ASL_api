import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';

interface QueueFile {
  buffer: Buffer;
  mimetype: string;
}

interface UploadJobData {
  exerciseId: string;
  files: QueueFile[];
}

@Injectable()
export class UploadQueueService {
  private readonly logger = new Logger(UploadQueueService.name);

  private readonly jobOptions: JobsOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  };

  constructor(
    @InjectQueue('image-upload')
    private readonly uploadQueue: Queue<UploadJobData>,
  ) {}

  async addUploadJob(
    exerciseId: string,
    files: Express.Multer.File[],
  ): Promise<void> {
    if (!files?.length) {
      this.logger.debug(`No files provided for exercise ${exerciseId}`);
      return;
    }

    const jobId = `exercise-${exerciseId}`;

    const existingJob = await this.uploadQueue.getJob(jobId);

    if (existingJob) {
      const state = await existingJob.getState();

      if (state === 'active' || state === 'waiting' || state === 'delayed') {
        this.logger.warn(
          `Duplicate upload job skipped for exercise ${exerciseId}`,
        );
        return;
      }
    }

    const jobData: UploadJobData = {
      exerciseId,
      files: files.map((file) => ({
        buffer: file.buffer,
        mimetype: file.mimetype,
      })),
    };

    const job = await this.uploadQueue.add(
      'upload-exercise-images',
      jobData,
      {
        ...this.jobOptions,
        jobId, // important deduplication key
      },
    );

    this.logger.log(
      `Upload job created | JobID: ${job.id} | ExerciseID: ${exerciseId}`,
    );
  }
}