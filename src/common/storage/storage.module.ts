import { Module, Global } from '@nestjs/common';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { StorageService } from './storage.service';
import { ExistsValidator } from '../validators/id-exists.validator';
import { UploadService } from './upload.service';

@Global()
@Module({
  providers: [
    {
      provide: 'STORAGE_PROVIDER',
      useClass: CloudinaryProvider,
    },
    StorageService,
    ExistsValidator,
    UploadService
  ],
  exports: [StorageService,UploadService],
})
export class StorageModule {}