import { Role } from "@/auth/entities/role.entity";
import { Exclude, Expose } from "class-transformer";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    user_id: string;

    @Expose({ name: 'username', toPlainOnly: true })
    @Column()
    name: string;

    @Expose({ name: 'email', toPlainOnly: true })
    @Column()
    email: string;

    @Column()
    @Exclude({ toPlainOnly: true })
    password: string;

    // A user can have only one role
    @ManyToMany(() => Role)
    @JoinTable({
        name: 'user_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'user_id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'role_id' }
    })
    @Expose({ name: 'user_roles', toPlainOnly: true })
    roles: Role[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}