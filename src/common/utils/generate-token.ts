import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { UserRole } from 'src/users/enums/roles.enum';

type JwtPayload = {
  sub: string;
  role: UserRole;
};

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export async function generateTokens(
  userId: string,
  role: UserRole,
  jwtService: JwtService,
  configService: ConfigService,
): Promise<Tokens> {
  const payload: JwtPayload = {
    sub: userId.toString(),
    role,
  };

  const accessSecret = configService.getOrThrow<string>('jwt.access.secret');
  const refreshSecret = configService.getOrThrow<string>('jwt.refresh.secret');

  const accessExpiresIn = configService.getOrThrow<StringValue>(
    'jwt.access.expiresIn',
  );

  const refreshExpiresIn = configService.getOrThrow<StringValue>(
    'jwt.refresh.expiresIn',
  );

  const [accessToken, refreshToken] = await Promise.all([
    jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessExpiresIn,
    }),

    jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    }),
  ]);

  return {
    accessToken,
    refreshToken,
  };
}