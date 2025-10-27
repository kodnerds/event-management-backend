import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { ArtistEntity } from "./ArtistEntity";

@Entity('shows')
export class ShowEntity {
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    artistId:string;

    @ManyToOne(() => ArtistEntity, (artist) => artist.shows, {onDelete:'CASCADE'})
    @JoinColumn({name: 'artistId'})
    artist:ArtistEntity;

    @Column({unique:true})
    title:string;

    @Column({nullable:true})
    description?:string

    @Column()
    location:string

    @Column({type:'timestamp'})
    date:Date;

    @Column({type:'decimal',nullable:true,default:0})
    ticketPrice?: number;

    @CreateDateColumn({type:'timestamp'})
    availableTickets?:number

    @UpdateDateColumn({type:'timestamp'})
    updatedAt:Date
}