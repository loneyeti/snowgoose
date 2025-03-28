import { PrismaClient } from "@prisma/client";
import prisma from "../prisma";

export class BaseRepository {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Handles errors during database operations.
   * Re-throws the original error to be caught and processed by the calling layer (e.g., Server Action).
   * @param error The error caught during the database operation.
   */
  protected handleError(error: unknown): never {
    // Re-throw the original error. The Server Action's catch block
    // using handleServerError will log it and format the user response.
    throw error;
  }
}
