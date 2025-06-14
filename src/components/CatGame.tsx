
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CatGameProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Cat {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

const CatGame: React.FC<CatGameProps> = ({ isOpen, onClose }) => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const catIdRef = useRef(0);

  const catEmojis = ['😸', '😺', '😻', '🙀', '😿', '😾', '🐱', '🐈'];

  const getRandomCatEmoji = () => catEmojis[Math.floor(Math.random() * catEmojis.length)];

  const spawnCat = () => {
    if (!gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current;
    const maxX = gameArea.clientWidth - 60;
    const maxY = gameArea.clientHeight - 60;
    
    const newCat: Cat = {
      id: catIdRef.current++,
      x: Math.random() * maxX,
      y: Math.random() * maxY,
      emoji: getRandomCatEmoji()
    };
    
    setCats(prev => [...prev, newCat]);
    
    // Remove cat after 2 seconds if not caught
    setTimeout(() => {
      setCats(prev => prev.filter(cat => cat.id !== newCat.id));
    }, 2000);
  };

  const catchCat = (catId: number) => {
    setCats(prev => prev.filter(cat => cat.id !== catId));
    setScore(prev => prev + 1);
  };

  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(30);
    setCats([]);
    catIdRef.current = 0;
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    setCats([]);
  };

  // Game timer
  useEffect(() => {
    if (!gameActive) return;
    
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  // Cat spawning
  useEffect(() => {
    if (!gameActive) return;
    
    const spawnInterval = setInterval(() => {
      spawnCat();
    }, 800);
    
    return () => clearInterval(spawnInterval);
  }, [gameActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" dir="rtl">
      <Card className="w-[90vw] h-[90vh] max-w-4xl max-h-3xl bg-gradient-to-br from-purple-100 to-pink-100">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="hover:bg-red-100"
            >
              <X className="w-4 h-4" />
              סגור
            </Button>
            <h2 className="text-2xl font-bold text-purple-800">תפוס את החתול! 🐱</h2>
            <div className="flex gap-4 text-lg font-semibold">
              <span className="text-green-600">ניקוד: {score}</span>
              <span className="text-orange-600">זמן: {timeLeft}</span>
            </div>
          </div>

          {/* Game Area */}
          <div 
            ref={gameAreaRef}
            className="flex-1 relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-purple-300 overflow-hidden"
          >
            {!gameActive && !gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🐱</div>
                <h3 className="text-xl font-bold text-purple-800 mb-2">תפוס כמה שיותר חתולים!</h3>
                <p className="text-purple-600 mb-6 text-center">
                  לחץ על החתולים שמופיעים על המסך במשך 30 שניות
                </p>
                <Button 
                  onClick={startGame}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-6"
                >
                  התחל משחק! 🎮
                </Button>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-purple-800 mb-2">המשחק הסתיים!</h3>
                <p className="text-xl text-purple-600 mb-6">
                  תפסת {score} חתולים! {score >= 15 ? 'מדהים! 🌟' : score >= 10 ? 'יפה מאוד! 👏' : 'נסה שוב! 💪'}
                </p>
                <Button 
                  onClick={startGame}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-6"
                >
                  שחק שוב! 🔄
                </Button>
              </div>
            )}

            {/* Cats */}
            {cats.map(cat => (
              <button
                key={cat.id}
                onClick={() => catchCat(cat.id)}
                className="absolute text-4xl hover:scale-110 transition-transform duration-200 cursor-pointer animate-bounce"
                style={{
                  left: `${cat.x}px`,
                  top: `${cat.y}px`,
                }}
              >
                {cat.emoji}
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center text-sm text-purple-600">
            לחץ על החתולים כדי לתפוס אותם! כל חתול נעלם אחרי 2 שניות
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatGame;
