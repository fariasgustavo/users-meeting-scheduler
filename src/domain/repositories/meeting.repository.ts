import { EntityRepository, Repository } from "typeorm";
import { Meeting } from "../models/meeting.model";

@EntityRepository(Meeting)
export class MeetingRepository extends Repository<Meeting> {
  findByAdminOrGuests(userId: string): Promise<Meeting[]> {
    return this.createQueryBuilder("meeting")
      .leftJoinAndSelect("meeting.guests", "guests")
      .leftJoinAndSelect("meeting.admin", "admin")
      .where("admin.id = :userId", { userId })
      .orWhere("guests.id = :userId", { userId })
      .getMany();
  }
}
