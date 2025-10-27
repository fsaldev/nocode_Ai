import { inferAsyncReturnType } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import prisma from '../lib/prisma'
import { AIService } from '../services/ai-service'
import { QueueService } from '../services/queue-service'

export async function createContext({ req }: FetchCreateContextFnOptions) {
  // Extract auth token from header
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  // Get user from session if authenticated
  let user = null
  if (token) {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (session && session.expiresAt > new Date()) {
      user = session.user
    }
  }

  // Initialize services for this request
  const aiService = new AIService()
  const queueService = new QueueService()

  return {
    req,
    prisma,
    user,
    aiService,
    queueService,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
