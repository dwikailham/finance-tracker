import { beforeEach, afterAll } from "vitest";
import prisma from "../src/config/database";

// Setup before each test
beforeEach(async () => {
  // Clear tables in dependency order
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`;

  const tables = tablenames
    .map(({ tablename }) => `"${tablename}"`)
    .join(", ");

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
});

// After all tests, disconnect prisma
afterAll(async () => {
  await prisma.$disconnect();
});
