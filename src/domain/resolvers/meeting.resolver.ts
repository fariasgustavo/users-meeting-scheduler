import { isAuth } from "../../infra/auth/auth";
import {
  Arg,
  Args,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Meeting } from "../models/meeting.model";
import { AuthProtocol } from "../../infra/auth/auth.protocol";
import { User } from "../models/user.model";
import { PostMeetingArgs } from "../entities/PostMeetingArgs.entity";
import { In } from "typeorm";

@Resolver()
export class MeetingResolver {
  @UseMiddleware(isAuth)
  @Query(() => [Meeting])
  async meetings(@Ctx() context: AuthProtocol): Promise<Meeting[]> {
    const meetings = await Meeting.createQueryBuilder("meeting")
      .leftJoinAndSelect("meeting.guests", "guests")
      .leftJoinAndSelect("meeting.admin", "admin")
      .where("admin.id = :userId", { userId: context.payload.userId })
      .orWhere("guests.id = :userId", { userId: context.payload.userId })
      .getMany();

    if (meetings.length < 1)
      throw new Error("There's no meetings scheduled for this user");

    return meetings;
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Meeting)
  async addMeeting(
    @Ctx() context: AuthProtocol,
    @Args() { title, description, guestsUsersId }: PostMeetingArgs
  ): Promise<Meeting> {
    const guests = guestsUsersId.map((guestId) =>
      Object.assign(new User(), {
        id: guestId,
      })
    );

    const admin = Object.assign(new User(), {
      id: context.payload.userId,
    });

    const newMeeting = Object.assign(new Meeting(), {
      title,
      description,
      admin,
      guests,
    });

    const newMeetingStored = await Meeting.save(newMeeting);
    newMeetingStored.link = `meetme.org/meeting/${newMeetingStored.id}`;

    return Meeting.save(newMeetingStored);
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Meeting)
  async deleteMeeting(
    @Ctx() context: AuthProtocol,
    @Arg("meetingId") meetingId: number
  ): Promise<Meeting> {
    const meetting = await Meeting.findOne(meetingId, { relations: ["admin"] });

    if (!meetting) throw new Error(`Metting ID not found: ${meetingId}`);

    if (meetting.admin.id !== context.payload.userId)
      throw new Error("User is not allowed to remove this Meeting");

    return Meeting.remove(meetting);
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Meeting)
  async addInvitedUserToMeeting(
    @Ctx() context: AuthProtocol,
    @Arg("invitedUserEmail") invitedUserEmail: string,
    @Arg("meetingId") meetingId: number
  ) {
    const invitedUser = await User.findOne({
      where: { email: invitedUserEmail },
    });
    const meetting = await Meeting.findOne(meetingId, {
      relations: ["guests", "admin"],
    });

    if (meetting.admin.id !== context.payload.userId)
      throw new Error("User is not allowed to edit this Meeting");

    meetting.guests.push(invitedUser);

    return Meeting.save(meetting);
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Meeting)
  async removeGuestUserFromMeeting(
    @Ctx() context: AuthProtocol,
    @Arg("invitedUserEmail") invitedUserEmail: string,
    @Arg("meetingId") meetingId: number
  ) {
    const invitedUser = await User.findOne({
      where: { email: invitedUserEmail },
    });
    const meetting = await Meeting.findOne(meetingId, {
      relations: ["guests", "admin"],
    });

    if (meetting.admin.id !== context.payload.userId)
      throw new Error("User is not allowed to edit this Meeting");

    const allowedGuests: User[] = meetting.guests.filter(
      (guest) => guest.id !== invitedUser.id
    );

    meetting.guests = allowedGuests;

    return Meeting.save(meetting);
  }
}
