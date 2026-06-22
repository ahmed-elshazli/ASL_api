import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {

    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return null;

    return data ? user[data] : user;

  },
);

export const CurrentUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?._id;
  },
);