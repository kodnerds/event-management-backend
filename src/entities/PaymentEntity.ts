import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

import { RsvpEntity } from "./RsvpEntity";
import { ShowEntity } from "./ShowEntity";
import { UserEntity } from "./UserEntity";

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}

export enum PaymentProvider {
    PAYSTACK = 'PAYSTACK',
}

@Entity()
@Unique(['reference'])
export class PaymentEntity {
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({ type: 'enum', enum: PaymentProvider, default: PaymentProvider.PAYSTACK })
    provider: PaymentProvider;

    @Column()
    reference:string;

    @Column('decimal')
    amount:number;

    @Column({type:'enum',enum:PaymentStatus,default:PaymentStatus.PENDING})
    status:PaymentStatus;

    @Column()
    userId:string

    @ManyToOne(() => UserEntity,(user) => user.payments)
    @JoinColumn({name:'userId'})
    user:UserEntity;

    @Column()
    showId:string

    @ManyToOne(() => ShowEntity,(shows) => shows.payments)
    @JoinColumn({name:'showId'})
    shows:ShowEntity;

    @ManyToOne(() => RsvpEntity,(rsvp) => rsvp.payment)
    rsvp:RsvpEntity;

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;
}