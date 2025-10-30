import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm';

import { PaymentEntity, PaymentStatus } from './PaymentEntity';
import { ShowEntity } from './ShowEntity';
import { UserEntity } from './UserEntity';

export enum RsvpStatus {
  REGISTERED = 'REGISTERED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING'
}

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
    enum: RsvpStatus,
    default: RsvpStatus.PENDING
  })
  status: RsvpStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column()
  paymentId: string;

  @OneToOne(() => PaymentEntity, (payment) => payment.rsvp, { nullable: true })
  @JoinColumn({ name: 'paymentId' })
  payment: PaymentEntity | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
