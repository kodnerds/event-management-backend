import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ArtistEntity } from './ArtistEntity';

export enum UserRole{
  USER = "USER",
  ADMIN = "ADMIN"
}

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({unique:true})
  email:string

  @Column()
  password:string

  @Column({type:"enum",enum:UserRole,default:UserRole.USER})
  role!:UserRole

  @Column("text",{array:true,nullable:true})
  favouriteGenres?:string[]

  @ManyToMany(() => ArtistEntity)
  @JoinTable()
  favouriteArtists?:ArtistEntity[]

  @Column({nullable:true})
  location?: string;
  
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
