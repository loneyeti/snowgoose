import { MCPTool } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class MCPToolRepository extends BaseRepository {
  async findAll(): Promise<MCPTool[]> {
    try {
      return await this.prisma.mCPTool.findMany({
        orderBy: {
          id: "asc",
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findById(id: number): Promise<MCPTool | null> {
    try {
      return await this.prisma.mCPTool.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(data: { name: string; path: string }): Promise<MCPTool> {
    try {
      return await this.prisma.mCPTool.create({
        data,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    id: number,
    data: { name?: string; path?: string }
  ): Promise<MCPTool> {
    try {
      return await this.prisma.mCPTool.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: number): Promise<MCPTool> {
    try {
      return await this.prisma.mCPTool.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const mcpToolRepository = new MCPToolRepository();
