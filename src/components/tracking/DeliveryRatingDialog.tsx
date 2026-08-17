import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeliveryRatingDialogProps {
  orderId: string;
  onClose: () => void;
}

const DeliveryRatingDialog = ({ orderId, onClose }: DeliveryRatingDialogProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("delivery_ratings").insert({
        user_id: user.id,
        order_id: orderId,
        rating,
        feedback: feedback.trim() || null,
      });

      if (error) throw error;
      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch (error: any) {
      toast({
        title: language === "ta" ? "பிழை" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-success/30 bg-success/5 animate-scale-in">
        <CardContent className="p-6 text-center space-y-2">
          <div className="text-4xl">🎉</div>
          <p className="font-bold text-success text-lg">
            {language === "ta" ? "நன்றி!" : "Thank You!"}
          </p>
          <p className="text-sm text-muted-foreground">
            {language === "ta"
              ? "உங்கள் மதிப்பீடு சமர்ப்பிக்கப்பட்டது"
              : "Your feedback has been recorded"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 shadow-elegant animate-fade-in overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-primary p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-primary-foreground">
              {language === "ta" ? "உங்கள் அனுபவத்தை மதிப்பிடுங்கள்" : "Rate Your Experience"}
            </p>
            <p className="text-xs text-primary-foreground/80">
              {language === "ta" ? "உங்கள் கருத்து முக்கியம்" : "Your feedback matters to us"}
            </p>
          </div>
          <button onClick={onClose} className="text-primary-foreground/70 hover:text-primary-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Stars */}
          <div className="text-center space-y-2">
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all duration-200 hover:scale-125 active:scale-95"
                >
                  <Star
                    className={`h-9 w-9 transition-colors duration-200 ${
                      star <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-border"
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hoveredRating || rating) > 0 && (
              <p className="text-sm font-medium text-foreground animate-fade-in">
                {ratingLabels[hoveredRating || rating]}
              </p>
            )}
          </div>

          {/* Feedback */}
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={
              language === "ta"
                ? "உங்கள் அனுபவத்தைப் பகிரவும்..."
                : "Share your delivery experience..."
            }
            rows={3}
            className="resize-none text-sm"
          />

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isSubmitting
              ? language === "ta" ? "சமர்ப்பிக்கிறது..." : "Submitting..."
              : language === "ta" ? "சமர்ப்பிக்கவும்" : "Submit Rating"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryRatingDialog;
