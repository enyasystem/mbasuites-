import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { AnimatedTextarea } from "@/components/ui/animated-textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface ReviewFormProps {
  roomId: string;
  roomName: string;
  onReviewSubmitted?: () => void;
}

const reviewSchema = z.object({
  comment: z.string().min(10, "Review must be at least 10 characters").max(500, "Review must be less than 500 characters"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export function ReviewForm({ roomId, roomName, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    mode: "onChange",
  });

  const { user } = useAuth();
  const { logActivity } = useActivityLog();

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login required",
        description: "You must be logged in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const metadata = user?.user_metadata as unknown as Record<string, unknown> | undefined;
      const userName = typeof metadata?.full_name === 'string' ? metadata.full_name : (user?.email ?? "Guest");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- supabase client types don't include 'reviews' table yet
      const { data: insertData, error } = await (supabase as any)
        .from("reviews")
        .insert({
          room_id: roomId,
          user_id: user.id,
          user_name: userName,
          rating,
          comment: data.comment,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await logActivity({
        action: "create",
        entityType: "review",
        entityId: insertData.id,
        details: {
          roomId,
          roomName,
          rating,
          comment: data.comment,
        },
      });

      toast({
        title: "Review submitted!",
        description: "Thanks for your feedback.",
      });

      setRating(0);
      reset();

      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err: unknown) {
      console.error("Error submitting review:", err);
      const e = err as { message?: string };
      toast({
        title: "Failed to submit review",
        description: e?.message || String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>Share your experience with {roomName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground"
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            {rating === 0 && (
              <p className="text-xs text-muted-foreground">Please select a rating</p>
            )}
          </div>

          <AnimatedTextarea
            label="Your Review"
            placeholder="Tell us about your experience..."
            rows={4}
            error={errors.comment?.message}
            success={dirtyFields.comment && !errors.comment}
            {...register("comment")}
          />

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
