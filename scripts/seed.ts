import { seedDatabase } from "../src/lib/data";

async function main() {
  console.log("Seeding database...");
  await seedDatabase();
  console.log("Database seed completed successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
