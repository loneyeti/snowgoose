import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Test querying models
    const models = await prisma.model.findMany({
      include: {
        apiVendor: true,
      },
    });
    console.log("Successfully connected to database!");
    console.log("\nModels found:", models.length);
    models.forEach((model) => {
      console.log(`- ${model.name} (${model.apiVendor?.name || "No vendor"})`);
    });

    // Test querying personas
    const personas = await prisma.persona.findMany();
    console.log("\nPersonas found:", personas.length);
    personas.forEach((persona) => {
      console.log(`- ${persona.name}`);
    });
  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
