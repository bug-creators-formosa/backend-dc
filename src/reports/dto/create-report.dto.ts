import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateReportDto {
    @IsString({ message: "El título debe ser un string" })
    @IsNotEmpty({ message: "El título es requerido" })
    title: string;

    @IsString({ message: "La descripción debe ser un string" })
    @IsNotEmpty({ message: "El descripción es requerido" })
    description: string;

    @IsString({ message: "La dirección debe ser un string" })
    @IsNotEmpty({ message: "La dirección es requerida" })
    address: string;

    @IsNotEmpty({ message: "El ID del tipo es requerida" })
    @IsUUID("all", { message: "El ID del tipo debe ser un UUID" })
    report_type_id: string;
}
