import { GlobalSettings } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class GlobalSettingsRepository extends BaseRepository {
  /**
   * Returns the single GlobalSettings row, or null if it hasn't been
   * created yet.
   */
  async get(): Promise<GlobalSettings | null> {
    try {
      return await this.prisma.globalSettings.findFirst({
        orderBy: { id: "asc" },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Creates or updates the single GlobalSettings row.
   */
  async upsert(data: {
    defaultModelId: number | null;
  }): Promise<GlobalSettings> {
    try {
      const existing = await this.get();
      if (existing) {
        return await this.prisma.globalSettings.update({
          where: { id: existing.id },
          data,
        });
      }
      return await this.prisma.globalSettings.create({ data });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const globalSettingsRepository = new GlobalSettingsRepository();
