import { inferAsyncReturnType } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import prisma from '../lib/prisma'
import { AIService } from '../services/ai-service'
import { QueueService } from '../services/queue-service'

export async function createContext({ req }: FetchCreateContextFnOptions) {
  const cookieHeader = req.headers.get("cookie");
  const cookies = Object.fromEntries(
    (cookieHeader ?? "")
      .split(";")
      .map((c) => c.trim().split("="))
      .filter(([k]) => k && k.length > 0)
  );

  const token = cookies["auth_token"];
  let user = null;

  if (token) {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (session && session.expiresAt > new Date()) {
      user = session.user;
    }
  }

  return {
    req,
    prisma,
    user,
    aiService: new AIService(),
    queueService: new QueueService(),
  };
}

export type Context = inferAsyncReturnType<typeof createContext>
