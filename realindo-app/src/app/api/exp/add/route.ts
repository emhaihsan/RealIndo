import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Initialize Supabase with service role key (for backend operations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation schema
const addExpSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  type: z.enum(["video_complete", "flashcard_session"]).describe("type must be 'video_complete' or 'flashcard_session'"),
  sourceId: z.number().int().positive("sourceId must be a positive integer"),
});

type AddExpRequest = z.infer<typeof addExpSchema>;

// Determine EXP amount based on type
function getExpAmount(type: "video_complete" | "flashcard_session"): number {
  return type === "video_complete" ? 10 : 15;
}

// Check if user already earned EXP for this source
async function checkDuplicate(
  userId: string,
  type: "video_complete" | "flashcard_session",
  sourceId: number
): Promise<boolean> {
  try {
    if (type === "video_complete") {
      // Check user_video_progress table
      const { data, error } = await supabase
        .from("user_video_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("video_id", sourceId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking video progress:", error);
        throw error;
      }

      return !!data; // true if already completed
    } else {
      // For flashcard_session, check if completed in last 5 minutes
      // (prevent rapid duplicate submissions)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("exp_transactions")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "flashcard_session")
        .eq("source_id", sourceId)
        .gte("created_at", fiveMinutesAgo)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking flashcard transaction:", error);
        throw error;
      }

      return !!data; // true if already earned recently
    }
  } catch (error) {
    console.error("Error checking duplicate:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = addExpSchema.parse(body);
    const { userId, type, sourceId } = validatedData;

    console.log("📝 EXP Add Request:", { userId, type, sourceId });

    // Normalize wallet address
    const normalizedUserId = userId.toLowerCase();

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, current_exp, total_exp_earned")
      .eq("wallet_address", normalizedUserId)
      .single();

    if (userError || !user) {
      console.error("User not found:", userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get EXP amount
    const expAmount = getExpAmount(type);

    // Calculate new balances (for logging)
    const newCurrentExp = user.current_exp + expAmount;
    const newTotalExp = user.total_exp_earned + expAmount;

    // Log transaction FIRST (before duplicate check) - every attempt is recorded
    console.log("📝 Attempting to log transaction:", {
      user_id: user.id,
      type,
      source_id: sourceId,
      amount: expAmount,
    });

    const { error: logError, data: logData } = await supabase
      .from("exp_transactions")
      .insert([
        {
          user_id: user.id,
          type,
          source_id: sourceId,
          amount: expAmount,
        },
      ])
      .select();

    if (logError) {
      console.error("❌ Error logging transaction:", {
        message: logError.message,
        code: logError.code,
        details: logError.details,
        hint: logError.hint,
      });
      // Don't fail the request - continue with duplicate check
    } else {
      console.log("✅ Transaction logged successfully:", logData);
    }

    // Check for duplicate AFTER logging
    const isDuplicate = await checkDuplicate(user.id, type, sourceId);
    if (isDuplicate) {
      console.log("⚠️ Duplicate award attempt (transaction logged):", { userId, type, sourceId });
      return NextResponse.json(
        {
          success: true,
          message: "Already earned for this source",
          newExp: user.current_exp,
          totalExp: user.total_exp_earned,
        },
        { status: 200 }
      );
    }

    // Update user EXP (atomic operation) - only if NOT duplicate
    const { error: updateError } = await supabase
      .from("users")
      .update({
        current_exp: newCurrentExp,
        total_exp_earned: newTotalExp,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user EXP:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update EXP" },
        { status: 500 }
      );
    }

    // For video_complete, also record in user_video_progress
    if (type === "video_complete") {
      const { error: progressError } = await supabase
        .from("user_video_progress")
        .insert([
          {
            user_id: user.id,
            video_id: sourceId,
            completed_at: new Date().toISOString(),
          },
        ]);

      if (progressError) {
        console.error("Error recording video progress:", progressError);
        // Don't fail - EXP was already added
      }
    }

    console.log("✅ EXP awarded successfully:", {
      userId,
      type,
      expAmount,
      newCurrentExp,
      newTotalExp,
    });

    return NextResponse.json(
      {
        success: true,
        message: `+${expAmount} EXP awarded`,
        newExp: newCurrentExp,
        totalExp: newTotalExp,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
