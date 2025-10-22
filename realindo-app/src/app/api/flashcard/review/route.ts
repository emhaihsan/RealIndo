import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Initialize Supabase with service role key (bypass RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation schema
const reviewSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  flashcardId: z.number().int().positive("flashcardId must be a positive integer"),
  difficulty: z.enum(["repeat", "hard", "good", "easy"]),
  nextReviewAt: z.string(), // ISO date string
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = reviewSchema.parse(body);
    const { userId, flashcardId, difficulty, nextReviewAt } = validatedData;

    console.log("📝 Flashcard Review Request:", { userId, flashcardId, difficulty });

    // Normalize wallet address
    const normalizedUserId = userId.toLowerCase();

    // Get user ID from wallet address
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", normalizedUserId)
      .single();

    if (userError || !user) {
      console.error("User not found:", userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Record review in user_flashcard_reviews
    const { error: reviewError } = await supabase
      .from("user_flashcard_reviews")
      .upsert(
        {
          user_id: user.id,
          flashcard_id: flashcardId,
          difficulty,
          last_reviewed_at: new Date().toISOString(),
          next_review_at: nextReviewAt,
        },
        {
          onConflict: "user_id,flashcard_id",
        }
      );

    if (reviewError) {
      console.error("❌ Error recording review:", {
        message: reviewError.message,
        code: reviewError.code,
        details: reviewError.details,
        hint: reviewError.hint,
      });
      return NextResponse.json(
        { success: false, error: "Failed to record review" },
        { status: 500 }
      );
    }

    console.log("✅ Review recorded successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Review recorded",
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
