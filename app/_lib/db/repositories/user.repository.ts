import { User } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import { Logger } from "next-axiom";

// Define a type for the selected user fields used in usage checks
type SelectedUserForUsageCheck = {
  id: number;
  periodUsage: number | null;
  stripePriceId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  hasUnlimitedCredits: boolean | null; // <-- Add this
};

export class UserRepository extends BaseRepository {
  async findAll(): Promise<User[]> {
    try {
      //console.log("Repository getting users");
      return await this.prisma.user.findMany({
        orderBy: {
          id: "asc",
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { username: username },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByAuthId(authId: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { authId: authId },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: { email },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(data: {
    username: string;
    //password: string;
    email?: string;
    isAdmin?: boolean;
    periodUsage?: number;
    totalUsage?: number;
    authId: string;
  }): Promise<User> {
    try {
      return await this.prisma.user.create({
        data,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    id: number,
    data: {
      username?: string;
      email?: string;
      isAdmin?: boolean;
      periodUsage?: number;
      totalUsage?: number;
      authId?: string;
      onboardingCompleted?: boolean;
    }
  ): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
    try {
      // Use findFirst because stripe_customer_id should be unique,
      // but findUnique requires it to be a @id or @unique in Prisma schema.
      // findFirst is safer if the unique constraint was added later.
      return await this.prisma.user.findFirst({
        where: { stripeCustomerId: stripeCustomerId },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateSubscriptionByAuthId(
    authId: string,
    data: {
      stripeCustomerId: string;
      stripeSubscriptionId: string;
      stripePriceId?: string | null; // Make optional as it might not always be present or needed
      stripeCurrentPeriodBegin: Date;
      stripeCurrentPeriodEnd: Date;
      stripeSubscriptionStartDate: Date;
      stripeSubscriptionStatus: string; // Add status
      // Optionally reset usage here if needed
      periodUsage?: number;
    }
  ): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { authId: authId },
        data: {
          stripeCustomerId: data.stripeCustomerId,
          stripeSubscriptionId: data.stripeSubscriptionId,
          stripePriceId: data.stripePriceId,
          stripeCurrentPeriodBegin: data.stripeCurrentPeriodBegin,
          stripeCurrentPeriodEnd: data.stripeCurrentPeriodEnd,
          stripeSubscriptionStartDate: data.stripeSubscriptionStartDate,
          stripeSubscriptionStatus: data.stripeSubscriptionStatus, // Add status
          // periodUsage: data.periodUsage !== undefined ? data.periodUsage : undefined, // Example if resetting usage
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Updates subscription details for a user identified by their Stripe Customer ID.
   * Used for webhook events like 'customer.subscription.updated'.
   */
  async updateSubscriptionByCustomerId(
    stripeCustomerId: string,
    data: {
      stripeSubscriptionId: string;
      stripePriceId?: string | null;
      stripeCurrentPeriodBegin: Date;
      stripeCurrentPeriodEnd: Date;
      stripeSubscriptionStatus: string; // Add status
      stripeCancelAtPeriodEnd?: boolean | null; // Add cancel flag
      // stripeSubscriptionStartDate is usually set only on creation,
      // but could be updated if needed, though less common.
      // periodUsage?: number; // Optionally reset usage here if needed - Handled internally now
    }
  ): Promise<User | null> {
    // Find the user first to get current state, especially stripeCurrentPeriodBegin
    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId }, // Assuming stripeCustomerId is unique or using findFirst if not guaranteed
    });

    const log = new Logger({ source: "user.respository" }).with({
      userId: `${user?.id}`,
    });

    if (!user) {
      log.warn(
        `UserRepository: No user found with stripeCustomerId: ${stripeCustomerId}. Cannot update subscription.`
      );
      // Depending on strictness, you might throw an error or just return null
      // throw new Error(`No user found with stripeCustomerId: ${stripeCustomerId}`);
      return null; // Or throw error if preferred
    }

    // Prepare update payload
    const updateData: any = {
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId: data.stripePriceId,
      stripeCurrentPeriodBegin: data.stripeCurrentPeriodBegin,
      stripeCurrentPeriodEnd: data.stripeCurrentPeriodEnd,
      stripeSubscriptionStatus: data.stripeSubscriptionStatus, // Add status
      stripeCancelAtPeriodEnd: data.stripeCancelAtPeriodEnd, // Add cancel flag
    };

    try {
      return await this.prisma.user.update({
        where: { id: user.id }, // Update using the found user's primary key
        data: updateData,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Clears Stripe subscription details for a user identified by their Stripe Customer ID.
   * Used for webhook events like 'customer.subscription.deleted'.
   */
  async clearSubscriptionByCustomerId(
    stripeCustomerId: string
  ): Promise<User | null> {
    // Find the user first
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId },
    });

    const log = new Logger({ source: "user.repository" }).with({
      userId: `${user?.id}`,
    });

    if (!user) {
      log.warn(
        `UserRepository: No user found with stripeCustomerId: ${stripeCustomerId}. Cannot clear subscription.`
      );
      return null;
    }

    try {
      return await this.prisma.user.update({
        where: { id: user.id },
        data: {
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodBegin: null,
          stripeCurrentPeriodEnd: null,
          stripeSubscriptionStatus: null, // Clear status as well
          // Keep stripeCustomerId? Maybe, depends on if you want to retain the link
          // Keep stripeSubscriptionStartDate? Maybe for historical reference
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Checks if a user has an active subscription and is within their usage limit.
   * Throws an error if access should be denied (inactive sub, limit exceeded, user not found).
   * @param userId The ID of the user to check.
   */
  async checkCreditBalance(
    userId: number,
    costInCredits: number
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          creditBalance: true,
          hasUnlimitedCredits: true,
        },
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
      }

      const log = new Logger({ source: "user.repository" }).with({
        userId: `${user.id}`,
      });

      // Bypass checks if user has unlimited credits
      if (user.hasUnlimitedCredits === true) {
        log.info(`User ${userId} has unlimited credits. Access granted.`);
        return;
      }

      const currentBalance = user.creditBalance ?? 0;

      // The check is now much simpler: just compare against the user's current balance.
      if (currentBalance < costInCredits) {
        throw new Error(
          `Insufficient credits. Required: ${costInCredits}, Available: ${currentBalance}`
        );
      }

      log.info(
        `User ${userId} has sufficient credits: ${currentBalance} (cost: ${costInCredits})`
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const userRepository = new UserRepository();
