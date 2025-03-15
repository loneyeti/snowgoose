import { APIVendor } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class APIVendorRepository extends BaseRepository {
  async findAll(): Promise<APIVendor[]> {
    try {
      return await this.prisma.aPIVendor.findMany({
        orderBy: {
          id: "asc",
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findById(id: number): Promise<APIVendor | null> {
    try {
      return await this.prisma.aPIVendor.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByName(name: string): Promise<APIVendor | null> {
    try {
      return await this.prisma.aPIVendor.findFirst({
        where: { name },
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const apiVendorRepository = new APIVendorRepository();
