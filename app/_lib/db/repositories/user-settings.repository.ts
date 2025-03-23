import { UserSettings } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class UserSettingsRepository extends BaseRepository {
  async findAll(): Promise<UserSettings[]> {
    try {
      //console.log("Repository getting user settings");
      return await this.prisma.userSettings.findMany({
        orderBy: {
          id: "asc",
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findById(id: number): Promise<UserSettings | null> {
    try {
      return await this.prisma.userSettings.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByUserId(userId: number): Promise<UserSettings | null> {
    try {
      return await this.prisma.userSettings.findFirst({
        where: { userId },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(data: {
    userId: number;
    appearanceMode: string;
    summaryModelPreferenceId?: number;
  }): Promise<UserSettings> {
    try {
      return await this.prisma.userSettings.create({
        data,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    id: number,
    data: {
      appearanceMode: string;
      summaryModelPreferenceId?: number;
    }
  ): Promise<UserSettings> {
    try {
      return await this.prisma.userSettings.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async upsert(
    userId: number,
    data: {
      appearanceMode: string;
      summaryModelPreferenceId?: number;
    }
  ): Promise<UserSettings> {
    try {
      const existingSettings = await this.findByUserId(userId);
      if (existingSettings) {
        return await this.update(existingSettings.id, data);
      }
      return await this.create({ userId, ...data });
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}

export const userSettingsRepository = new UserSettingsRepository();
