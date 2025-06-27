// File: app/_lib/db/repositories/credit.repository.ts

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
      userId: `${userId}`,
    });

    // --- FIX IS HERE: EXPLICIT TYPE COERCION ---
    // Ensure userId is treated as an integer, just in case it was passed as a string.
    const numericUserId = Number(userId);

    // Add a check to ensure the conversion was successful
    if (isNaN(numericUserId)) {
      log.error(
        "DATABASE_ERROR: Invalid userId passed to addCredits. It was not a number.",
        {
          originalUserId: userId,
        }
      );
      throw new Error("Invalid user ID format.");
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    try {
      const [updatedUser, _] = await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: numericUserId }, // Use the coerced number
          data: { creditBalance: { increment: amount } },
        }),
        this.prisma.creditTransaction.create({
          data: {
            userId: numericUserId, // Use the coerced number
            creditsAmount: amount,
            source: source,
            expiresAt: expiresAt,
          },
        }),
      ]);

      log.info(
        `SUCCESS: Transaction completed. Added ${amount} credits to user ${numericUserId}.`,
        { source }
      );
      return updatedUser;
    } catch (error) {
      log.error(`DATABASE_ERROR: Failed to add credits in transaction.`, {
        errorMessage: error instanceof Error ? error.message : String(error),
        insertData: { userId: numericUserId, amount, source, expiresAt },
      });
      throw error;
    }
  }

  // ... (apply similar fix to deductCredits if needed)
  async deductCredits(
    userId: number,
    amount: number,
    source: string
  ): Promise<User> {
    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
      throw new Error("Invalid user ID format for deduction.");
    }

    // ... rest of the deductCredits logic using numericUserId
    const [updatedUser, _] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: numericUserId },
        data: { creditBalance: { decrement: amount } },
      }),
      this.prisma.creditTransaction.create({
        data: {
          userId: numericUserId,
          creditsAmount: -amount,
          source: source,
        },
      }),
    ]);
    return updatedUser;
  }
}

export const creditRepository = new CreditRepository();
