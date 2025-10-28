import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm';

import { ShowEntity } from './ShowEntity';
import { UserEntity } from './UserEntity';

@Entity('rsvps')
@Unique(['user', 'show'])
export class RSVP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.rsvps, { eager: true, onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => ShowEntity, (show) => show.rsvps, { eager: true, onDelete: 'CASCADE' })
  show: ShowEntity;

  @Column({
    type: 'enum',
    enum: ['REGISTERED', 'CANCELLED'],
    default: 'REGISTERED'
  })
  status: 'REGISTERED' | 'CANCELLED';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
