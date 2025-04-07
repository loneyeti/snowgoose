"use server";

import Stripe from "stripe";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { isCurrentUserAdmin } from "@/app/_lib/auth";
import prisma from "@/app/_lib/db/prisma"; // Import the singleton prisma instance
import { SubscriptionPlanRepository } from "@/app/_lib/db/repositories/subscription-plan.repository";
import { SubscriptionPlan } from "@prisma/client"; // Import the generated type
import { upsertSubscriptionPlanSchema } from "@/app/_lib/form-schemas"; // Import the schema

// Initialize Stripe client (ensure STRIPE_SECRET_KEY is set in environment)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "Stripe secret key is not configured. Subscription actions may fail."
  );
}

// Initialize Repository (BaseRepository handles prisma internally)
const subscriptionPlanRepository = new SubscriptionPlanRepository();

// Define the structure for combined data
export interface AdminSubscriptionViewData {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripeCustomerEmail?: string | null; // Add email if available
  stripePriceId: string;
  stripeProductName: string;
  stripeStatus: Stripe.Subscription.Status;
  stripeCurrentPeriodEnd: Date;
  localPlanId?: number;
  localPlanName?: string;
  localUsageLimit?: number;
}

/**
 * Fetches active Stripe subscriptions and merges them with local SubscriptionPlan data.
 * Requires admin privileges.
 * @returns Promise<AdminSubscriptionViewData[]>
 */
export async function getAdminSubscriptionData(): Promise<
  AdminSubscriptionViewData[]
> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required.");
  }

  try {
    // 1. Fetch all active Stripe subscriptions with expanded product info
    const stripeSubscriptions = await stripe.subscriptions.list({
      status: "active", // Fetch only active subscriptions
      limit: 100, // Adjust limit as needed
      // Expand only to price and customer (within 4 levels)
      expand: ["data.items.data.price", "data.customer"],
    });

    // 2. Fetch all local subscription plans from the database
    const localPlans = await subscriptionPlanRepository.findAll();
    const localPlansMap = new Map(
      localPlans.map((plan) => [plan.stripePriceId, plan])
    );

    // 3. Collect unique product IDs from subscriptions
    const productIds = new Set<string>();
    stripeSubscriptions.data.forEach((sub) => {
      sub.items.data.forEach((item) => {
        if (item.price?.product && typeof item.price.product === "string") {
          productIds.add(item.price.product);
        } else {
          // Handle cases where product might be an object but we only have ID reference in price
          const productRef = item.price?.product;
          if (
            productRef &&
            typeof productRef === "object" &&
            "id" in productRef
          ) {
            productIds.add(productRef.id);
          }
        }
      });
    });

    // 4. Fetch product details separately if any IDs were found
    const productMap = new Map<string, string>(); // Map<productId, productName>
    if (productIds.size > 0) {
      const products = await stripe.products.list({
        ids: Array.from(productIds),
        limit: productIds.size, // Fetch all collected IDs
      });
      products.data.forEach((prod) => {
        productMap.set(prod.id, prod.name);
      });
    }

    // 5. Merge Stripe data, local data, and product names
    const combinedData = stripeSubscriptions.data
      .map((sub): AdminSubscriptionViewData | null => {
        const subscriptionItem = sub.items.data[0]; // Assuming one item per sub
        const price = subscriptionItem?.price;
        const customer = sub.customer; // Customer is expanded

        // Basic validation
        if (
          !subscriptionItem ||
          !price ||
          !customer ||
          typeof customer === "string" ||
          customer.deleted ||
          !subscriptionItem.current_period_end
        ) {
          console.warn(
            `Subscription ${sub.id} missing critical data (item, price, customer, period end) or has deleted customer. Skipping.`
          );
          return null;
        }

        // Get product ID from price object
        const productId =
          typeof price.product === "string" ? price.product : price.product?.id;
        if (!productId) {
          console.warn(
            `Subscription ${sub.id} missing product ID in price object. Skipping.`
          );
          return null;
        }

        const productName = productMap.get(productId) || "Unknown Product"; // Get name from map
        const stripePriceId = price.id;
        const localPlan = localPlansMap.get(stripePriceId);

        const data: AdminSubscriptionViewData = {
          stripeSubscriptionId: sub.id,
          stripeCustomerId: customer.id,
          stripeCustomerEmail: customer.email ?? null,
          stripePriceId: stripePriceId,
          stripeProductName: productName, // Use fetched product name
          stripeStatus: sub.status,
          stripeCurrentPeriodEnd: new Date(
            subscriptionItem.current_period_end * 1000
          ),
          localPlanId: localPlan?.id,
          localPlanName: localPlan?.name,
          localUsageLimit: localPlan?.usageLimit,
        };
        return data;
      })
      .filter((item): item is AdminSubscriptionViewData => item !== null);

    return combinedData;
  } catch (error) {
    console.error("Error fetching admin subscription data:", error);
    // Handle Stripe-specific errors if needed
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API Error: ${error.message}`);
    }
    throw new Error("Failed to fetch subscription data.");
  }
}

// --- New Action to Fetch Data for Limits Page ---

export interface SubscriptionLimitViewData {
  stripePriceId: string;
  stripeProductName: string;
  stripePriceNickname: string | null; // Nickname can be useful
  stripePriceActive: boolean;
  localPlanId?: number;
  localPlanName?: string;
  localUsageLimit?: number;
}

/**
 * Fetches active Stripe Prices and merges them with local SubscriptionPlan data.
 * Requires admin privileges.
 * @returns Promise<SubscriptionLimitViewData[]>
 */
export async function getSubscriptionLimitData(): Promise<
  SubscriptionLimitViewData[]
> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required.");
  }

  try {
    // 1. Fetch all active Stripe Prices with expanded product info
    const stripePrices = await stripe.prices.list({
      active: true, // Fetch only active prices
      limit: 100, // Adjust limit as needed
      expand: ["data.product"], // Expand product data
    });

    // 2. Fetch all local subscription plans from the database
    const localPlans = await subscriptionPlanRepository.findAll();
    const localPlansMap = new Map(
      localPlans.map((plan) => [plan.stripePriceId, plan])
    );

    // 3. Merge Stripe Price data with local data
    const combinedData = stripePrices.data
      .map((price): SubscriptionLimitViewData | null => {
        // Ensure product is expanded and is an object with an ID and name
        const product = price.product;
        if (
          !product ||
          typeof product === "string" ||
          !("id" in product) ||
          !("name" in product)
        ) {
          console.warn(
            `Price ${price.id} is missing expanded product information or product is inactive/archived. Skipping.`
          );
          // If product is just an ID string or deleted, we might skip or handle differently
          // For now, skip if essential info (like name) is missing from the expanded object
          return null;
        }

        const stripePriceId = price.id;
        const localPlan = localPlansMap.get(stripePriceId);

        const data: SubscriptionLimitViewData = {
          stripePriceId: stripePriceId,
          stripeProductName: product.name,
          stripePriceNickname: price.nickname,
          stripePriceActive: price.active,
          localPlanId: localPlan?.id,
          localPlanName: localPlan?.name,
          localUsageLimit: localPlan?.usageLimit,
        };
        return data;
      })
      .filter((item): item is SubscriptionLimitViewData => item !== null); // Filter out nulls

    // Optional: Sort data, e.g., by product name then price nickname
    combinedData.sort((a, b) => {
      const nameCompare = a.stripeProductName.localeCompare(
        b.stripeProductName
      );
      if (nameCompare !== 0) return nameCompare;
      // Sort by nickname if names are the same (handle null nicknames)
      const nickA = a.stripePriceNickname ?? "";
      const nickB = b.stripePriceNickname ?? "";
      return nickA.localeCompare(nickB);
    });

    return combinedData;
  } catch (error) {
    console.error("Error fetching subscription limit data:", error);
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API Error: ${error.message}`);
    }
    throw new Error("Failed to fetch subscription limit data.");
  }
}

// --- End New Action ---

// Schema definition removed from here, imported above

export type UpsertSubscriptionPlanState = {
  message?: string | null;
  errors?: {
    stripePriceId?: string[];
    name?: string[];
    usageLimit?: string[];
    _form?: string[]; // General form errors
  };
  success?: boolean;
};

/**
 * Server action to create or update a local SubscriptionPlan record.
 * Requires admin privileges.
 * @param prevState - The previous state (used with useFormState).
 * @param formData - The form data containing plan details.
 * @returns Promise<UpsertSubscriptionPlanState> - The new state including success/error messages.
 */
export async function upsertSubscriptionPlanAction(
  prevState: UpsertSubscriptionPlanState | undefined,
  formData: FormData
): Promise<UpsertSubscriptionPlanState> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return { success: false, errors: { _form: ["Unauthorized access."] } };
  }

  // Validate form data
  const validatedFields = upsertSubscriptionPlanSchema.safeParse({
    stripePriceId: formData.get("stripePriceId"),
    name: formData.get("name"),
    usageLimit: formData.get("usageLimit"),
  });

  // If validation fails, return errors
  if (!validatedFields.success) {
    console.log(
      "Validation Errors:",
      validatedFields.error.flatten().fieldErrors
    );
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check the fields.",
    };
  }

  const { stripePriceId, name, usageLimit } = validatedFields.data;

  try {
    // Perform the upsert operation using the repository
    await subscriptionPlanRepository.upsertByStripePriceId(
      stripePriceId,
      name,
      usageLimit
    );

    // Revalidate the path to update the UI
    revalidatePath("/settings/admin/subscriptions"); // Adjust path if needed

    return { success: true, message: "Subscription plan saved successfully." };
  } catch (error) {
    console.error("Error upserting subscription plan:", error);
    return {
      success: false,
      errors: { _form: ["Failed to save subscription plan."] },
      message: "An unexpected error occurred.",
    };
  }
}
