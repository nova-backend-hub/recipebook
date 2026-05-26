import Fastify from "fastify";
import { config, validateConfig } from "./config";
import { checkDatabaseConnection } from "./db";
import { authRoutes } from "./controllers/auth";
import { recipeRoutes } from "./controllers/recipes";
import { adminRoutes } from "./controllers/admin";

// Create Fastify server instance
const fastify = Fastify({
  logger: {
    level: config.nodeEnv === "development" ? "info" : "warn",
    transport: config.nodeEnv === "development" 
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined
  }
});

// Configure Global Middlewares
async function configurePlugins() {
  
  // 1. Cross-Origin Resource Sharing (CORS)
  await fastify.register(require("@fastify/cors"), {
    origin: true, // Allow all origins in local environments
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  });

  // 2. Helmet Security Headers
  await fastify.register(require("@fastify/helmet"), {
    contentSecurityPolicy: false, // Turn off for easy Swaggers integrations if needed
  });

  // 3. In-Memory Basic Rate Limiting (to ensure security out-of-the-box)
  const clientRequests = new Map<string, { count: number; resetTime: number }>();
  fastify.addHook("onRequest", async (request, reply) => {
    const ip = request.ip;
    const now = Date.now();
    const timeframe = 60 * 1000; // 1 minute limit window
    const maxRequests = 100; // max 100 requests per minute

    const client = clientRequests.get(ip);
    if (!client || now > client.resetTime) {
      clientRequests.set(ip, { count: 1, resetTime: now + timeframe });
    } else {
      client.count++;
      if (client.count > maxRequests) {
        return reply.status(429).send({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please slow down and try again later."
        });
      }
    }
  });
}

// Global Custom Error Handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  if (error.statusCode) {
    return reply.status(error.statusCode).send({ error: error.name, message: error.message });
  }

  // Zod schema exceptions are routed gracefully
  return reply.status(500).send({
    error: "Internal Server Error",
    message: "An unexpected error occurred on the server pipeline."
  });
});

// Root Health check endpoint
fastify.get("/", async () => {
  return {
    app: "RecipeBook API Core Service",
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  };
});

// Register Controller Routes
async function registerRoutes() {
  await fastify.register(authRoutes, { prefix: "/auth" });
  await fastify.register(recipeRoutes, { prefix: "/recipes" });
  await fastify.register(adminRoutes, { prefix: "/admin" });
}

// Bootstrap Application
async function start() {
  try {
    validateConfig();
    
    await configurePlugins();
    await registerRoutes();

    // Listen on port (Host 0.0.0.0 is critical for Docker/Cloud Run scaling!)
    const address = await fastify.listen({ port: config.port, host: "0.0.0.0" });
    console.log(`🚀 RecipeBook API server is listening at: ${address}`);

    // Asynchronously verify database connection in background
    checkDatabaseConnection().then(dbConnected => {
      if (!dbConnected) {
        console.warn("⚠️ Database connection check failed. Running in offline/mock capacity.");
      }
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
