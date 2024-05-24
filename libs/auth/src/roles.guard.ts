import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  /**
   * Determines if the current request is authorized to access the resource
   * This method is called by NestJS to check if the request is authorized to access a
   * controller, method, or action.
   *
   * @param context - The execution context
   * @returns A boolean value indicating whether the request is authorized or not
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Call the super method to check if the request is authenticated via jwt
    super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if the user has one of the required roles
    const authorised: boolean = user.roles?.includes('ADMIN') ?? false;

    // If the user does not have one of the required roles, throw an unauthorized exception
    if (!authorised) throw new UnauthorizedException();

    // Return the user object if authentication is successful
    return user;
  }
}
