import {
  Injectable,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import * as storageProviderInterface from './interfaces/storage-provider.interface';
import { fileTypeFromBuffer } from 'file-type';

@Injectable()
export class StorageService {
  constructor(
    @Inject('STORAGE_PROVIDER')
    private readonly provider: storageProviderInterface.IStorageProvider,
  ) {}

  private readonly allowedFolders = ['users', 'locations', 'projects','messages'];

  /**
   * Validate folder
   */
  private validateFolder(folder: string) {
    if (!this.allowedFolders.includes(folder)) {
      throw new BadRequestException('Invalid upload folder');
    }
  }

  /**
   *  REAL file validation (not mimetype)
   */
  private async validateFile(
    file: Express.Multer.File,
    allowedTypes?: string[],
  ) {
    const detected = await fileTypeFromBuffer(file.buffer);

    if (!detected) {
      throw new BadRequestException('Invalid file');
    }

    const defaultTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    const allowed = allowedTypes ?? defaultTypes;

    if (!allowed.includes(detected.mime)) {
      throw new BadRequestException(
        `Unsupported file type: ${detected.mime}`,
      );
    }
  }

  async uploadSingle(
    file: Express.Multer.File,
    folder: string,
    options?: {
      isPrivate?: boolean;
      allowedTypes?: string[];
    },
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.validateFolder(folder);
    await this.validateFile(file, options?.allowedTypes);

    return this.provider.upload(
      file.buffer,
      file.mimetype,
      folder,
      { isPrivate: options?.isPrivate },
    );
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder: string,
    options?: {
      isPrivate?: boolean;
      allowedTypes?: string[];
    },
  ): Promise<string[]> {
    if (!files?.length) {
      throw new BadRequestException('No files uploaded');
    }

    this.validateFolder(folder);

 const uploads = await Promise.all(
  files.map(async (file, index) => {
    console.time(`Upload ${index}`);

    await this.validateFile(file, options?.allowedTypes);

    const result = await this.provider.upload(
      file.buffer,
      file.mimetype,
      folder,
      { isPrivate: options?.isPrivate },
    );

    console.timeEnd(`Upload ${index}`);

    return result;
  }),
);

    return uploads;
  }

  async delete(publicId: string) {
    if (!this.provider.delete) {
      throw new Error('Delete not supported');
    }

    return this.provider.delete(publicId);
  }

  async getSignedUrl(publicId: string) {
    if (!this.provider.getSignedUrl) {
      throw new Error('Signed URLs not supported');
    }

    return this.provider.getSignedUrl(publicId);
  }
}