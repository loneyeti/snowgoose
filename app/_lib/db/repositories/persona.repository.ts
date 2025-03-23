import { Persona, User } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class PersonaRepository extends BaseRepository {
  async findAll(): Promise<Persona[]> {
    try {
      console.log("Repository getting personas");
      return await this.prisma.persona.findMany({
        orderBy: {
          id: "asc",
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findById(id: number): Promise<Persona | null> {
    try {
      return await this.prisma.persona.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(data: {
    name: string;
    prompt: string;
    ownerId?: number | null;
  }): Promise<Persona> {
    try {
      return await this.prisma.persona.create({
        data: {
          name: data.name,
          prompt: data.prompt,
          ownerId: data.ownerId,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    id: number,
    data: { name?: string; prompt?: string; ownerId?: number | null }
  ): Promise<Persona> {
    try {
      return await this.prisma.persona.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: number): Promise<Persona> {
    try {
      return await this.prisma.persona.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllGlobal(): Promise<Persona[]> {
    try {
      console.log("Repository getting global personas");
      return await this.prisma.persona.findMany({
        where: {
          ownerId: null,
        },
        orderBy: {
          id: "asc",
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByUser(user: User): Promise<Persona[]> {
    try {
      console.log("Repository getting user personas");
      return await this.prisma.persona.findMany({
        where: {
          ownerId: user.id,
        },
        orderBy: {
          id: "asc",
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const personaRepository = new PersonaRepository();
