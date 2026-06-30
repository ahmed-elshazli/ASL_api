import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StringValue } from 'ms';

import { UserRole } from 'src/users/enums/roles.enum';
import { BCRYPT_ROUNDS } from 'src/common/constants/security.constants';

type JwtPayload = {
  sub: string;
  role: UserRole;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAuthTokens(
    userId: string,
    role: UserRole,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: userId,
      role,
    };

    const accessSecret =
      this.configService.getOrThrow<string>('jwt.access.secret');

    const refreshSecret =
      this.configService.getOrThrow<string>('jwt.refresh.secret');

    const accessExpiresIn =
      this.configService.getOrThrow<StringValue>(
        'jwt.access.expiresIn',
      );

    const refreshExpiresIn =
      this.configService.getOrThrow<StringValue>(
        'jwt.refresh.expiresIn',
      );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),

      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async hashRefreshToken(token: string): Promise<string> {
    return bcrypt.hash(token, BCRYPT_ROUNDS);
  }

  async compareRefreshToken(
    plainToken: string,
    hashedToken: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainToken, hashedToken);
  }
}