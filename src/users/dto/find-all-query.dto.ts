import { IsIn, IsOptional, IsString } from "class-validator"
import { ROLE_NAMES } from "@/auth/consts"

export class FindAllQueryDto {
    @IsString({ message: "Query should be a string" })
    @IsOptional()
    q: string

    @IsIn(["createdAt", "username"], { message: "Order by should be 'createdAt' or 'username'" })
    @IsOptional()
    order_by: "createdAt" | "username"

    @IsIn(ROLE_NAMES, { message: "Role should be one of 'user', 'admin', 'authority', 'verified_user'" })
    @IsOptional()
    filter_role: typeof ROLE_NAMES[number] 
}