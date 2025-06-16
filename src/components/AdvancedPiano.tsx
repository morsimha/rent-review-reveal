import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronLeft, ChevronRight, Mic, Square, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RecordedNote {
  note: string;
  frequency: number;
  timestamp: number;
}

const AdvancedPiano: React.FC = () => {
  const { themeConfig } = useTheme();
  const { toast } = useToast();
  const [octave, setOctave] = useState(4);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recordingStartTime = useRef<number>(0);

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
      oscillator.type = 'sine';
      
      // צליל ארוך יותר לחוויית נגינה
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

  const startRecording = () => {
    setIsRecording(true);
    setRecordedNotes([]);
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

      toast({
        title: "ניתוח המנגינה",
        description: data.analysis || "לא הצלחנו לזהות את המנגינה",
      });
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

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* בקרות אוקטבה */}
      <div className="flex items-center gap-2 mb-2">
        <Button
          onClick={() => setOctave(Math.max(1, octave - 1))}
          disabled={octave <= 1}
          size="sm"
          variant="outline"
          className="h-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <span className="font-medium text-sm px-3">אוקטבה {octave}</span>
        
        <Button
          onClick={() => setOctave(Math.min(7, octave + 1))}
          disabled={octave >= 7}
          size="sm"
          variant="outline"
          className="h-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* פסנתר */}
      <div className="flex flex-row gap-1">
        {notes.map((note, index) => (
          <Button
            key={index}
            onClick={() => playNote(note.baseFreq, note.name)}
            className={`${themeConfig.buttonGradient} text-white text-2xl px-4 py-2 min-w-12 min-h-12 rounded-full transition-all duration-200 hover:scale-110 active:scale-95`}
            title={`${note.name}${octave}`}
          >
            {note.emoji}
          </Button>
        ))}
      </div>

      {/* בקרת הקלטה */}
      <div className="flex items-center gap-3 mt-2">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Mic className="w-4 h-4 mr-1" />
            הקלט
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            size="sm"
            className="bg-gray-600 hover:bg-gray-700 text-white animate-pulse"
          >
            <Square className="w-4 h-4 mr-1" />
            עצור
          </Button>
        )}
        
        <Button
          onClick={analyzeMelody}
          disabled={recordedNotes.length === 0 || isAnalyzing}
          size="sm"
          className="bg-purple-500 hover:bg-purple-600 text-white"
        >
          <Send className="w-4 h-4 mr-1" />
          {isAnalyzing ? 'מנתח...' : 'נתח מנגינה'}
        </Button>
      </div>

      {/* מצב הקלטה */}
      {recordedNotes.length > 0 && (
        <div className="text-xs text-gray-600 text-center">
          הוקלטו {recordedNotes.length} תווים
        </div>
      )}
    </div>
  );
};

export default AdvancedPiano;