import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Meeting } from "./meeting.model";

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryColumn()
  id: string;

  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Field(() => String)
  @Column()
  password: string;

  @Field(() => String)
  @Column()
  nickname: string;

  @Field(() => [Meeting], { nullable: true })
  @OneToMany(() => Meeting, (meeting) => meeting.admin)
  ownMeetings?: Meeting[];
}
