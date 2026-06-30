import { Inject, Injectable } from "@nestjs/common";

import { TokenService } from "./token.service";
import { UserDocument } from "src/users/schema/users.schema";
import { USERS_REPOSITORY, type IUsersRepository } from "src/users/repositories/users.repository.interface";

@Injectable()
export class AuthSessionService {

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly tokenService: TokenService,
  ) {}

  async createSession(user: UserDocument) {
    const tokens = await this.tokenService.generateAuthTokens(
      user._id.toString(),
      user.role,
    );

    const hashedRefreshToken =
      await this.tokenService.hashRefreshToken(
        tokens.refreshToken,
      );

    await this.usersRepository.updateById(user._id.toString(), {
      refreshToken: hashedRefreshToken,
    });

    return tokens;
  }


}