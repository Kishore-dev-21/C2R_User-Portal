import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className="fixed top-4 right-4 z-50 bg-card shadow-lg hover:shadow-xl transition-all"
    >
      <Languages className="w-4 h-4 mr-2" />
      {language === 'en' ? 'த' : 'EN'}
    </Button>
  );
};

export default LanguageToggle;