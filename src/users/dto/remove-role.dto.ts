import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveRoleDto {
  @IsString({ message: 'Role id must be a string' })
  @IsNotEmpty({ message: 'Role name is required' })
  role_name: string;
}