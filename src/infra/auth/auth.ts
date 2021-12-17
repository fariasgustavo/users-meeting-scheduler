import { MiddlewareFn } from "type-graphql";
import { verify } from "jsonwebtoken";
import { AuthProtocol } from "./auth.protocol";

export const isAuth: MiddlewareFn<AuthProtocol> = ({ context }, next) => {
  const { authorization } = context.req.headers;

  if (!authorization) throw new Error("Not authenticated");

  try {
    const token = authorization.split(" ")[1];
    const payload = verify(token, "ADBiibecqI1UArgFQgZYvYX4LTZEL4fw", {
      algorithms: ["HS256"],
    });

    context.payload = { userId: payload.sub.toString().replace("auth0|", "") };
  } catch (err) {
    console.error({ error: err });
    throw new Error("Not authenticated");
  }

  return next();
};
