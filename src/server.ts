import "reflect-metadata";
import { createConnection, useContainer } from "typeorm";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { MeetingResolver } from "./domain/services/meeting.service";
import { UserResolver } from "./domain/services/user.service";
import { Container } from "typedi";
import { Container as TypeOrmContainer } from "typeorm-typedi-extensions";

async function main() {
  useContainer(TypeOrmContainer);
  const connection = await createConnection();
  const schema = await buildSchema({
    resolvers: [MeetingResolver, UserResolver],
    container: Container,
  });
  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
  });
  server.listen({ port: 8000 }, () =>
    console.log(`GraphQL server has started on port ${8000}`)
  );
}

main();
