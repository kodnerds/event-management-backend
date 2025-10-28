import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm';

import { ShowEntity } from './ShowEntity';
import { UserEntity } from './UserEntity';

@Entity('rsvps')
@Unique(['user', 'show'])
export class RsvpEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.rsvps, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  showId: string;

  @ManyToOne(() => ShowEntity, (show) => show.rsvps, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'showId' })
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
