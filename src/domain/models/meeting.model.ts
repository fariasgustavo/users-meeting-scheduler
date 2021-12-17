import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.model";

@Entity()
@ObjectType()
export class Meeting extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @Column({
    nullable: true,
  })
  link: string;

  @Field(() => String)
  @Column()
  title: string;

  @Field(() => String)
  @Column()
  description: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.ownMeetings)
  admin: User;

  @Field(() => [User])
  @ManyToMany(() => User)
  @JoinTable()
  guests: User[];
}
