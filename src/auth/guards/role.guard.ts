import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { ROLE_KEY } from "../decorators/role.decorator";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user;
        if (!user) {
            console.warn("No user found in request");
            return false;
        }
        const roles = user?.roles;
        const requiredRole = this.reflector.getAllAndOverride(ROLE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!user || !requiredRole) return true;
        return roles?.some(role => role.name === requiredRole) ?? false;
    }
}