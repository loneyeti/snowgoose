import { OutputFormat } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class OutputFormatRepository extends BaseRepository {
  async findAll(): Promise<OutputFormat[]> {
    try {
      return await this.prisma.outputFormat.findMany({
        orderBy: {
          id: "asc",
        },
        include: {
          renderType: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findById(id: number): Promise<OutputFormat | null> {
    try {
      return await this.prisma.outputFormat.findUnique({
        where: { id },
        include: {
          renderType: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(data: {
    name: string;
    prompt: string;
    renderTypeId?: number;
    ownerId?: number;
  }): Promise<OutputFormat> {
    try {
      return await this.prisma.outputFormat.create({
        data,
        include: {
          renderType: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    id: number,
    data: {
      name?: string;
      prompt?: string;
      renderTypeId?: number;
      ownerId?: number;
    }
  ): Promise<OutputFormat> {
    try {
      return await this.prisma.outputFormat.update({
        where: { id },
        data,
        include: {
          renderType: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: number): Promise<OutputFormat> {
    try {
      return await this.prisma.outputFormat.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const outputFormatRepository = new OutputFormatRepository();
