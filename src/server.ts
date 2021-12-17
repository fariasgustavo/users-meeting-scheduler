import "reflect-metadata";
import express from "express";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { MeetingResolver } from "./domain/resolvers/meeting.resolver";
import { UserResolver } from "./domain/resolvers/user.resolver";
import { auth } from "express-oauth2-jwt-bearer";

async function main() {
  const connection = await createConnection();
  const schema = await buildSchema({
    resolvers: [MeetingResolver, UserResolver],
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
