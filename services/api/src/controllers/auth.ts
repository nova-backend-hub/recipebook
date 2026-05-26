import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { prisma } from "../db";
import { config } from "../config";
import { RegisterSchema, LoginSchema } from "@recipebook/shared";

export async function authRoutes(fastify: FastifyInstance) {
  
  // POST /auth/register
  fastify.post("/register", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = RegisterSchema.parse(request.body);

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase() },
      });

      if (existingUser) {
        return reply.status(400).send({ error: "Email is already registered" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(body.password, 10);

      // Create new user
      const user = await prisma.user.create({
        data: {
          email: body.email.toLowerCase(),
          name: body.name,
          passwordHash,
          role: "USER",
        },
      });

      // Generate Access and Refresh JWT Tokens
      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return reply.status(201).send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        ...tokens,
      });
    } catch (error: any) {
      if (error.issues) {
        return reply.status(400).send({ error: "Validation failed", details: error.issues });
      }
      console.error("❌ Register error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // POST /auth/login
  fastify.post("/login", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = LoginSchema.parse(request.body);
      const emailLower = body.email.toLowerCase();

      // 1. Check if trying to log in as Default Admin
      if (emailLower === "soli@recipebook.com" || emailLower === "admin@recipebook.com") {
        if (body.password === config.adminPassword) {
          // Find or create default admin in SQLite/PostgreSQL
          let adminUser = await prisma.user.findFirst({
            where: { role: "ADMIN" },
          });

          if (!adminUser) {
            const passwordHash = await bcrypt.hash(config.adminPassword, 10);
            adminUser = await prisma.user.create({
              data: {
                email: "soli@recipebook.com",
                name: config.adminUsername,
                passwordHash,
                role: "ADMIN",
              },
            });
          }

          const tokens = generateTokens({
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
          });

          return reply.send({
            user: {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
              role: adminUser.role,
            },
            ...tokens,
          });
        }
      }

      // 2. Standard user credentials authentication
      const user = await prisma.user.findUnique({
        where: { email: emailLower },
      });

      if (!user) {
        return reply.status(400).send({ error: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash);
      if (!isPasswordValid) {
        return reply.status(400).send({ error: "Invalid email or password" });
      }

      // Generate Access and Refresh JWT Tokens
      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        ...tokens,
      });
    } catch (error: any) {
      if (error.issues) {
        return reply.status(400).send({ error: "Validation failed", details: error.issues });
      }
      console.error("❌ Login error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // POST /auth/refresh
  fastify.post("/refresh", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = request.body as { refreshToken?: string };
      if (!refreshToken) {
        return reply.status(400).send({ error: "Refresh token is required" });
      }

      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as {
        id: string;
        email: string;
        name: string;
        role: "USER" | "ADMIN";
      };

      // Verify the user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return reply.status(401).send({ error: "User no longer exists" });
      }

      // Generate a brand new access and refresh token pair
      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return reply.send(tokens);
    } catch (error) {
      return reply.status(401).send({ error: "Invalid or expired refresh token" });
    }
  });
}

function generateTokens(payload: { id: string; email: string; name: string; role: "USER" | "ADMIN" }) {
  const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: "1d" }); // 1 day access token
  const refreshToken = jwt.sign({ id: payload.id }, config.jwtRefreshSecret, { expiresIn: "7d" }); // 7 days refresh token
  
  return { accessToken, refreshToken };
}
