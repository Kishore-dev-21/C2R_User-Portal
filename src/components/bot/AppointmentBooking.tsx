import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Clock } from 'lucide-react';

interface AppointmentBookingProps {
  onClose: () => void;
}

const AppointmentBooking = ({ onClose }: AppointmentBookingProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handleSubmit = async () => {
    if (!date || !time) {
      toast({
        title: language === 'ta' ? 'பிழை' : 'Error',
        description: language === 'ta' ? 'தேதி மற்றும் நேரத்தை தேர்ந்தெடுக்கவும்' : 'Please select date and time',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('appointments').insert({
        user_id: user.id,
        appointment_date: date.toISOString().split('T')[0],
        appointment_time: time,
        notes: notes || null,
      });

      if (error) throw error;

      toast({
        title: language === 'ta' ? 'வெற்றி!' : 'Success!',
        description: language === 'ta' 
          ? 'உங்கள் சந்திப்பு பதிவு செய்யப்பட்டது' 
          : 'Your appointment has been booked successfully',
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
        <CalendarIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">
          {language === 'ta' ? 'சந்திப்பு பதிவு செய்யுங்கள்' : 'Book Appointment'}
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label>{language === 'ta' ? 'தேதி தேர்ந்தெடுக்கவும்' : 'Select Date'}</Label>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
        </div>

        <div>
          <Label>{language === 'ta' ? 'நேரம் தேர்ந்தெடுக்கவும்' : 'Select Time'}</Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger>
              <SelectValue placeholder={language === 'ta' ? 'நேரம்' : 'Time'} />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {slot}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{language === 'ta' ? 'குறிப்புகள் (விருப்பத்தேர்வு)' : 'Notes (Optional)'}</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={language === 'ta' ? 'கூடுதல் தகவல்...' : 'Additional information...'}
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (language === 'ta' ? 'பதிவு செய்கிறது...' : 'Booking...') 
            : (language === 'ta' ? 'உறுதி செய்' : 'Confirm')}
        </Button>
      </div>
    </Card>
  );
};

export default AppointmentBooking;
