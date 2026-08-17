import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onClose: () => void;
}

const ImageUpload = ({ onClose }: ImageUploadProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [cardNumber, setCardNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: language === 'ta' ? 'பிழை' : 'Error',
          description: language === 'ta' ? 'கோப்பு அளவு 5MB க்கும் குறைவாக இருக்க வேண்டும்' : 'File size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!cardNumber.trim() || !selectedFile) {
      toast({
        title: language === 'ta' ? 'பிழை' : 'Error',
        description: language === 'ta' ? 'அட்டை எண் மற்றும் படம் தேவை' : 'Card number and image are required',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload image to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('ration-cards')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ration-cards')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase.from('ration_cards').insert({
        user_id: user.id,
        card_number: cardNumber.trim(),
        card_image_url: publicUrl,
      });

      if (dbError) throw dbError;

      toast({
        title: language === 'ta' ? 'வெற்றி!' : 'Success!',
        description: language === 'ta' 
          ? 'ரேஷன் அட்டை சமர்ப்பிக்கப்பட்டது. சரிபார்ப்பு நிலுவையில் உள்ளது.' 
          : 'Ration card submitted. Verification pending.',
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
        <ImageIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">
          {language === 'ta' ? 'ரேஷன் அட்டை சரிபார்ப்பு' : 'Verify Ration Card'}
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label>{language === 'ta' ? 'ரேஷன் அட்டை எண்' : 'Ration Card Number'}</Label>
          <Input
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder={language === 'ta' ? 'அட்டை எண்ணை உள்ளிடவும்' : 'Enter card number'}
          />
        </div>

        <div>
          <Label>{language === 'ta' ? 'அட்டை புகைப்படம்' : 'Card Photo'}</Label>
          <div className="mt-2">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {language === 'ta' ? 'புகைப்படம் பதிவேற்ற கிளிக் செய்யவும்' : 'Click to upload photo'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP (max 5MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {preview && (
          <div className="mt-4">
            <Label>{language === 'ta' ? 'முன்னோட்டம்' : 'Preview'}</Label>
            <img
              src={preview}
              alt="Preview"
              className="mt-2 w-full h-48 object-cover rounded-lg border"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (language === 'ta' ? 'பதிவேற்றுகிறது...' : 'Uploading...') 
            : (language === 'ta' ? 'சமர்ப்பிக்கவும்' : 'Submit')}
        </Button>
      </div>
    </Card>
  );
};

export default ImageUpload;
