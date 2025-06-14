
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDrawingGame } from '@/hooks/useDrawingGame';

interface DrawingGameProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Point {
  x: number;
  y: number;
}

const DrawingGame: React.FC<DrawingGameProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<'player1' | 'player2'>('player1');
  const [drawingData, setDrawingData] = useState<string>('');
  const [gameState, setGameState] = useState<'waiting' | 'drawing' | 'completed'>('waiting');
  
  const { saveDrawing, loading } = useDrawingGame();

  const getPlayerName = (player: 'player1' | 'player2') => {
    return player === 'player1' ? 'מור' : 'גבי';
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;
    
    // Set drawing styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = currentPlayer === 'player1' ? '#8B5CF6' : '#EC4899';
    
    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const startDrawing = (point: Point) => {
    if (gameState !== 'drawing') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (point: Point) => {
    if (!isDrawing || gameState !== 'drawing') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    startDrawing(point);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    draw(point);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getTouchPos(e);
    startDrawing(point);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getTouchPos(e);
    draw(point);
  };

  const startGame = () => {
    setGameState('drawing');
    setCurrentPlayer('player1');
    initializeCanvas();
  };

  const sendTurn = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save current drawing state
    const imageData = canvas.toDataURL();
    setDrawingData(imageData);
    
    // Switch to next player
    const nextPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    setCurrentPlayer(nextPlayer);
    
    // Update canvas stroke color for next player
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = nextPlayer === 'player1' ? '#8B5CF6' : '#EC4899';
    }
  };

  const finishDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const finalDrawingData = canvas.toDataURL();
    
    try {
      await saveDrawing(finalDrawingData, currentPlayer, true);
      setGameState('completed');
    } catch (error) {
      console.error('Error saving drawing:', error);
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setCurrentPlayer('player1');
    setDrawingData('');
    initializeCanvas();
  };

  useEffect(() => {
    if (isOpen) {
      initializeCanvas();
    }
  }, [isOpen, currentPlayer]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2" dir="rtl">
      <Card className="w-full h-full max-w-4xl max-h-[95vh] bg-gradient-to-br from-yellow-50 to-orange-50">
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
            <h2 className="text-xl md:text-2xl font-bold text-orange-800 flex items-center gap-2">
              🎨 משחק ציור שיתופי
            </h2>
            <div className="text-lg font-semibold text-orange-600">
              {gameState === 'drawing' ? `תור של ${getPlayerName(currentPlayer)}` : ''}
            </div>
          </div>

          {/* Game Area */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {gameState === 'waiting' && (
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-orange-800 mb-4">בואו נצייר ביחד!</h3>
                <p className="text-orange-600 mb-6">
                  מור תתחיל לצייר, אחר כך גבי תמשיך, וכן הלאה...
                </p>
                <Button 
                  onClick={startGame}
                  className="bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white font-semibold py-3 px-6"
                >
                  התחל לצייר! 🖌️
                </Button>
              </div>
            )}

            {gameState === 'drawing' && (
              <div className="flex flex-col items-center w-full">
                <div className="mb-4 text-center">
                  <p className="text-lg font-semibold text-orange-800 mb-2">
                    עכשיו תור של {getPlayerName(currentPlayer)}
                  </p>
                  <p className="text-orange-600 text-sm">
                    {currentPlayer === 'player1' ? 'צבע סגול 💜' : 'צבע ורוד 💗'}
                  </p>
                </div>
                
                <div className="border-4 border-orange-300 rounded-lg mb-4 bg-white">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair touch-none"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={sendTurn}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Send className="w-4 h-4 ml-1" />
                    שלח תור
                  </Button>
                  <Button 
                    onClick={finishDrawing}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    disabled={loading}
                  >
                    <StopCircle className="w-4 h-4 ml-1" />
                    סיים ציור
                  </Button>
                </div>
              </div>
            )}

            {gameState === 'completed' && (
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-orange-800 mb-4">הציור הושלם!</h3>
                <p className="text-orange-600 mb-6">
                  הציור נשמר בהצלחה. יפה מאוד! 🎨
                </p>
                <Button 
                  onClick={resetGame}
                  className="bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white font-semibold py-3 px-6"
                >
                  צייר ציור חדש! 🖌️
                </Button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center text-xs md:text-sm text-orange-600">
            משחק ציור שיתופי - מור וגבי מציירות ביחד יצירה אחת!
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DrawingGame;
