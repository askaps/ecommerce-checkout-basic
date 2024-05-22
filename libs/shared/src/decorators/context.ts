import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export const ContextId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const contextId = request.headers['x-request-id'];

  if (contextId) {
    return contextId;
  } else {
    return uuidv4();
  }
});
