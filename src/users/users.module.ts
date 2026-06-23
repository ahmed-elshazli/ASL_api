import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schema/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadService } from 'src/common/storage/upload.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { UsersRepository } from './repositories/user.repository';
import { USERS_REPOSITORY } from './repositories/users.repository.interface';
import { WeightLogService } from 'src/weight-log/weight-log.service';
import { WeightLogModule } from 'src/weight-log/weight-log.module';

@Module({
  imports: [
        MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      
    ]),
    
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService): JwtModuleOptions => ({
            secret: config.getOrThrow<string>('jwt.access.secret'),
    
            signOptions: {
              expiresIn:
                config.getOrThrow<StringValue>('jwt.access.expiresIn'),
            },
          }),
        }),

         WeightLogModule, 
  ],
  controllers: [UsersController],
  providers: [UsersService,UploadService,   UsersRepository,
    {
      provide: USERS_REPOSITORY,  
      useClass: UsersRepository,
    },]
})
export class UserModule {}
