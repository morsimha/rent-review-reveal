
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { themeConfig } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          toast({
            title: "התחברת בהצלחה!",
            description: "ברוך הבא למעצב הדירות",
          });
          navigate('/');
        } else {
          toast({
            title: "שגיאה בהתחברות",
            description: result.error || "לא ניתן להתחבר",
            variant: "destructive",
          });
        }
      } else {
        const result = await signup(email, password, fullName);
        if (result.success) {
          toast({
            title: "נרשמת בהצלחה!",
            description: "אנא בדוק את המייל שלך לאישור החשבון",
          });
          setIsLogin(true);
        } else {
          toast({
            title: "שגיאה בהרשמה",
            description: result.error || "לא ניתן להירשם",
            variant: "destructive",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${themeConfig.backgroundGradient} flex items-center justify-center p-4`} dir="rtl">
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
          <CardTitle className="text-2xl font-bold">
            {themeConfig.mainEmoji} מעצב הדירות
          </CardTitle>
          <CardDescription>
            {isLogin ? 'התחבר לחשבון שלך' : 'צור חשבון חדש'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                  שם מלא
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="הכנס שם מלא"
                  className="text-right"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                כתובת מייל
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="הכנס כתובת מייל"
                className="text-right"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                סיסמא
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="הכנס סיסמא"
                className="text-right"
                required
              />
            </div>
            
            <Button
              type="submit"
              className={`w-full ${themeConfig.buttonGradient} text-white`}
              disabled={loading}
            >
              {loading ? 'רק רגע...' : (isLogin ? 'התחבר' : 'הירשם')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isLogin ? 'אין לך חשבון? הירשם כאן' : 'יש לך חשבון? התחבר כאן'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
