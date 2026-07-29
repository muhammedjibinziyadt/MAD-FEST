import fs from "fs";
import path from "path";

// Load environment variables from .env.local or .env
const loadEnv = (filename: string) => {
  const envPath = path.resolve(process.cwd(), filename);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const idx = trimmed.indexOf("=");
        if (idx > 0) {
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          process.env[key] = val;
        }
      }
    }
  }
};

loadEnv(".env");
loadEnv(".env.local");

async function main() {
  console.log("Seeding database...");
  const { seedDatabase } = await import("../src/lib/data");
  await seedDatabase();
  console.log("Database seed completed successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});


