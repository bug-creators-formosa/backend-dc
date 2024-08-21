import { ENVIRONMENT } from '@/config/env';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<ENVIRONMENT["SECRET"]>("SECRET"),
        });
    }

    async validate(payload: JwtPayload) {
        const found = await this.authService.verifyUser(payload.sub);
        if (!found) {
            return null;
        } 
        return found;
    }
}