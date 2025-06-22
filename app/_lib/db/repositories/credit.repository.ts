import { User } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import { Logger } from "next-axiom";

export class CreditRepository extends BaseRepository {
  async addCredits(
    userId: number,
    amount: number,
    source: string,
    expiresInDays: number | null
  ): Promise<User> {
    const log = new Logger({ source: "credit.repository" }).with({
      userId: userId,
    });
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;
    // Use Prisma transaction
    const [updatedUser, _] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { creditBalance: { increment: amount } },
      }),
      this.prisma.creditTransaction.create({
        data: {
          userId,
          creditsAmount: amount,
          source,
          expiresAt,
        },
      }),
    ]);
    log.info(`Added ${amount} credits to user ${userId}`);
    return updatedUser;
  }

  async deductCredits(
    userId: number,
    amount: number,
    source: string
  ): Promise<User> {
    // Use Prisma transaction
    const [updatedUser, _] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { creditBalance: { decrement: amount } },
      }),
      this.prisma.creditTransaction.create({
        data: {
          userId,
          creditsAmount: -amount, // Negative for deduction
          source,
        },
      }),
    ]);
    return updatedUser;
  }
}

export const creditRepository = new CreditRepository();
