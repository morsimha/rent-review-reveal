
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCatGameScores } from '@/hooks/useCatGameScores';

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
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const catIdRef = useRef(0);

  const { scores, loading, saveScore } = useCatGameScores();

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
    setShowNameInput(false);
    setScore(0);
    setTimeLeft(10);
    setCats([]);
    catIdRef.current = 0;
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    setCats([]);
    setShowNameInput(true);
  };

  const handleSaveScore = async () => {
    await saveScore(score, playerName.trim() || undefined);
    setShowNameInput(false);
    setPlayerName('');
  };

  const skipSaveScore = () => {
    setShowNameInput(false);
    setPlayerName('');
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2" dir="rtl">
      <Card className="w-full h-full max-w-6xl max-h-[95vh] bg-gradient-to-br from-purple-100 to-pink-100">
        <CardContent className="p-4 md:p-6 h-full flex flex-col">
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
            <h2 className="text-xl md:text-2xl font-bold text-purple-800">תפוס את החתול! 🐱</h2>
            <div className="flex gap-2 md:gap-4 text-sm md:text-lg font-semibold">
              <span className="text-green-600">ניקוד: {score}</span>
              <span className="text-orange-600">זמן: {timeLeft}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 h-full min-h-0">
            {/* Game Area */}
            <div 
              ref={gameAreaRef}
              className="flex-1 relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-purple-300 overflow-hidden min-h-[300px] lg:min-h-0"
            >
              {!gameActive && !gameOver && !showNameInput && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <div className="text-4xl md:text-6xl mb-4">🐱</div>
                  <h3 className="text-lg md:text-xl font-bold text-purple-800 mb-2 text-center">תפוס כמה שיותר חתולים!</h3>
                  <p className="text-purple-600 mb-6 text-center text-sm md:text-base">
                    לחץ על החתולים שמופיעים על המסך במשך 10 שניות
                  </p>
                  <Button 
                    onClick={startGame}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-6"
                  >
                    התחל משחק! 🎮
                  </Button>
                </div>
              )}

              {gameOver && showNameInput && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 p-4">
                  <div className="text-4xl md:text-6xl mb-4">🏆</div>
                  <h3 className="text-xl md:text-2xl font-bold text-purple-800 mb-2 text-center">המשחק הסתיים!</h3>
                  <p className="text-lg md:text-xl text-purple-600 mb-6 text-center">
                    תפסת {score} חתולים! {score >= 15 ? 'מדהים! 🌟' : score >= 10 ? 'יפה מאוד! 👏' : 'נסה שוב! 💪'}
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg border-2 border-purple-300 mb-4 w-full max-w-sm">
                    <p className="text-purple-700 mb-2 text-center text-sm md:text-base">רוצה לשמור את התוצאה? הכנס את השם שלך:</p>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="השם שלך (לא חובה)"
                      className="w-full p-2 border border-purple-300 rounded mb-3 text-center text-sm md:text-base"
                      dir="rtl"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveScore}
                        className="bg-green-500 hover:bg-green-600 text-white flex-1 text-sm md:text-base"
                      >
                        שמור תוצאה
                      </Button>
                      <Button 
                        onClick={skipSaveScore}
                        variant="outline"
                        className="flex-1 text-sm md:text-base"
                      >
                        דלג
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={startGame}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-6"
                  >
                    שחק שוב! 🔄
                  </Button>
                </div>
              )}

              {gameOver && !showNameInput && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 p-4">
                  <div className="text-4xl md:text-6xl mb-4">🏆</div>
                  <h3 className="text-xl md:text-2xl font-bold text-purple-800 mb-2 text-center">המשחק הסתיים!</h3>
                  <p className="text-lg md:text-xl text-purple-600 mb-6 text-center">
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
                  className="absolute text-2xl md:text-4xl hover:scale-110 transition-transform duration-200 cursor-pointer animate-bounce"
                  style={{
                    left: `${cat.x}px`,
                    top: `${cat.y}px`,
                  }}
                >
                  {cat.emoji}
                </button>
              ))}
            </div>

            {/* Leaderboard */}
            <div className="w-full lg:w-80 bg-white rounded-lg border-2 border-purple-300 p-4 flex-shrink-0">
              <h3 className="text-lg font-bold text-purple-800 mb-4 text-center">🏆 טבלת שיאים</h3>
              
              {loading ? (
                <div className="text-center text-purple-600">טוען...</div>
              ) : scores.length === 0 ? (
                <div className="text-center text-purple-600">עדיין אין שיאים!</div>
              ) : (
                <div className="space-y-2">
                  {scores.map((scoreEntry, index) => (
                    <div 
                      key={scoreEntry.id}
                      className={`flex justify-between items-center p-2 rounded ${
                        index === 0 ? 'bg-yellow-100 border border-yellow-300' :
                        index === 1 ? 'bg-gray-100 border border-gray-300' :
                        index === 2 ? 'bg-orange-100 border border-orange-300' :
                        'bg-purple-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-purple-700 text-sm">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                        </span>
                        <span className="text-purple-800 text-sm">
                          {scoreEntry.player_name || 'אנונימי'}
                        </span>
                      </div>
                      <span className="font-bold text-purple-900 text-sm">
                        {scoreEntry.score} 🐱
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center text-xs md:text-sm text-purple-600">
            לחץ על החתולים כדי לתפוס אותם! כל חתול נעלם אחרי 2 שניות
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatGame;
