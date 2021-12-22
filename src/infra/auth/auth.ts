import { MiddlewareFn } from "type-graphql";
import { verify } from "jsonwebtoken";
import { AuthProtocol } from "./auth.protocol";
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export const isAuth: MiddlewareFn<AuthProtocol> = ({ context }, next) => {
  const { authorization } = context.req.headers;

  if (!authorization) throw new Error("Not authenticated");

  try {
    const token = authorization.split(" ")[1];
    const payload = verify(token, process.env.AUTH_SECRET, {
      algorithms: ["HS256"],
    });

    context.payload = { userId: payload.sub.toString().replace("auth0|", "") };
  } catch (err) {
    console.error({ error: err });
    throw new Error("Not authenticated");
  }

  return next();
};
