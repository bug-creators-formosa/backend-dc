import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateProjectDto {
    @IsString({ message: "El título debe ser un string" })
    @IsNotEmpty({ message: "El título es requerido" })
    title: string;

    @IsString({ message: "El descripción debe ser un string" })
    @IsNotEmpty({ message: "El descripción es requerido" })
    description: string;

    @IsBoolean({ message: "El campo is_public debe ser un booleano" })
    @IsOptional()
    is_public?: boolean;
}
