import { Resolver, Mutation, Arg, UseMiddleware } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { User } from "../models/user.model";
import * as bcrypt from "bcrypt";
import { isAuth } from "../../infra/auth/auth";
import { Service } from "typedi";
import { UserRepository } from "../repositories/user.repository";

@Service()
@Resolver()
export class UserResolver {
  constructor(@InjectRepository(User) private userRepository: UserRepository) {}

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

    return this.userRepository.store(newUser);
  }
}
