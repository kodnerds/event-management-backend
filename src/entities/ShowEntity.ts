import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { ArtistEntity } from './ArtistEntity';
import { PaymentEntity } from './PaymentEntity';
import { RsvpEntity } from './RsvpEntity';

@Entity('shows')
export class ShowEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  artistId: string;

  @ManyToOne(() => ArtistEntity, (artist) => artist.shows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artistId' })
  artist: ArtistEntity;

  @Column({ unique: true })
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  location: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'float', nullable: true, default: 0 })
  ticketPrice?: number;

  @Column({ type: 'int', nullable: true })
  availableTickets?: number;

  @OneToMany(() => RsvpEntity, (rsvp) => rsvp.show)
  rsvps: RsvpEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.shows)
  payments: PaymentEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
