import { IsNotEmpty, IsString } from 'class-validator';

export class AssignRolesDto {
  @IsString({ message: 'Role id must be a string', each: true })
  @IsNotEmpty({ message: 'Role name is required' })
  roles: string[];
}