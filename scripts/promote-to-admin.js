const { PrismaClient } = require("@prisma/client");
const readline = require("readline");
const path = require("path");

// Use absolute path for the .env.local file if needed
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function promoteToAdmin() {
  return new Promise((resolve) => {
    rl.question("Enter user email to promote to admin: ", async (email) => {
      try {
        // Find the user by email in the local database
        const user = await prisma.user.findFirst({
          where: { email },
        });

        if (!user) {
          console.error(`No user found with email: ${email}`);
          rl.close();
          resolve();
          return;
        }

        // Update the isAdmin flag to true
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { isAdmin: true },
        });

        console.log(`User ${email} is now an admin`);
      } catch (error) {
        console.error("Error updating user:", error);
      } finally {
        await prisma.$disconnect();
        rl.close();
        resolve();
      }
    });
  });
}

promoteToAdmin();
