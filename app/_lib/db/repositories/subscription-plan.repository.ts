import { PrismaClient, SubscriptionPlan } from "@prisma/client";
import { BaseRepository } from "./base.repository"; // Use named import

export class SubscriptionPlanRepository extends BaseRepository {
  // Constructor and prisma property removed, inherited from BaseRepository

  /**
   * Finds all subscription plans.
   * @returns Promise<SubscriptionPlan[]>
   */
  async findAll(): Promise<SubscriptionPlan[]> {
    try {
      // Use this.prisma inherited from BaseRepository
      return await this.prisma.subscriptionPlan.findMany();
    } catch (error) {
      this.handleError(error); // Pass only the error
      throw error; // Re-throw is still needed as handleError doesn't guarantee exit
    }
  }

  /**
   * Finds a subscription plan by its Stripe Price ID.
   * @param stripePriceId - The Stripe Price ID.
   * @returns Promise<SubscriptionPlan | null>
   */
  async findByStripePriceId(
    stripePriceId: string
  ): Promise<SubscriptionPlan | null> {
    try {
      return await this.prisma.subscriptionPlan.findUnique({
        where: { stripePriceId },
      });
    } catch (error) {
      this.handleError(error); // Pass only the error
      throw error; // Re-throw is still needed
    }
  }

  /**
   * Creates or updates a subscription plan based on the Stripe Price ID.
   * @param stripePriceId - The unique Stripe Price ID.
   * @param name - The local name for the plan.
   * @param usageLimit - The usage limit for the plan.
   * @returns Promise<SubscriptionPlan>
   */
  async upsertByStripePriceId(
    stripePriceId: string,
    name: string,
    usageLimit: number
  ): Promise<SubscriptionPlan> {
    try {
      return await this.prisma.subscriptionPlan.upsert({
        where: { stripePriceId },
        update: { name, usageLimit },
        create: { stripePriceId, name, usageLimit },
      });
    } catch (error) {
      this.handleError(error); // Pass only the error
      throw error; // Re-throw is still needed
    }
  }
}

// Optional: Export an instance if using a singleton pattern for repositories
// import prisma from "../prisma"; // Adjust path as needed
// export const subscriptionPlanRepository = new SubscriptionPlanRepository(prisma);
