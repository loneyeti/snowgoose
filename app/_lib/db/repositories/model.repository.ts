import { Model } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class ModelRepository extends BaseRepository {
  async findAll(): Promise<Model[]> {
    try {
      return await this.prisma.model.findMany({
        orderBy: {
          id: "asc",
        },
        include: {
          apiVendor: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findById(id: number): Promise<Model | null> {
    try {
      return await this.prisma.model.findUnique({
        where: { id },
        include: {
          apiVendor: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByApiName(apiName: string): Promise<Model | null> {
    try {
      return await this.prisma.model.findFirst({
        where: { apiName },
        include: {
          apiVendor: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(data: {
    apiName: string;
    name: string;
    isVision: boolean;
    isImageGeneration: boolean;
    isThinking: boolean;
    apiVendorId: number;
    inputTokenCost?: number | null;
    outputTokenCost?: number | null;
    paidOnly: boolean; // Add paidOnly
  }): Promise<Model> {
    try {
      return await this.prisma.model.create({
        data,
        include: {
          apiVendor: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    id: number,
    data: {
      apiName?: string;
      name?: string;
      isVision?: boolean;
      isImageGeneration?: boolean;
      isThinking?: boolean;
      apiVendorId?: number;
      inputTokenCost?: number | null;
      outputTokenCost?: number | null;
      paidOnly?: boolean; // Add paidOnly
    }
  ): Promise<Model> {
    try {
      return await this.prisma.model.update({
        where: { id },
        data,
        include: {
          apiVendor: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: number): Promise<Model> {
    try {
      return await this.prisma.model.delete({
        where: { id },
        include: {
          apiVendor: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const modelRepository = new ModelRepository();
