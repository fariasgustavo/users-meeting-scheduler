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
import { InjectRepository } from "typeorm-typedi-extensions";
import { Meeting } from "../models/meeting.model";
import { AuthProtocol } from "../../infra/auth/auth.protocol";
import { User } from "../models/user.model";
import { PostMeetingArgs } from "../entities/PostMeetingArgs.entity";
import { Service } from "typedi";
import { MeetingRepository } from "../repositories/meeting.repository";
import { UserRepository } from "../repositories/user.repository";

@Service()
@Resolver()
export class MeetingResolver {
  constructor(
    @InjectRepository(Meeting) private meetingRepository: MeetingRepository,
    @InjectRepository(Meeting) private userRepository: UserRepository
  ) {}

  @UseMiddleware(isAuth)
  @Query(() => [Meeting])
  async meetings(@Ctx() context: AuthProtocol): Promise<Meeting[]> {
    const meetings = await this.meetingRepository.findByAdminOrGuests(
      context.payload.userId
    );

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

    const newMeetingStored = await this.meetingRepository.save(newMeeting);

    return this.meetingRepository.save({
      ...newMeetingStored,
      link: `meetme.org/meeting/${newMeetingStored.id}`,
    });
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Meeting)
  async deleteMeeting(
    @Ctx() context: AuthProtocol,
    @Arg("meetingId") meetingId: number
  ): Promise<Meeting> {
    const meetting = await this.meetingRepository.findOne(meetingId, {
      relations: ["admin"],
    });

    if (!meetting) throw new Error(`Metting ID not found: ${meetingId}`);

    if (meetting.admin.id !== context.payload.userId)
      throw new Error("User is not allowed to remove this Meeting");

    return this.meetingRepository.remove(meetting);
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Meeting)
  async addInvitedUserToMeeting(
    @Ctx() context: AuthProtocol,
    @Arg("invitedUserEmail") invitedUserEmail: string,
    @Arg("meetingId") meetingId: number
  ) {
    const invitedUser = await this.userRepository.findOne({
      where: { email: invitedUserEmail },
    });
    const meetting = await this.meetingRepository.findOne(meetingId, {
      relations: ["guests", "admin"],
    });

    if (meetting.admin.id !== context.payload.userId)
      throw new Error("User is not allowed to edit this Meeting");

    meetting.guests.push(invitedUser);

    return this.meetingRepository.save(meetting);
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Meeting)
  async removeGuestUserFromMeeting(
    @Ctx() context: AuthProtocol,
    @Arg("invitedUserEmail") invitedUserEmail: string,
    @Arg("meetingId") meetingId: number
  ) {
    const invitedUser = await this.userRepository.findOne({
      where: { email: invitedUserEmail },
    });
    const meetting = await this.meetingRepository.findOne(meetingId, {
      relations: ["guests", "admin"],
    });

    if (meetting.admin.id !== context.payload.userId)
      throw new Error("User is not allowed to edit this Meeting");

    const allowedGuests: User[] = meetting.guests.filter(
      (guest) => guest.id !== invitedUser.id
    );

    meetting.guests = allowedGuests;

    return this.meetingRepository.save(meetting);
  }
}
