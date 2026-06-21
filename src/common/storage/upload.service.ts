import { Injectable, BadRequestException } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ALLOWED_IMAGE_TYPES } from './constants/allowed-file-types.constant';

@Injectable()
export class UploadService {
  constructor(private readonly storageService: StorageService) {}

  //  Multi files upload
  async upload(files: Express.Multer.File[]): Promise<string[]> {
    if (!files?.length) {
      throw new BadRequestException('At least one image is required');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 images allowed');
    }

    return this.storageService.uploadMultiple(
      files,
      'locations',
      { allowedTypes: ALLOWED_IMAGE_TYPES },
    );
  }

  //  Single file upload
  async uploadSingle(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return this.storageService.uploadSingle(
      file,
      'locations',
      { allowedTypes: ALLOWED_IMAGE_TYPES },
    );
  }

  //  Replace multiple
  async replace(oldImages: string[], newFiles?: Express.Multer.File[]) {
  if (!newFiles?.length) return oldImages;

  const uploaded = await this.upload(newFiles);

  await this.deleteImages(oldImages);

  return uploaded;
}

  //  Delete multiple
  async deleteImages(imageUrls: string[]) {
    if (!imageUrls?.length) return;

    await Promise.all(
      imageUrls.map((url) =>
        this.storageService.delete(this.extractPublicId(url)),
      ),
    );
  }

  //  Extract public ID from URL
  private extractPublicId(url: string): string {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    const relevantParts = parts.slice(uploadIndex + 2);

    return relevantParts.join('/').replace(/\.[^/.]+$/, '');
  }
}