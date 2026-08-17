import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

interface RatingDialogProps {
  onClose: () => void;
}

const RatingDialog = ({ onClose }: RatingDialogProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!orderId.trim() || rating === 0) {
      toast({
        title: language === 'ta' ? 'பிழை' : 'Error',
        description: language === 'ta' 
          ? 'ஆர்டர் எண் மற்றும் மதிப்பீடு தேவை' 
          : 'Order ID and rating are required',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('delivery_ratings').insert({
        user_id: user.id,
        order_id: orderId.trim(),
        rating,
        feedback: feedback.trim() || null,
      });

      if (error) throw error;

      toast({
        title: language === 'ta' ? 'நன்றி!' : 'Thank you!',
        description: language === 'ta' 
          ? 'உங்கள் மதிப்பீடு சமர்ப்பிக்கப்பட்டது' 
          : 'Your rating has been submitted successfully',
      });
      onClose();
    } catch (error: any) {
      toast({
        title: language === 'ta' ? 'பிழை' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold">
          {language === 'ta' ? 'விநியோகத்தை மதிப்பிடவும்' : 'Rate Your Delivery'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'ta' 
            ? 'உங்கள் அனுபவம் எங்களுக்கு மேம்படுத்த உதவுகிறது' 
            : 'Your feedback helps us improve'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>{language === 'ta' ? 'ஆர்டர் எண்' : 'Order Number'}</Label>
          <Input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder={language === 'ta' ? 'எ.கா: #12345' : 'e.g: #12345'}
          />
        </div>

        <div>
          <Label className="mb-2 block">
            {language === 'ta' ? 'மதிப்பீடு' : 'Rating'}
          </Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>{language === 'ta' ? 'கருத்து (விருப்பத்தேர்வு)' : 'Feedback (Optional)'}</Label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={language === 'ta' 
              ? 'உங்கள் அனுபவத்தைப் பகிரவும்...' 
              : 'Share your experience...'}
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (language === 'ta' ? 'சமர்ப்பிக்கிறது...' : 'Submitting...') 
            : (language === 'ta' ? 'சமர்ப்பிக்கவும்' : 'Submit')}
        </Button>
      </div>
    </Card>
  );
};

export default RatingDialog;
