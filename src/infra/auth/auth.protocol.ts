import { Request, Response } from "express";

type Payload = {
  userId: string;
};

export interface AuthProtocol {
  req: Request;
  payload: Payload;
}
