import { PassportStrategy } from '@nestjs/passport';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { AuthUser } from './auth.user.interface';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: process.env.NODE_ENV === 'local' ?? false, // ignoring expiration for local enviroment
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Validates a JWT payload and returns an AuthUser object
   *
   * @param payload - The payload of a JWT token
   * @returns An AuthUser object
   * @throws {UnauthorizedException} If the payload is invalid or does not contain a valid user
   */
  async validate(payload: any): Promise<AuthUser> {
    try {
      // Create an AuthUser object from the JWT payload
      const user: AuthUser = { userId: payload.userId, roles: payload.roles };

      // If the user object is invalid, throw an UnauthorizedException
      if (!user) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (error) {
      // If there is an error validating the payload, throw an UnauthorizedException
      throw new UnauthorizedException();
    }
  }
}
