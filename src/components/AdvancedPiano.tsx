import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronLeft, ChevronRight, Piano, Square, Send } from 'lucide-react';
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

const AdvancedPiano: React.FC = () => {
  const { themeConfig } = useTheme();
  const { toast } = useToast();
  const [octave, setOctave] = useState(4);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [soundType, setSoundType] = useState<SoundType>('sine');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);
  const recordingStartTime = useRef<number>(0);

  const handleVolumeUp = () => setVolume(v => Math.min(1, v + 0.1));
  const handleVolumeDown = () => setVolume(v => Math.max(0, v - 0.1));

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
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
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

  const startRecording = () => {
    setIsRecording(true);
    setRecordedNotes([]);
    setAnalysisResult(null); // איפוס תוצאה קודמת
    recordingStartTime.current = Date.now();
    toast({
      title: "התחלת הקלטה 🎵",
      description: "נגן את המנגינה שלך!",
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    toast({
      title: "הקלטה הסתיימה",
      description: `הוקלטו ${recordedNotes.length} תווים`,
    });
  };

  const analyzeMelody = async () => {
    if (recordedNotes.length === 0) {
      toast({
        title: "אין מנגינה",
        description: "קודם הקלט מנגינה!",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
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

      setAnalysisResult(data.analysis || "לא הצלחנו לזהות את המנגינה");
      
      toast({
        title: "🎭 ניתוח הושלם!",
        description: "התוצאות מוצגות למטה",
        duration: 3000
      });
    } catch (error) {
      console.error('Error analyzing melody:', error);
      setAnalysisResult("אופס! משהו השתבש בניתוח. נסה שוב! 🤖");
      
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לנתח את המנגינה",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setRecordedNotes([]);
    toast({
      title: "🔄 איפוס הושלם",
      description: "מוכן להקלטה חדשה!",
    });
  };

  return (
    <div className="flex flex-col items-center gap-3 p-3 max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
      {/* Volume controls */}
      <div className="flex flex-row items-center gap-2 mb-2">
        <Button onClick={handleVolumeDown} size="sm" className={`${themeConfig.buttonGradient} rounded-full shadow-md hover:scale-110 transition-all duration-200 w-9 h-9 flex items-center justify-center text-lg`}>-</Button>
        <span className="text-sm">עוצמה: {(volume * 100).toFixed(0)}%</span>
        <Button onClick={handleVolumeUp} size="sm" className={`${themeConfig.buttonGradient} rounded-full shadow-md hover:scale-110 transition-all duration-200 w-9 h-9 flex items-center justify-center text-lg`}>+</Button>
      </div>
      {/* בקרות אוקטבה וסוג צליל */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setOctave(Math.max(1, octave - 1))}
            disabled={octave <= 1}
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          
          <span className="font-medium text-xs px-2">אוקטבה {octave}</span>
          
          <Button
            onClick={() => setOctave(Math.min(7, octave + 1))}
            disabled={octave >= 7}
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>

        {/* בחירת סוג צליל */}
        <Select value={soundType} onValueChange={(value: SoundType) => setSoundType(value)}>
          <SelectTrigger className="w-40 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {soundTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <span className="flex items-center gap-1 text-xs">
                  <span>{type.emoji}</span>
                  <span>{type.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* פסנתר */}
      <div className="flex flex-row gap-1 flex-wrap justify-center max-w-xs">
        {notes.map((note, idx) => (
          <Button
            key={idx}
            onClick={() => playNote(note.baseFreq, note.name)}
            className={`${themeConfig.buttonGradient} text-white text-lg px-2 py-2 min-w-8 min-h-8 rounded-full transition-all duration-200 hover:scale-110 active:scale-95`}
            title={`${note.name}${octave}`}
          >
            {note.emoji}
          </Button>
        ))}
      </div>

      {/* בקרת הקלטה */}
      <div className="flex items-center gap-2 mt-1">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white h-8 text-xs"
          >
            <Piano className="w-3 h-3 mr-1" />
            הקלט
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            size="sm"
            className="bg-gray-600 hover:bg-gray-700 text-white animate-pulse h-8 text-xs"
          >
            <Square className="w-3 h-3 mr-1" />
            עצור
          </Button>
        )}
        
        <Button
          onClick={analyzeMelody}
          disabled={recordedNotes.length === 0 || isAnalyzing}
          size="sm"
          className="bg-purple-500 hover:bg-purple-600 text-white h-8 text-xs"
        >
          <Send className="w-3 h-3 mr-1" />
          {isAnalyzing ? 'מנתח...' : 'נתח'}
        </Button>
      </div>

      {/* מצב הקלטה */}
      {recordedNotes.length > 0 && (
        <div className="text-xs text-gray-600 text-center">
          הוקלטו {recordedNotes.length} תווים
        </div>
      )}

      {/* תוצאות ניתוח המנגינה */}
      {analysisResult && !isAnalyzing && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 mt-2 border-2 border-purple-200 w-full max-w-xs">
          <div className="text-center">
            <div className="text-lg mb-2">🎹</div>
            <h4 className="font-bold text-purple-800 mb-2 text-xs">ניתוח המנגינה</h4>
            <p className="text-purple-700 leading-relaxed text-right text-xs">
              {analysisResult}
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {['🎵', '🎶', '🎼', '🎹', '🎸'].map((emoji, i) => (
                <span
                  key={i}
                  className="text-sm animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
            <button
              onClick={resetAnalysis}
              className="mt-2 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-1 px-2 rounded-full text-xs transform transition-all duration-200 hover:scale-105"
            >
              🔄 נקה
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedPiano;