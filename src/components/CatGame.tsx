import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCatGameScores } from '@/hooks/useCatGameScores';

interface CatGameProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Animal {
  id: number;
  x: number;
  y: number;
  emoji: string;
  type: 'cat' | 'dog';
}

const CatGame: React.FC<CatGameProps> = ({ isOpen, onClose }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animalIdRef = useRef(0);

  const { scores, loading, saveScore } = useCatGameScores();

  const catEmojis = ['😸', '😺', '😻', '🙀', '😿', '😾', '🐱', '🐈'];
  const dogEmojis = ['🐶', '🐕', '🦮', '🐕‍🦺', '🐩'];

  const getRandomCatEmoji = () => catEmojis[Math.floor(Math.random() * catEmojis.length)];
  const getRandomDogEmoji = () => dogEmojis[Math.floor(Math.random() * dogEmojis.length)];

  const spawnAnimals = () => {
    if (!gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current;
    const maxX = gameArea.clientWidth - 60;
    const maxY = gameArea.clientHeight - 60;
    
    // Spawn 3-5 cats at once
    const numCats = Math.floor(Math.random() * 3) + 3;
    // Spawn 1-2 dogs at once
    const numDogs = Math.floor(Math.random() * 2) + 1;
    
    const newAnimals: Animal[] = [];
    
    // Add cats
    for (let i = 0; i < numCats; i++) {
      newAnimals.push({
        id: animalIdRef.current++,
        x: Math.random() * maxX,
        y: Math.random() * maxY,
        emoji: getRandomCatEmoji(),
        type: 'cat'
      });
    }
    
    // Add dogs
    for (let i = 0; i < numDogs; i++) {
      newAnimals.push({
        id: animalIdRef.current++,
        x: Math.random() * maxX,
        y: Math.random() * maxY,
        emoji: getRandomDogEmoji(),
        type: 'dog'
      });
    }
    
    setAnimals(prev => [...prev, ...newAnimals]);
    
    // Remove animals after 2.5 seconds if not caught
    setTimeout(() => {
      setAnimals(prev => prev.filter(animal => !newAnimals.some(newAnimal => newAnimal.id === animal.id)));
    }, 2500);
  };

  const catchAnimal = (animalId: number) => {
    const animal = animals.find(a => a.id === animalId);
    if (!animal) return;
    
    setAnimals(prev => prev.filter(a => a.id !== animalId));
    
    if (animal.type === 'cat') {
      setScore(prev => prev + 1);
    } else if (animal.type === 'dog') {
      setScore(prev => Math.max(0, prev - 1)); // Don't go below 0
    }
  };

  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setShowNameInput(false);
    setScore(0);
    setTimeLeft(10);
    setAnimals([]);
    animalIdRef.current = 0;
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    setAnimals([]);
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

  // Animal spawning - more frequent spawning
  useEffect(() => {
    if (!gameActive) return;
    
    const spawnInterval = setInterval(() => {
      spawnAnimals();
    }, 1200); // Spawn every 1.2 seconds
    
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
            <h2 className="text-xl md:text-2xl font-bold text-purple-800">תפוס את החתולים! 🐱</h2>
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
                  <p className="text-purple-600 mb-4 text-center text-sm md:text-base">
                    לחץ על החתולים 🐱 כדי לקבל נקודות
                  </p>
                  <p className="text-red-600 mb-6 text-center text-sm md:text-base font-semibold">
                    זהירות! כלבים 🐶 נותנים מינוס נקודה!
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

              {/* Animals */}
              {animals.map(animal => (
                <button
                  key={animal.id}
                  onClick={() => catchAnimal(animal.id)}
                  className={`absolute text-2xl md:text-4xl hover:scale-110 transition-transform duration-200 cursor-pointer ${
                    animal.type === 'cat' ? 'animate-bounce' : 'animate-pulse'
                  }`}
                  style={{
                    left: `${animal.x}px`,
                    top: `${animal.y}px`,
                  }}
                  title={animal.type === 'cat' ? '+1 נקודה' : '-1 נקודה'}
                >
                  {animal.emoji}
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
            לחץ על החתולים 🐱 (+1) וזהירות מהכלבים 🐶 (-1)! כל חיה נעלמת אחרי 2.5 שניות
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatGame;
