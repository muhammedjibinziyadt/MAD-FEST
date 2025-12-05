"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { AdminSettingsModel } from "@/lib/models";
import { getAdminCredentials } from "@/lib/auth";
import { sendCredentialUpdateEmail } from "@/lib/email-service";

export async function updateAdminCredentials(
    prevState: { error?: string; success?: string },
    formData: FormData,
) {
    try {
        const username = String(formData.get("username") ?? "").trim();
        const password = String(formData.get("password") ?? "").trim();
        const currentPassword = String(formData.get("currentPassword") ?? "").trim();

        if (!username || !password || !currentPassword) {
            return { error: "All fields are required." };
        }

        // Verify current password
        const currentCredentials = await getAdminCredentials();
        if (currentPassword !== currentCredentials.password) {
            return { error: "Incorrect current password." };
        }

        if (password.length < 6) {
            return { error: "Password must be at least 6 characters long." };
        }

        await connectDB();

        // Update the first document found, or create if it doesn't exist (though it should exist by now)
        await AdminSettingsModel.findOneAndUpdate(
            {},
            { username, password },
            { upsert: true, new: true }
        );

        // Send email notification
        await sendCredentialUpdateEmail({ username, password });

        revalidatePath("/admin/settings");
        return { success: "Credentials updated successfully." };
    } catch (error) {
        console.error("Failed to update credentials:", error);
        return { error: "Failed to update credentials. Please try again." };
    }
}
