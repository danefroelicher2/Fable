// src/lib/setupDatabase.ts
import { supabase } from "./supabase";

export async function setupNotificationsTable() {
  try {
    // Check if notifications table exists by trying to select from it
    const { data, error: checkError } = await (supabase as any)
      .from("notifications")
      .select("id")
      .limit(1);

    if (checkError) {
      console.log(
        "Notifications table might not exist. Error:",
        checkError.message
      );
      console.log(
        "Please create the notifications table manually in your Supabase dashboard."
      );

      // Return instructions for manually creating the table
      return {
        success: false,
        message: `
The notifications table is missing. Please create it in your Supabase dashboard with these columns:
- id: uuid (primary key, default: uuid_generate_v4())
- user_id: uuid (references auth.users.id)
- action_type: text (not null)
- action_user_id: uuid (references auth.users.id)
- article_id: uuid (nullable, references public_articles.id)
- comment_id: uuid (nullable, references comments.id)
- created_at: timestamptz (not null, default: now())
- is_read: boolean (not null, default: false)
        `,
      };
    }

    // If we get here, the table exists
    console.log("Notifications table exists and is accessible");
    return {
      success: true,
      message: "Notifications table already exists",
    };
  } catch (error) {
    console.error("Setup database error:", error);
    return {
      success: false,
      message:
        "Error checking notifications table: " +
        (error instanceof Error ? error.message : String(error)),
    };
  }
}
