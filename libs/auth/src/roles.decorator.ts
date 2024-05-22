import { SetMetadata } from '@nestjs/common';

/**
 * A decorator that specifies roles that a user must have to access
 * a controller, method, or action.
 * @param roles - The roles that a user must have.
 * @returns A metadata key to store the roles.
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
