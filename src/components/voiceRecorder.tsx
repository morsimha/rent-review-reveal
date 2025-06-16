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
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioBlob = useRef<Blob | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      setRecordingDuration(0);

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
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob.current);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('analyze-voice', {
          body: { 
            audioData: base64Audio,
            duration: recordingDuration
          }
        });

        if (error) throw error;
        
        toast({
          title: "🎭 תוצאות הניתוח",
          description: data.analysis || "אפילו AI לא הבין מה זה היה... נסה שוב! 😄",
          duration: 8000
        });
      };
    } catch (error) {
      console.error('Error analyzing voice:', error);
      toast({
        title: "שגיאה בניתוח 🤖",
        description: "נראה שה-AI שלנו יצא להפסקת קפה. נסה שוב!",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
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

      {/* ויזואליזציה של הקלטה */}
      <div className="relative">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
          isRecording 
            ? 'bg-gradient-to-r from-red-400 to-pink-400 animate-pulse shadow-lg shadow-red-300' 
            : hasRecording
            ? 'bg-gradient-to-r from-green-400 to-emerald-400 shadow-lg shadow-green-300'
            : 'bg-gradient-to-r from-gray-200 to-gray-300'
        }`}>
          <Mic className={`w-16 h-16 text-white ${isRecording ? 'animate-bounce' : ''}`} />
        </div>
        
        {/* טיימר */}
        {isRecording && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <span className="text-2xl font-mono font-bold text-red-500">
              {formatTime(recordingDuration)}
            </span>
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
          <Button
            onClick={analyzeRecording}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 text-lg rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
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
        )}
      </div>

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