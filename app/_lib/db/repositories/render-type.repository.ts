import { RenderType } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class RenderTypeRepository extends BaseRepository {
  async findAll(): Promise<RenderType[]> {
    try {
      console.log("Repository getting render types");
      return await this.prisma.renderType.findMany({
        orderBy: {
          id: "asc",
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findById(id: number): Promise<RenderType | null> {
    try {
      return await this.prisma.renderType.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(data: { name: string }): Promise<RenderType> {
    try {
      return await this.prisma.renderType.create({
        data,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: number, data: { name?: string }): Promise<RenderType> {
    try {
      return await this.prisma.renderType.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: number): Promise<RenderType> {
    try {
      return await this.prisma.renderType.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const renderTypeRepository = new RenderTypeRepository();
