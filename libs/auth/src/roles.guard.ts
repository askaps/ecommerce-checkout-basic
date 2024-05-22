import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RolesGuard extends AuthGuard('bearer') {
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
    return super.canActivate(context);
  }

  /**
   * Handles a request that has been authenticated
   * This method is called when the request has been successfully authenticated.
   * @param err - An error that was raised during authentication
   * @param user - The user object that has been authenticated
   * @param context - The execution context
   * @returns The user object if authentication is successful, otherwise throws an exception
   */
  handleRequest(err: any, user: any, context: any) {
    // Throw an exception if there was an error during authentication
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    // Get the list of roles that are required for this request
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    // If no roles are specified, return the user object
    if (!roles) {
      return user;
    }

    // Check if the user has one of the required roles
    const authorised: boolean = roles.includes('ADMIN') ? user.isAdmin : true;

    // If the user does not have one of the required roles, throw an unauthorized exception
    if (!authorised) throw new UnauthorizedException();

    // Return the user object if authentication is successful
    return user;
  }
}
