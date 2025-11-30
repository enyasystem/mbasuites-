import { useState } from "react";
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

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate API call - in real implementation, this would save to database
    setTimeout(() => {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback. You earned 50 loyalty points!",
      });
      
      setRating(0);
      reset();
      setLoading(false);
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    }, 1000);
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
