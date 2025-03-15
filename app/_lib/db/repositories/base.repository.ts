import { PrismaClient } from "@prisma/client";
import prisma from "../prisma";

export class BaseRepository {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  protected handleError(error: any): never {
    console.error("Database operation failed:", error);
    throw new Error("Database operation failed");
  }
}
