import { SetMetadata } from "@nestjs/common";

export const ROLE_KEY = 'role';
export const Role = (role: string) => SetMetadata('role', role);
