import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

interface ComplaintFormProps {
  onClose: () => void;
}

const ComplaintForm = ({ onClose }: ComplaintFormProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      toast({
        title: language === 'ta' ? 'பிழை' : 'Error',
        description: language === 'ta' ? 'அனைத்து புலங்களையும் நிரப்பவும்' : 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('complaints').insert({
        user_id: user.id,
        subject: subject.trim(),
        description: description.trim(),
        priority,
      });

      if (error) throw error;

      toast({
        title: language === 'ta' ? 'வெற்றி!' : 'Success!',
        description: language === 'ta' 
          ? 'உங்கள் புகார் பதிவு செய்யப்பட்டது' 
          : 'Your complaint has been submitted successfully',
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
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">
          {language === 'ta' ? 'புகார் / கருத்து பதிவு செய்யுங்கள்' : 'Submit Complaint / Feedback'}
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label>{language === 'ta' ? 'தலைப்பு' : 'Subject'}</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={language === 'ta' ? 'உங்கள் பிரச்சனையை சுருக்கமாக விவரிக்கவும்' : 'Brief description of your issue'}
            maxLength={100}
          />
        </div>

        <div>
          <Label>{language === 'ta' ? 'முன்னுரிமை' : 'Priority'}</Label>
          <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{language === 'ta' ? 'குறைவு' : 'Low'}</SelectItem>
              <SelectItem value="medium">{language === 'ta' ? 'நடுத்தர' : 'Medium'}</SelectItem>
              <SelectItem value="high">{language === 'ta' ? 'உயர்' : 'High'}</SelectItem>
              <SelectItem value="urgent">{language === 'ta' ? 'அவசர' : 'Urgent'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{language === 'ta' ? 'விவரம்' : 'Description'}</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={language === 'ta' 
              ? 'உங்கள் பிரச்சனையை விரிவாக விளக்கவும்...' 
              : 'Explain your issue in detail...'}
            rows={5}
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

export default ComplaintForm;
