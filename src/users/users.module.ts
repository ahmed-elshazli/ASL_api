import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schema/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { UsersRepository } from './repositories/user.repository';
import { USERS_REPOSITORY } from './repositories/users.repository.interface';
import { WeightLogModule } from 'src/weight-log/weight-log.module';
import { AuthModule } from 'src/auth/auth.module';
import { StorageModule } from 'src/common/storage/storage.module';

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
         AuthModule,
         StorageModule,

  ],
  controllers: [UsersController],
  providers: [UsersService,   UsersRepository,
    {
      provide: USERS_REPOSITORY,  
      useClass: UsersRepository,
    },]
})
export class UserModule {}
