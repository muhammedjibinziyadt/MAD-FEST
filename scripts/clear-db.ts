import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
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

async function run() {
  const { connectDB } = await import("../src/lib/db");
  const {
    TeamModel,
    StudentModel,
    ProgramModel,
    JuryModel,
    AssignedProgramModel,
    ProgramRegistrationModel,
    RegistrationScheduleModel,
    PendingResultModel,
    ApprovedResultModel,
    LiveScoreModel,
    ReplacementRequestModel,
    NotificationModel,
    PollModel,
    PredictionModel,
    PredictionEventModel,
    FestoryPostModel,
    FestoryUserModel,
    FestoryCommentModel,
    VoteModel,
    UserScoreModel,
  } = await import("../src/lib/models");

  console.log("Connecting to MongoDB database at Atlas...");
  await connectDB();

  console.log("Wiping all collections from live database...");
  await Promise.all([
    TeamModel.deleteMany({}),
    StudentModel.deleteMany({}),
    ProgramModel.deleteMany({}),
    JuryModel.deleteMany({}),
    AssignedProgramModel.deleteMany({}),
    ProgramRegistrationModel.deleteMany({}),
    RegistrationScheduleModel.deleteMany({}),
    PendingResultModel.deleteMany({}),
    ApprovedResultModel.deleteMany({}),
    LiveScoreModel.deleteMany({}),
    ReplacementRequestModel.deleteMany({}),
    NotificationModel.deleteMany({}),
    PollModel.deleteMany({}),
    PredictionModel.deleteMany({}),
    PredictionEventModel.deleteMany({}),
    FestoryPostModel.deleteMany({}),
    FestoryUserModel.deleteMany({}),
    FestoryCommentModel.deleteMany({}),
    VoteModel.deleteMany({}),
    UserScoreModel.deleteMany({}),
  ]);

  console.log("SUCCESS! All dummy/mock database records have been deleted from live MongoDB.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error clearing database:", err);
  process.exit(1);
});
