import { FastifyRequest, FastifyReply } from "fastify";
import * as jwt from "jsonwebtoken";
import { config } from "../config";

export interface DecodedUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

declare module "fastify" {
  interface FastifyRequest {
    user?: DecodedUser;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Unauthorized: Missing or invalid token format" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret) as DecodedUser;
    
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: "Unauthorized: Token is expired or invalid" });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  // Ensure authenticate has run first
  if (!request.user) {
    return reply.status(401).send({ error: "Unauthorized: Authentication required" });
  }

  if (request.user.role !== "ADMIN") {
    return reply.status(403).send({ error: "Forbidden: Admin privileges required" });
  }
}
