import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { CheckCircle, Home, Sparkles } from 'lucide-react';

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const { themeConfig } = useTheme();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className={`min-h-screen ${themeConfig.backgroundGradient} flex items-center justify-center p-4`} dir="rtl">
      {/* Themed Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        {themeConfig.backgroundEmojis.map((emoji, index) => {
          const positions = [
            'top-10 left-10 text-6xl',
            'top-32 right-20 text-4xl',
            'top-64 left-1/4 text-5xl',
            'bottom-40 right-1/3 text-6xl',
            'bottom-20 left-20 text-4xl',
            'top-1/2 right-10 text-5xl',
            'bottom-1/2 left-1/2 text-4xl'
          ];
          return (
            <div key={index} className={`absolute ${positions[index] || 'top-10 left-10 text-4xl'}`}>
              {emoji}
            </div>
          );
        })}
      </div>

      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            {themeConfig.mainEmoji} המייל אושר בהצלחה!
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            ברוך הבא ל-Rent Master! 🎉
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              החשבון שלך אושר בהצלחה! כעת תוכל להתחיל להשתמש באפליקציה ולנהל את הדירות שלך.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4" />
              <span>מוכן להתחיל את המסע שלך?</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <Button
            onClick={handleGoHome}
            className={`w-full ${themeConfig.buttonGradient} text-white text-lg py-3`}
          >
            <Home className="w-5 h-5 mr-2" />
            עבור לעמוד הראשי
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              תודה שבחרת ב-Rent Master! 🏠✨
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation; 