import { ArgsType, Field, Int } from "type-graphql";

@ArgsType()
export class PostMeetingArgs {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => [String])
  guestsUsersId: string[];
}
