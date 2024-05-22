import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from './auth.user.interface';

/**
 * A decorator that adds user data to request object
 * @param data - user data
 * @param ctx: execution context
 * @returns AuthUser with user data
 */
export const ReqUser = createParamDecorator((data: string, ctx: ExecutionContext): AuthUser => {
  const request = ctx.switchToHttp().getRequest();
  return data ? request.user && request.user[data] : request.user;
});
