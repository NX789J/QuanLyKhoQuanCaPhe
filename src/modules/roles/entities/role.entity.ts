// backend/src/modules/roles/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserRoleEnum } from '../../../common/enums/system.enum';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserRoleEnum, unique: true })
  name: UserRoleEnum;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}