import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.interface';

@Entity()
export class UserEntity extends BaseEntity implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;
}
