import { ConversationHistory } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class HistoryRepository extends BaseRepository {
  async findAll(userId: number): Promise<ConversationHistory[]> {
    console.log("USERID:");
    console.log(userId);
    try {
      return await this.prisma.conversationHistory.findMany({
        where: { userId },
        orderBy: {
          timestamp: "desc",
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findById(id: number): Promise<ConversationHistory | null> {
    try {
      return await this.prisma.conversationHistory.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(data: {
    userId: number;
    title?: string;
    conversation: string;
  }): Promise<ConversationHistory> {
    try {
      return await this.prisma.conversationHistory.create({
        data: {
          ...data,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: number): Promise<ConversationHistory> {
    try {
      return await this.prisma.conversationHistory.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const historyRepository = new HistoryRepository();
