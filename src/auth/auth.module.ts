
import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';

import { User, UserSchema } from '../users/schema/users.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { UploadService } from 'src/common/storage/upload.service';
import { UsersRepository } from 'src/users/repositories/user.repository';
import { USERS_REPOSITORY } from 'src/users/repositories/users.repository.interface';
import { MailModule } from 'src/mail/mail.module';
import { TokenService } from './services/token.service';
import { AuthSessionService } from './services/auth-session.service';
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

    MailModule,
    StorageModule,
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy,UsersRepository,TokenService,AuthSessionService,
     {
      provide: USERS_REPOSITORY,  
      useClass: UsersRepository,
    },
  ],

  exports: [AuthService, JwtModule,TokenService,AuthSessionService],
})
export class AuthModule {}
