
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await prisma.$queryRaw<
    Array<{ result: number }>
  >`SELECT 1 AS result`;

  console.log("Database connection successful:", result);
}

main()
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
