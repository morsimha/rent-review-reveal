import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const VoiceRecorder: React.FC = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioBlob = useRef<Blob | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // פונקציה לניטור עוצמה בזמן אמת
  const monitorVolume = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    microphone.connect(analyser);
    analyser.fftSize = 256;
    
    const updateVolume = () => {
      if (!isRecording) {
        audioContext.close();
        return;
      }
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value) / dataArray.length;
      const normalizedVolume = Math.min(average / 128, 1);
      
      setVolumeLevel(normalizedVolume);
      
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(updateVolume);
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
      setAnalysisResult(null);

      // התחל ניטור עוצמה
      monitorVolume(stream);

      // התחל טיימר
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
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        audioBlob.current = new Blob(audioChunks.current, { type: 'audio/webm' });
        setHasRecording(true);
        setVolumeLevel(0);
        
        // עצור את כל הטראקים
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
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      toast({
        title: "🎵 הקלטה נשמרה!",
        description: `${recordingDuration} שניות של קסם מוזיקלי`,
      });
    }
  };

  // ניתוח בסיסי של ההקלטה
  const analyzeAudioBasic = async (audioBlob: Blob, duration: number): Promise<string> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const avgVolume = channelData.reduce((sum, sample) => sum + Math.abs(sample), 0) / channelData.length;
      
      let volumeChanges = 0;
      let prevVolume = Math.abs(channelData[0]);
      for (let i = 1000; i < channelData.length; i += 1000) {
        const currentVolume = Math.abs(channelData[i]);
        if (Math.abs(currentVolume - prevVolume) > 0.01) {
          volumeChanges++;
        }
        prevVolume = currentVolume;
      }
      
      const isDynamic = volumeChanges > duration * 2;
      const isLoud = avgVolume > 0.1;
      const isSoft = avgVolume < 0.03;
      const isLong = duration > 8;
      const isShort = duration < 3;
      
      return generateSmartDescription(duration, isLoud, isSoft, isDynamic, isLong, isShort);
      
    } catch (error) {
      return generateBasicDescription(duration);
    }
  };

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
    
    for (const type of personalityTypes) {
      if (type.condition) {
        return type.responses[Math.floor(Math.random() * type.responses.length)];
      }
    }
    
    return generateBasicDescription(duration);
  };

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
    setAnalysisResult(null);
    
    try {
      const base64Audio = await blobToBase64(audioBlob.current);
      
      const { data, error } = await supabase.functions.invoke('analyze-voice', {
        body: { 
          audioData: base64Audio,
          duration: recordingDuration
        }
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysisResult(data.analysis);
        
        toast({
          title: "🎭 ניתוח AI הושלם!",
          description: "הניתוח המתקדם מוכן למטה",
          duration: 5000
        });
      } else {
        throw new Error("No analysis from server");
      }
      
    } catch (error) {
      console.error('Server analysis failed:', error);
      
      try {
        const localAnalysis = await analyzeAudioBasic(audioBlob.current, recordingDuration);
        setAnalysisResult(`${localAnalysis}\n\n💡 (ניתוח מקומי - השרת לא זמין כרגע)`);
        
        toast({
          title: "🤖 ניתוח מקומי הושלם",
          description: "השרת לא זמין, אבל עדיין יש לנו משהו!",
          duration: 6000
        });
      } catch (localError) {
        setAnalysisResult("אופס! משהו השתבש בניתוח. נסה שוב! 🤖");
        
        toast({
          title: "שגיאה בניתוח 🤖",
          description: "נראה שה-AI שלנו יצא להפסקת קפה. נסה שוב!",
          variant: "destructive"
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

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
    <div className="flex flex-col items-center gap-4 p-4 max-w-sm mx-auto overflow-hidden">
      {/* כותרת */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🎤 אולפן הזמרה הביתי 🎤
        </h3>
        <p className="text-gray-600 text-xs">
          שיר, שרוק, זמזם, או פשוט תעשה קולות מוזרים!
        </p>
      </div>

      {/* ויזואליזציה */}
      <div className="relative flex justify-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
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
          <Mic className={`w-12 h-12 text-white ${isRecording ? 'animate-pulse' : ''}`} />
        </div>
        
        {/* אנימציה של גלי קול */}
        {isRecording && (
          <>
            {[1, 2, 3].map((ring) => (
              <div
                key={ring}
                className="absolute rounded-full border-2 border-red-300 animate-ping"
                style={{
                  width: `${100 + ring * 15 + volumeLevel * 30}px`,
                  height: `${100 + ring * 15 + volumeLevel * 30}px`,
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
        
        {/* מד עוצמה - רק כשמקליט ויש עוצמה */}
        {isRecording && volumeLevel > 0.05 && (
          <div className="absolute -left-12 top-1/2 transform -translate-y-1/2">
            <div className="w-2 h-16 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="w-full bg-gradient-to-t from-green-400 via-yellow-400 to-red-400 transition-all duration-100 rounded-full"
                style={{ 
                  height: `${volumeLevel * 100}%`,
                  marginTop: `${(1 - volumeLevel) * 100}%`
                }}
              />
            </div>
            <div className="text-xs text-center mt-1 text-gray-600">🔊</div>
          </div>
        )}
      </div>

      {/* טיימר */}
      {isRecording && (
        <div className="text-lg font-mono font-bold text-red-500 animate-pulse">
          {formatTime(recordingDuration)}
        </div>
      )}

      {/* כפתורי פעולה */}
      <div className="flex flex-col gap-3 w-full">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 text-base rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <Mic className="w-5 h-5 mr-2" />
            התחל הקלטה
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 text-base rounded-full shadow-lg animate-pulse"
          >
            <Square className="w-5 h-5 mr-2" />
            עצור הקלטה
          </Button>
        )}
        
        {hasRecording && !isRecording && (
          <div className="flex gap-2 w-full">
            <Button
              onClick={analyzeRecording}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 text-sm rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 flex-1"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                  מנתח...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  בוא נראה מה הקלטת!
                </>
              )}
            </Button>
            
            <Button
              onClick={resetRecording}
              className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-4 px-3 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
              title="התחל מחדש"
            >
              🔄
            </Button>
          </div>
        )}
      </div>

      {/* תוצאות ניתוח */}
      {analysisResult && !isAnalyzing && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mt-4 border-2 border-purple-200 w-full max-w-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">🎭</div>
            <h4 className="font-bold text-purple-800 mb-2 text-sm">תוצאות הניתוח</h4>
            <p className="text-purple-700 leading-relaxed text-xs text-right">
              {analysisResult}
            </p>
            <div className="flex justify-center gap-1 mt-3">
              {['🎵', '🎶', '🎼', '🎤', '🎸'].map((emoji, i) => (
                <span
                  key={i}
                  className="text-sm animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* טיפים */}
      <div className="bg-purple-50 rounded-xl p-3 mt-2 border-2 border-purple-200 w-full">
        <p className="text-center text-xs text-purple-700 font-medium">
          💡 טיפ: אפשר גם לשרוק כמו ציפור, לזמזם כמו דבורה, או פשוט להגיד "לה לה לה" בקצב!
        </p>
      </div>

      {/* אנימציה כשמקליט */}
      {isRecording && (
        <div className="flex gap-1 mt-2">
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
      )}
    </div>
  );
};

export default VoiceRecorder;