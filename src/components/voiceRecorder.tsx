import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, Music2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const VoiceRecorder: React.FC = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0); // רמת עוצמה בזמן אמת
  const [analysisResult, setAnalysisResult] = useState<string | null>(null); // תוצאת הניתוח לתצוגה
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioBlob = useRef<Blob | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // פונקציה לניטור עוצמה בזמן אמת
  const monitorVolume = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    microphone.connect(analyser);
    analyser.fftSize = 256;
    
    const updateVolume = () => {
      if (!isRecording) return;
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value) / dataArray.length;
      const normalizedVolume = Math.min(average / 128, 1); // נרמול בין 0-1
      
      setVolumeLevel(normalizedVolume);
      
      if (isRecording) {
        requestAnimationFrame(updateVolume);
      }
    };
    
    updateVolume();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      setRecordingDuration(0);
      setVolumeLevel(0);
      setAnalysisResult(null); // איפוס תוצאה קודמת

      // התחל ניטור עוצמה
      monitorVolume(stream);

      // Start timer
      timerInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
        }
        
        audioBlob.current = new Blob(audioChunks.current, { type: 'audio/webm' });
        setHasRecording(true);
        setVolumeLevel(0); // איפוס רמת העוצמה
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      
      toast({
        title: "🎤 הקלטה התחילה!",
        description: "שיר, שרוק, או זמזם את המנגינה שלך",
      });
    } catch (error) {
      toast({
        title: "אופס! 😅",
        description: "נראה שהמיקרופון שלך ביישן. בדוק את ההרשאות!",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      
      toast({
        title: "🎵 הקלטה נשמרה!",
        description: `${recordingDuration} שניות של קסם מוזיקלי`,
      });
    }
  };

  // ניתוח בסיסי של ההקלטה
  const analyzeAudioBasic = async (audioBlob: Blob, duration: number): Promise<string> => {
    try {
      // ניתוח בסיסי של הקול
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // חישוב עוצמה ממוצעת
      const channelData = audioBuffer.getChannelData(0);
      const avgVolume = channelData.reduce((sum, sample) => sum + Math.abs(sample), 0) / channelData.length;
      
      // חישוב שינויים בעוצמה (דינמיקה)
      let volumeChanges = 0;
      let prevVolume = Math.abs(channelData[0]);
      for (let i = 1000; i < channelData.length; i += 1000) {
        const currentVolume = Math.abs(channelData[i]);
        if (Math.abs(currentVolume - prevVolume) > 0.01) {
          volumeChanges++;
        }
        prevVolume = currentVolume;
      }
      
      // ניתוח מאפיינים
      const isDynamic = volumeChanges > duration * 2; // הרבה שינויים
      const isLoud = avgVolume > 0.1;
      const isSoft = avgVolume < 0.03;
      const isLong = duration > 8;
      const isShort = duration < 3;
      
      // יצירת תיאור חכם
      return generateSmartDescription(duration, isLoud, isSoft, isDynamic, isLong, isShort);
      
    } catch (error) {
      // אם הניתוח נכשל, תחזור לתיאור בסיסי
      return generateBasicDescription(duration);
    }
  };

  // יצירת תיאור חכם
  const generateSmartDescription = (
    duration: number, 
    isLoud: boolean, 
    isSoft: boolean, 
    isDynamic: boolean, 
    isLong: boolean, 
    isShort: boolean
  ): string => {
    
    const personalityTypes = [
      {
        condition: isLoud && isDynamic,
        responses: [
          "🔥 וואו! זה נשמע כמו אנרגיה טהורה! האם זה היה רוק או שאתה פשוט נמצא במצב רוח מעולה?",
          "⚡ איזה כוח! ההקלטה שלך מלאה באנרגיה - נשמע כמו שיר מנצח!",
          "🎸 הרגשתי את הרעידות עד כאן! זה בהחלט לא שיר ערש..."
        ]
      },
      {
        condition: isSoft && !isDynamic,
        responses: [
          "🌙 ממש יפה ועדין... זה היה שיר ערש או שאתה במוד רומנטי?",
          "🕊️ איזה עדינות! ההקלטה שלך נשמעת כמו מלאך שלוחש סודות",
          "🌸 ממש מרגיע ונעים - בדיוק מה שהלב צריך!"
        ]
      },
      {
        condition: isDynamic && !isLoud,
        responses: [
          "🎭 יש כאן הרבה רגש! הרגשתי עליות וירידות - זה נשמע כמו סיפור מוזיקלי",
          "🌊 כמו גלים בים! ההקלטה שלך מלאה בדינמיקה מעניינת",
          "🎢 איזה מסע רגשי! מהשקט לחזק ובחזרה - אמן אמיתי!"
        ]
      },
      {
        condition: isShort,
        responses: [
          "⚡ קצר וחד - כמו הקצב של אינסטגרם! לפעמים פחות זה יותר",
          "💎 יצירה מיני אבל עם השפעה מקסימלית!",
          "🎯 ישר לעניין - אהבתי את הביטחון!"
        ]
      },
      {
        condition: isLong,
        responses: [
          `🏃‍♂️ איזה סבלנות מוזיקלית! ${Math.floor(duration)} שניות של יצירה רצופה`,
          "🎼 אופרה אישית! ההקלטה הארוכה שלך מראה מחויבות אמיתית לאמנות",
          `⏰ ${Math.floor(duration)} שניות של קסם טהור - זה כבר כמעט שיר שלם!`
        ]
      }
    ];
    
    // מצא את הסוג הראשון שמתאים
    for (const type of personalityTypes) {
      if (type.condition) {
        return type.responses[Math.floor(Math.random() * type.responses.length)];
      }
    }
    
    // ברירת מחדל
    return generateBasicDescription(duration);
  };

  // תיאור בסיסי (כ-fallback)
  const generateBasicDescription = (duration: number): string => {
    const basicResponses = [
      `🎵 הקלטת ${Math.floor(duration)} שניות של מוזיקה! נשמע כמו... משהו מקסים!`,
      "🎤 AI שלנו אומר: זה בהחלט קול אנושי ובהחלט מוזיקלי!",
      "🤖 הניתוח שלנו מראה: 100% מוזיקה, 0% שקט, ו-∞ כישרון!",
      "🎭 לפי המחשב שלנו - יש כאן רגשות, מנגינה, והרבה אהבה!",
      "🌟 הקול שלך עבר את מבחן האיכות שלנו בהצלחה מרשימה!"
    ];
    
    return basicResponses[Math.floor(Math.random() * basicResponses.length)];
  };

  const analyzeRecording = async () => {
    if (!audioBlob.current) {
      toast({
        title: "רגע, מה? 🤔",
        description: "אין הקלטה! תנסה להקליט משהו קודם",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null); // איפוס תוצאה קודמת
    
    try {
      // ניתוח בסיסי של ההקלטה
      const analysis = await analyzeAudioBasic(audioBlob.current, recordingDuration);
      
      setAnalysisResult(analysis); // שמירת התוצאה להצגה
      
      toast({
        title: "🎭 הניתוח הסתיים!",
        description: "גלול למטה לראות את התוצאות המלאות",
        duration: 5000
      });
    } catch (error) {
      console.error('Error analyzing voice:', error);
      setAnalysisResult("אופס! משהו השתבש בניתוח. נסה שוב! 🤖");
      
      toast({
        title: "שגיאה בניתוח 🤖",
        description: "נראה שה-AI שלנו יצא להפסקת קפה. נסה שוב!",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // איפוס הקלטה
  const resetRecording = () => {
    setHasRecording(false);
    setAnalysisResult(null);
    setRecordingDuration(0);
    setVolumeLevel(0);
    audioBlob.current = null;
    
    toast({
      title: "🔄 איפוס הושלם",
      description: "מוכן להקלטה חדשה!",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-auto">
      {/* כותרת מצחיקה */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🎤 אולפן הזמרה הביתי 🎤
        </h3>
        <p className="text-gray-600 text-sm">
          שיר, שרוק, זמזם, או פשוט תעשה קולות מוזרים!
        </p>
      </div>

      {/* ויזואליזציה משופרת של הקלטה */}
      <div className="relative">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
          isRecording 
            ? 'bg-gradient-to-r from-red-400 to-pink-400 shadow-lg shadow-red-300' 
            : hasRecording
            ? 'bg-gradient-to-r from-green-400 to-emerald-400 shadow-lg shadow-green-300'
            : 'bg-gradient-to-r from-gray-200 to-gray-300'
        }`}
        style={{
          transform: isRecording ? `scale(${1 + volumeLevel * 0.3})` : 'scale(1)',
          boxShadow: isRecording 
            ? `0 0 ${20 + volumeLevel * 30}px rgba(239, 68, 68, ${0.3 + volumeLevel * 0.4})`
            : hasRecording 
            ? '0 0 20px rgba(34, 197, 94, 0.3)'
            : 'none'
        }}>
          <Mic className={`w-16 h-16 text-white ${isRecording ? 'animate-pulse' : ''}`} />
        </div>
        
        {/* אנימציה של גלי קול */}
        {isRecording && (
          <>
            {[1, 2, 3].map((ring) => (
              <div
                key={ring}
                className="absolute rounded-full border-2 border-red-300 animate-ping"
                style={{
                  width: `${132 + ring * 20 + volumeLevel * 40}px`,
                  height: `${132 + ring * 20 + volumeLevel * 40}px`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${ring * 0.2}s`,
                  opacity: Math.max(0.1, volumeLevel - ring * 0.2)
                }}
              />
            ))}
          </>
        )}
        
        {/* טיימר */}
        {isRecording && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <span className="text-2xl font-mono font-bold text-red-500 animate-pulse">
              {formatTime(recordingDuration)}
            </span>
          </div>
        )}
        
        {/* מד עוצמה */}
        {isRecording && (
          <div className="absolute -right-16 top-1/2 transform -translate-y-1/2">
            <div className="w-3 h-24 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="w-full bg-gradient-to-t from-green-400 via-yellow-400 to-red-400 transition-all duration-100 rounded-full"
                style={{ 
                  height: `${volumeLevel * 100}%`,
                  marginTop: `${(1 - volumeLevel) * 100}%`
                }}
              />
            </div>
            <div className="text-xs text-center mt-1 text-gray-600">עוצמה</div>
          </div>
        )}
      </div>

      {/* כפתורי פעולה */}
      <div className="flex flex-col gap-4 w-full mt-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <Mic className="w-6 h-6 mr-2" />
            התחל הקלטה
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-6 text-lg rounded-full shadow-lg animate-pulse"
          >
            <Square className="w-6 h-6 mr-2" />
            עצור הקלטה
          </Button>
        )}
        
        {hasRecording && !isRecording && (
          <div className="flex gap-3 w-full">
            <Button
              onClick={analyzeRecording}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 text-lg rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 flex-1"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2" />
                  מנתח את היצירה...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-2" />
                  בוא נראה מה הקלטת!
                </>
              )}
            </Button>
            
            <Button
              onClick={resetRecording}
              className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-6 px-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
              title="התחל מחדש"
            >
              🔄
            </Button>
          </div>
        )}
      </div>

      {/* תוצאות ניתוח */}
      {analysisResult && !isAnalyzing && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mt-6 border-2 border-purple-200 max-w-md">
          <div className="text-center">
            <div className="text-2xl mb-3">🎭</div>
            <h4 className="font-bold text-purple-800 mb-3">תוצאות הניתוח</h4>
            <p className="text-purple-700 leading-relaxed">
              {analysisResult}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {['🎵', '🎶', '🎼', '🎤', '🎸'].map((emoji, i) => (
                <span
                  key={i}
                  className="text-lg animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* טיפים מצחיקים */}
      <div className="bg-purple-50 rounded-2xl p-4 mt-4 border-2 border-purple-200">
        <p className="text-center text-sm text-purple-700 font-medium">
          💡 טיפ: אפשר גם לשרוק כמו ציפור, לזמזם כמו דבורה, או פשוט להגיד "לה לה לה" בקצב!
        </p>
      </div>

      {/* אנימציה מצחיקה */}
      {isRecording && (
        <div className="flex gap-2 mt-4">
          {['🎵', '🎶', '🎼', '🎤', '🎸'].map((emoji, i) => (
            <span
              key={i}
              className="text-2xl animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;