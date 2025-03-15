import { User } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository {
  async findAll(): Promise<User[]> {
    try {
      console.log("Repository getting users");
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

  async update(
    id: number,
    data: {
      appearance_mode?: string;
      summary_model_preference_id?: number;
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
}

export const userRepository = new UserRepository();
