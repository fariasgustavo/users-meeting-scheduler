import { Resolver, Query, Mutation, Arg, UseMiddleware } from "type-graphql";
import { User } from "../models/user.model";
import * as bcrypt from "bcrypt";
import { isAuth } from "../..//infra/auth/auth";
import { Meeting } from "../models/meeting.model";

@Resolver()
export class UserResolver {
  @UseMiddleware(isAuth)
  @Mutation(() => User)
  async addUser(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("nickname") nickname: string,
    @Arg("id") userId: string
  ): Promise<User> {
    const passwordEncrypted: string = await bcrypt.hash(password, 10);

    const newUser = Object.assign(new User(), {
      id: userId,
      email,
      password: passwordEncrypted,
      nickname,
    });

    return User.save(newUser);
  }
}
