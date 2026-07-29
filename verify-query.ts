import { connectDB } from "./src/lib/db";
import { StudentModel } from "./src/lib/models";

async function testParticipantQuery(): Promise<void> {
  console.log("=== Testing Participant Query with New DB ===");

  try {
    // Connect to MongoDB
    await connectDB();
    console.log("✅ Database connected!");

    // Count students
    const count = await StudentModel.countDocuments();
    console.log(`📊 Total students: ${count}`);

    // Fetch one student
    const student = await StudentModel.findOne().lean();

    if (student) {
      console.log("👤 Sample student:");
      console.log(student);
    } else {
      console.log("ℹ️ No students found in the collection.");
    }

    console.log("✅ Query completed successfully!");
  } catch (error) {
    console.error("❌ Query failed:");
    console.error(error);
  } finally {
    process.exit(0);
  }
}

void testParticipantQuery();