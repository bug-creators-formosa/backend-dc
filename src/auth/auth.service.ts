import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from '@/users/entities/user.entity';
import { SignInDto } from './dto/sign-in.dto';
import type { JwtPayload } from './types';

export interface VerifiedUserPayload {
    access_token: string;
    user: Omit<User, "password">;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async signUp(user: SignUpDto): Promise<VerifiedUserPayload> {
        const created = await this.usersService.create(user);


        const payload: JwtPayload = {
            sub: created.user_id
        };

        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            user: created,
        };
    }

    async verifyUser(id: string): Promise<User | null> {
        const found = await this.usersService.findOneById(id);
        return found;
    }

    async signIn(user: SignInDto): Promise<VerifiedUserPayload> {
        const found = await this.usersService.matching(user.name, user.password);

        if (!found) {
            throw new NotFoundException('User not found');
        }
        console.log("Signing in...", found);
        const payload: JwtPayload = {
            sub: found.user_id
        };

        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            user: found,
        };
    }
}
