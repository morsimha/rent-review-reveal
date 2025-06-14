import React, { useState, useRef, useEffect } from 'react';
import { X, Send, StopCircle, Eye, ZoomIn, Palette, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDrawingGame } from '@/hooks/useDrawingGame';

interface DrawingGameProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface SavedDrawing {
  id: string;
  drawing_data: string;
  created_at: string;
  drawing_name?: string;
}

const colors = [
  { name: 'סגול', value: '#8B5CF6' },
  { name: 'ורוד', value: '#EC4899' },
  { name: 'כחול', value: '#3B82F6' },
  { name: 'ירוק', value: '#10B981' },
  { name: 'אדום', value: '#EF4444' },
  { name: 'כתום', value: '#F97316' },
  { name: 'צהוב', value: '#EAB308' },
  { name: 'שחור', value: '#000000' }
];

const DrawingGame: React.FC<DrawingGameProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<'player1' | 'player2'>('player1');
  const [selectedColor, setSelectedColor] = useState(colors[0].value);
  const [drawingData, setDrawingData] = useState<string>('');
  const [gameState, setGameState] = useState<'waiting' | 'drawing' | 'naming' | 'completed'>('waiting');
  const [drawingName, setDrawingName] = useState('');
  const [finalDrawing, setFinalDrawing] = useState<string>('');
  const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>([]);
  const [selectedDrawing, setSelectedDrawing] = useState<SavedDrawing | null>(null);
  
  const { saveDrawing, getDrawings, updateDrawingName, deleteDrawing, loading } = useDrawingGame();

  const getPlayerName = (player: 'player1' | 'player2') => {
    return player === 'player1' ? 'מור' : 'גבי';
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size - larger for better drawing experience
    canvas.width = 800;
    canvas.height = 500;
    
    // Set drawing styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = selectedColor;
    
    // If there's previous drawing data, load it
    if (drawingData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = drawingData;
    } else {
      // Clear canvas only if no previous drawing
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const loadSavedDrawings = async () => {
    const result = await getDrawings();
    if (result.success) {
      setSavedDrawings(result.data || []);
    }
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

  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = newColor;
    }
  };

  const startGame = () => {
    setGameState('drawing');
    setCurrentPlayer('player1');
    setDrawingData(''); // Reset for new game
    setSelectedColor(colors[0].value);
    initializeCanvas();
  };

  const sendTurn = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save current drawing state for next player to continue
    const imageData = canvas.toDataURL();
    setDrawingData(imageData);
    
    // Switch to next player
    const nextPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    setCurrentPlayer(nextPlayer);
    
    // Update canvas stroke color for next player
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = selectedColor;
    }
  };

  const finishDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const finalDrawingData = canvas.toDataURL();
    setFinalDrawing(finalDrawingData);
    setGameState('naming');
  };

  const saveWithName = async () => {
    if (!drawingName.trim()) return;
    
    try {
      console.log('Saving drawing with name:', drawingName);
      const result = await saveDrawing(finalDrawing, currentPlayer, true, drawingName.trim());
      console.log('Save result:', result);
      
      if (result.success) {
        setGameState('completed');
        loadSavedDrawings(); // Refresh the gallery
      } else {
        console.error('Failed to save drawing:', result.error);
      }
    } catch (error) {
      console.error('Error saving drawing:', error);
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setCurrentPlayer('player1');
    setDrawingData('');
    setDrawingName('');
    setFinalDrawing('');
    setSelectedColor(colors[0].value);
    initializeCanvas();
  };

  const viewDrawing = (drawing: SavedDrawing) => {
    setSelectedDrawing(drawing);
  };

  const handleDeleteDrawing = async (drawingId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הציור?')) {
      const result = await deleteDrawing(drawingId);
      if (result.success) {
        loadSavedDrawings(); // Refresh the gallery
        if (selectedDrawing?.id === drawingId) {
          setSelectedDrawing(null); // Close modal if viewing deleted drawing
        }
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      initializeCanvas();
      loadSavedDrawings();
    }
  }, [isOpen, currentPlayer]);

  useEffect(() => {
    if (gameState === 'drawing') {
      initializeCanvas();
    }
  }, [drawingData, selectedColor]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2" dir="rtl">
      <Card className="w-full h-full max-w-7xl max-h-[95vh] bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardContent className="p-4 md:p-6 h-full flex flex-col lg:flex-row gap-4">
          {/* Main Game Area */}
          <div className="flex-1 flex flex-col">
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
                {gameState === 'drawing' ? (
                  currentPlayer === 'player1' ? 'עכשיו תורו של מור' : 'עכשיו תורה של גבי'
                ) : ''}
              </div>
            </div>

            {/* Game Content */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {gameState === 'waiting' && (
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-bold text-orange-800 mb-4">בואו נצייר ביחד!</h3>
                  <p className="text-orange-600 mb-6">
                    מור תתחיל לצייר, אחר כך גבי תמשיך על אותו ציור, וכן הלאה...
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
                      {currentPlayer === 'player1' ? 'עכשיו תורו של מור' : 'עכשיו תורה של גבי'}
                    </p>
                    
                    {/* Color Selection */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Palette className="w-5 h-5 text-orange-600" />
                      <Select value={selectedColor} onValueChange={handleColorChange}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border border-gray-300" 
                                  style={{ backgroundColor: color.value }}
                                />
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                      className="cursor-crosshair touch-none block"
                      style={{ width: '800px', height: '500px' }}
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

              {gameState === 'naming' && (
                <div className="text-center w-full max-w-md">
                  <div className="text-6xl mb-4">🖼️</div>
                  <h3 className="text-xl font-bold text-orange-800 mb-4">תן שם לציור!</h3>
                  
                  <div className="border-4 border-orange-300 rounded-lg mb-4 bg-white">
                    <img 
                      src={finalDrawing} 
                      alt="Final Drawing" 
                      className="w-full h-auto rounded"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <Input
                      placeholder="שם הציור..."
                      value={drawingName}
                      onChange={(e) => setDrawingName(e.target.value)}
                      className="text-center text-lg"
                    />
                  </div>
                  
                  <Button 
                    onClick={saveWithName}
                    disabled={!drawingName.trim() || loading}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-6"
                  >
                    {loading ? 'שומר...' : 'שמור ציור! 💾'}
                  </Button>
                </div>
              )}

              {gameState === 'completed' && (
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-orange-800 mb-4">הציור נשמר בהצלחה!</h3>
                  <p className="text-orange-600 mb-6">
                    "{drawingName}" נוסף לגלריה. יפה מאוד! 🎨
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
              משחק ציור שיתופי - מורה וגבוץ' כשרון על חלל!
            </div>
          </div>

          {/* Gallery Sidebar */}
          <div className="lg:w-80 w-full">
            <div className="bg-white rounded-lg border-2 border-orange-200 p-4 h-full">
              <h3 className="text-lg font-bold text-orange-800 mb-4 text-center">גלריית ציורים 🖼️</h3>
              
              {savedDrawings.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {savedDrawings.map((drawing) => (
                    <div key={drawing.id} className="relative group">
                      <img 
                        src={drawing.drawing_data} 
                        alt={drawing.drawing_name || 'ציור'} 
                        className="w-full h-24 object-cover rounded border-2 border-gray-200 cursor-pointer hover:border-orange-400 transition-colors"
                        onClick={() => viewDrawing(drawing)}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewDrawing(drawing);
                          }}
                          className="bg-white/80 hover:bg-white"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDrawing(drawing.id);
                          }}
                          className="bg-red-500/80 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-center mt-1 text-orange-700 truncate">
                        {drawing.drawing_name || 'ללא שם'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-orange-600 py-8">
                  <div className="text-4xl mb-2">🎨</div>
                  <p>עדיין אין ציורים</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drawing Viewer Modal */}
      {selectedDrawing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60 p-4" dir="rtl">
          <div className="bg-white rounded-lg p-4 max-w-4xl max-h-full overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-orange-800">
                {selectedDrawing.drawing_name || 'ציור ללא שם'}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteDrawing(selectedDrawing.id)}
                >
                  <Trash2 className="w-4 h-4 ml-1" />
                  מחק
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDrawing(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <img 
              src={selectedDrawing.drawing_data} 
              alt={selectedDrawing.drawing_name || 'ציור'} 
              className="w-full h-auto rounded border-2 border-orange-200"
            />
            <p className="text-sm text-orange-600 mt-2 text-center">
              נוצר ב: {new Date(selectedDrawing.created_at).toLocaleDateString('he-IL')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingGame;
