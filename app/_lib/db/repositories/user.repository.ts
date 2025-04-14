import { User } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import { UserUsageLimits } from "../../model";

// Define a type for the selected user fields used in usage checks
type SelectedUserForUsageCheck = {
  id: number;
  periodUsage: number | null;
  stripePriceId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
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

    if (!user) {
      console.warn(
        `UserRepository: No user found with stripeCustomerId: ${stripeCustomerId}. Cannot update subscription.`
      );
      // Depending on strictness, you might throw an error or just return null
      // throw new Error(`No user found with stripeCustomerId: ${stripeCustomerId}`);
      return null; // Or throw error if preferred
    }

    // Determine if usage should be reset
    let shouldResetUsage = false;
    if (user.stripeCurrentPeriodBegin) {
      // Compare incoming start date with stored start date
      // Convert both to milliseconds for reliable comparison
      if (
        data.stripeCurrentPeriodBegin.getTime() !==
        user.stripeCurrentPeriodBegin.getTime()
      ) {
        console.log(
          `Renewal detected for customer ${stripeCustomerId}. Resetting periodUsage.`
        );
        shouldResetUsage = true;
      }
    } else {
      // If there's no previous begin date, maybe treat it as the start of the first period?
      // Or assume it's not a renewal requiring reset. For now, only reset if dates differ.
      console.log(
        `No existing stripeCurrentPeriodBegin found for customer ${stripeCustomerId}. Not resetting usage.`
      );
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

    if (shouldResetUsage) {
      updateData.periodUsage = 0.0; // Reset usage to 0
    }

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

    if (!user) {
      console.warn(
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

  // Renamed from getUsageLimit to avoid confusion, as it now also checks status
  async getUserPlanAndUsage(userId: number): Promise<{
    user: SelectedUserForUsageCheck | null; // Use the selected type here (defined outside class)
    plan: { usageLimit: number } | null;
  }> {
    try {
      const user: SelectedUserForUsageCheck | null =
        await this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true, // Include id for logging/errors
            periodUsage: true,
            stripePriceId: true,
            stripeSubscriptionId: true, // Need this to know if they *should* have a status
            stripeSubscriptionStatus: true, // Fetch the status
          },
        });

      if (!user) {
        // Return null user, let caller handle 'user not found'
        return { user: null, plan: null };
      }

      // Determine which plan to fetch
      let subscriptionPlan;
      // Use stripeSubscriptionId as the primary indicator of a paid plan
      if (user.stripeSubscriptionId) {
        // User has a Stripe subscription, find their specific plan using stripePriceId
        if (!user.stripePriceId) {
          // This is an edge case: subscribed but no price ID? Log and treat as free tier.
          console.warn(
            `User ${userId} has stripeSubscriptionId but no stripePriceId. Falling back to Free Tier check.`
          );
          subscriptionPlan = await this.prisma.subscriptionPlan.findFirst({
            where: { stripePriceId: null }, // Find the Free Tier plan
          });
        } else {
          subscriptionPlan = await this.prisma.subscriptionPlan.findUnique({
            where: { stripePriceId: user.stripePriceId },
          });
        }

        if (!subscriptionPlan) {
          // This case is problematic: user has a stripePriceId but no matching plan in DB.
          console.warn(
            `No SubscriptionPlan found for stripePriceId: ${user.stripePriceId}. Falling back to Free Tier check for user ${userId}.`
          );
          // If the specific plan isn't found, fall back to free tier
          subscriptionPlan = await this.prisma.subscriptionPlan.findFirst({
            where: { stripePriceId: null }, // Find the Free Tier plan
          });
        }
      } else {
        // User does not have a Stripe subscription ID, use the Free Tier plan
        subscriptionPlan = await this.prisma.subscriptionPlan.findFirst({
          where: { stripePriceId: null }, // Find the Free Tier plan
        });
      }

      // If even the free tier plan isn't found (shouldn't happen after seeding)
      if (!subscriptionPlan) {
        throw new Error(
          `Default subscription plan (Free Tier) not found in the database for user ${userId}.`
        );
      }

      return { user, plan: { usageLimit: subscriptionPlan.usageLimit } };
    } catch (error) {
      // Log the original error for better debugging
      console.error("Original error in getUserPlanAndUsage:", error);
      // Re-throw a more informative error or the original one
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Error getting user plan/usage for user ${userId}: ${errorMessage}`
      );
    }
  }

  /**
   * Checks if a user has an active subscription and is within their usage limit.
   * Throws an error if access should be denied (inactive sub, limit exceeded, user not found).
   * @param userId The ID of the user to check.
   */
  async checkUsageLimit(userId: number): Promise<void> {
    try {
      const { user, plan } = await this.getUserPlanAndUsage(userId);

      if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
      }
      if (!plan) {
        // This should theoretically be caught by getUserPlanAndUsage, but double-check
        throw new Error(
          `Could not determine subscription plan for user ${userId}.`
        );
      }

      // --- Status Check ---
      // If user has a subscription ID, they must have an 'active' status to proceed
      if (
        user.stripeSubscriptionId &&
        user.stripeSubscriptionStatus !== "active"
      ) {
        throw new Error(
          `Subscription is not active. Current status: ${user.stripeSubscriptionStatus}`
        );
      }
      // --- End Status Check ---

      // --- Usage Limit Check ---
      const userPeriodUsage = user.periodUsage ?? 0.0;
      if (userPeriodUsage >= plan.usageLimit) {
        // Consider creating a custom error class for better handling upstream
        throw new Error(
          `Usage limit exceeded. Current usage: ${userPeriodUsage}, Limit: ${plan.usageLimit}`
        );
      }
      // --- End Usage Limit Check ---

      // If all checks pass, the method completes successfully (returns void)
      console.log(
        `User ${userId} access check passed. Status: ${user.stripeSubscriptionStatus ?? "N/A (Free Tier)"}, Usage: ${userPeriodUsage}, Limit: ${plan.usageLimit}`
      );
    } catch (error) {
      // Re-throw specific errors or handle generic ones
      this.handleError(error); // Use existing handler or re-throw
    }
  }
}

export const userRepository = new UserRepository();
