import { User } from "@/users/entities/user.entity";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class SignUpDto extends User {
    @IsString({ message: 'Los nombres deben ser un string' })
    @IsNotEmpty({ message: 'Los nombres son requeridos' })
    names: string;

    @IsString({ message: 'Los apellidos deben ser un string' })
    @IsNotEmpty({ message: 'Los apellidos son requeridos' })
    surnames: string;

    @IsString({ message: 'El nombre de usuario debe ser un stringc' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    username: string;

    @IsNotEmpty({ message: 'El correo electrónico es requerido' })
    @IsString({ message: 'El correo electrónico debe ser un string' })
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    email: string;

    @IsNotEmpty({ message: 'La contraseña es requerida es requerida' })
    @IsString({ message: 'La contraseña debe ser un string' })
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0
    }, {
        message: 'La contraseña es débil. Debe tener al menos 8 caracteres y contener al menos 1 minúscula, 1 mayúscula, y 1 número.',
    })
    password: string;
}