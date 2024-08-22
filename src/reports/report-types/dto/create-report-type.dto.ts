import { IsNotEmpty, IsString } from "class-validator"

export class CreateReportTypeDto {
    
    @IsString({ message: "El nombre debe ser un string" })
    @IsNotEmpty({ message: "El nombre es requerido" })
    name: string;

    @IsString({ message: "La descripción debe ser un string" })
    @IsNotEmpty({ message: "El descripción es requerido" })
    description: string;

}
