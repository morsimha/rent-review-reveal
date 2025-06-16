
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight, Mic, Square, Send, Piano, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecordedNote {
  note: string;
  frequency: number;
  timestamp: number;
}

type SoundType = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface AdvancedPianoProps {
  onMelodyAnalysis?: (analysis: string) => void;
}

const AdvancedPiano: React.FC<AdvancedPianoProps> = ({ onMelodyAnalysis }) => {
  const { themeConfig } = useTheme();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [octave, setOctave] = useState(4);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);
  const [hasVoiceRecording, setHasVoiceRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [soundType, setSoundType] = useState<SoundType>('sine');
  const recordingStartTime = useRef<number>(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const voiceRecordingData = useRef<Blob | null>(null);

  // תווים פשוטים - רק הלבנים
  const notes = [
    { name: 'דו', baseFreq: 261.63, emoji: '🎵' },
    { name: 'רה', baseFreq: 293.66, emoji: '🎶' },
    { name: 'מי', baseFreq: 329.63, emoji: '🎼' },
    { name: 'פה', baseFreq: 349.23, emoji: '🎤' },
    { name: 'סול', baseFreq: 392.00, emoji: '🎧' },
    { name: 'לה', baseFreq: 440.00, emoji: '🎸' },
    { name: 'סי', baseFreq: 493.88, emoji: '🎺' },
    { name: 'דו', baseFreq: 523.25, emoji: '🎹' }
  ];

  const soundTypes = [
    { value: 'sine', label: 'פסנתר קלאסי', emoji: '🎹' },
    { value: 'square', label: 'סינתיסייזר', emoji: '🎛️' },
    { value: 'sawtooth', label: 'כינור חשמלי', emoji: '🎻' },
    { value: 'triangle', label: 'חליל', emoji: '🎺' }
  ];

  // חישוב תדר לפי אוקטבה
  const getFrequency = (baseFreq: number, octave: number) => {
    return baseFreq * Math.pow(2, octave - 4);
  };

  const playNote = (baseFreq: number, noteName: string) => {
    const frequency = getFrequency(baseFreq, octave);
    
    // הקלטת התו אם במצב הקלטה
    if (isRecording) {
      const timestamp = Date.now() - recordingStartTime.current;
      setRecordedNotes(prev => [...prev, { note: `${noteName}${octave}`, frequency, timestamp }]);
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = soundType;
      
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1.2);
      
      setTimeout(() => {
        audioContext.close();
      }, 1300);
    } catch (error) {
      console.log('Failed to play note:', error);
    }
  };

  const startPianoRecording = () => {
    setIsRecording(true);
    setRecordedNotes([]);
    recordingStartTime.current = Date.now();
    toast({
      title: "התחלת הקלטת פסנתר 🎹",
      description: "נגן את המנגינה שלך!",
    });
  };

  const stopPianoRecording = () => {
    setIsRecording(false);
    toast({
      title: "הקלטת פסנתר הסתיימה",
      description: `הוקלטו ${recordedNotes.length} תווים`,
    });
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        voiceRecordingData.current = audioBlob;
        setHasVoiceRecording(true);
      };

      mediaRecorder.current.start();
      setIsVoiceRecording(true);
      
      toast({
        title: "התחלת הקלטת קול 🎤",
        description: "שיר או נשרוק את המנגינה!",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לגשת למיקרופון",
        variant: "destructive"
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder.current && isVoiceRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsVoiceRecording(false);
      
      toast({
        title: "הקלטת קול הסתיימה",
        description: "ההקלטה מוכנה לניתוח!",
      });
    }
  };

  const analyzeMelody = async () => {
    if (recordedNotes.length === 0 && !hasVoiceRecording) {
      toast({
        title: "אין מנגינה",
        description: "קודם הקלט מנגינה בפסנתר או בקול!",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      if (hasVoiceRecording && voiceRecordingData.current) {
        // ניתוח הקלטת קול - Fix: send base64Audio instead of audioData
        const reader = new FileReader();
        const audioAnalysisPromise = new Promise((resolve, reject) => {
          reader.onloadend = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];
              
              const { data, error } = await supabase.functions.invoke('analyze-melody', {
                body: { 
                  base64Audio: base64Audio, // Fixed parameter name
                  prompt: "נא לנתח את המנגינה שנשרקה או נושרה. זהה את התווים והמנגינה אם היא מוכרת."
                }
              });

              if (error) throw error;
              
              const analysis = data.analysis || "לא הצלחנו לזהות את המנגינה";
              resolve(analysis);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
        });
        
        reader.readAsDataURL(voiceRecordingData.current);
        const analysis = await audioAnalysisPromise;
        
        if (onMelodyAnalysis) {
          onMelodyAnalysis(analysis as string);
        }
        
        toast({
          title: "ניתוח הקלטת קול הושלם",
          description: "התוצאה מוצגת למעלה!",
        });
      } else {
        // ניתוח הקלטת פסנתר
        const melodyData = recordedNotes.map(note => ({
          note: note.note,
          time: note.timestamp / 1000
        }));

        const prompt = `נא לנתח את המנגינה הבאה שנוגנה בפסנתר:
${melodyData.map(n => `${n.note} בזמן ${n.time.toFixed(2)}s`).join(', ')}

האם זו מנגינה מוכרת? אם כן, מה שמה? תן ניתוח קצר של המנגינה.`;

        const { data, error } = await supabase.functions.invoke('analyze-melody', {
          body: { 
            melody: melodyData,
            prompt: prompt 
          }
        });

        if (error) throw error;

        const analysis = data.analysis || "לא הצלחנו לזהות את המנגינה";
        if (onMelodyAnalysis) {
          onMelodyAnalysis(analysis);
        }
        
        toast({
          title: "ניתוח המנגינה הושלם",
          description: "התוצאה מוצגת למעלה!",
        });
      }
    } catch (error) {
      console.error('Error analyzing melody:', error);
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לנתח את המנגינה",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // responsive styles
  const getButtonSize = () => isMobile ? "text-lg px-3 py-3 min-w-12 min-h-12" : "text-2xl px-4 py-4 min-w-14 min-h-14";
  const getControlSize = () => isMobile ? "text-xs px-3 py-2" : "text-sm px-4 py-2";

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-full overflow-hidden">
      {/* בקרות אוקטבה וסוג צליל */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setOctave(Math.max(1, octave - 1))}
            disabled={octave <= 1}
            size="sm"
            variant="outline"
            className={`h-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ${isMobile ? 'px-3' : 'px-4'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className={`font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${isMobile ? 'text-sm px-3' : 'text-base px-4'}`}>
            אוקטבה {octave}
          </span>
          
          <Button
            onClick={() => setOctave(Math.min(7, octave + 1))}
            disabled={octave >= 7}
            size="sm"
            variant="outline"
            className={`h-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ${isMobile ? 'px-3' : 'px-4'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* בורר סוג צליל */}
        <div className="flex items-center gap-3">
          <span className={`font-semibold text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>סוג צליל:</span>
          <Select value={soundType} onValueChange={(value: SoundType) => setSoundType(value)}>
            <SelectTrigger className={`rounded-full shadow-md border-2 hover:shadow-lg transition-all duration-200 ${isMobile ? 'text-xs h-8' : 'text-sm h-10'}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {soundTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="rounded-lg">
                  {type.emoji} {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* תצוגת פסנתר */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl p-6 shadow-xl border-2 border-gray-200/50 w-full backdrop-blur-sm">
        <div className={`grid gap-2 ${isMobile ? 'grid-cols-4' : 'grid-cols-8'} w-full justify-items-center`}>
          {notes.map((note, idx) => (
            <Button
              key={idx}
              onClick={() => playNote(note.baseFreq, note.name)}
              className={`${themeConfig.buttonGradient} text-white ${getButtonSize()} rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
              title={`נגן ${note.name}`}
            >
              <div className="flex flex-col items-center">
                <span className={isMobile ? "text-xl" : "text-2xl"}>{note.emoji}</span>
                <span className={isMobile ? "text-xs font-semibold" : "text-sm font-semibold"}>{note.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* כפתורי הקלטה */}
      <div className="flex flex-col gap-4 w-full">
        {/* הקלטת פסנתר */}
        <div className="flex items-center gap-3 justify-center">
          <Button
            onClick={isRecording ? stopPianoRecording : startPianoRecording}
            className={`${isRecording ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'} text-white ${getControlSize()} rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
          >
            {isRecording ? <Square className="w-4 h-4 mr-2" /> : <Piano className="w-4 h-4 mr-2" />}
            {isRecording ? 'עצור הקלטת פסנתר' : 'הקלט פסנתר'}
          </Button>
          
          {recordedNotes.length > 0 && (
            <span className={`text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full border border-green-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {recordedNotes.length} תווים הוקלטו ✓
            </span>
          )}
        </div>

        {/* הקלטת קול */}
        <div className="flex items-center gap-3 justify-center">
          <Button
            onClick={isVoiceRecording ? stopVoiceRecording : startVoiceRecording}
            className={`${isVoiceRecording ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'} text-white ${getControlSize()} rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
          >
            {isVoiceRecording ? <Square className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            {isVoiceRecording ? 'עצור הקלטת קול' : 'הקלט קול'}
          </Button>
          
          {hasVoiceRecording && (
            <span className={`text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full border border-green-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              קול הוקלט ✓
            </span>
          )}
        </div>

        {/* כפתור ניתוח */}
        <div className="flex justify-center">
          <Button
            onClick={analyzeMelody}
            disabled={isAnalyzing || (recordedNotes.length === 0 && !hasVoiceRecording)}
            className={`bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white ${getControlSize()} rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none`}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                מנתח...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                נתח מנגינה
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPiano;
