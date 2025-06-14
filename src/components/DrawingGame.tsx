import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Save, Eye, Palette, Trash2, Lock, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDrawingGame } from '@/hooks/useDrawingGame';
import { useToast } from "@/components/ui/use-toast";

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
  { name: 'שחור', value: '#000000' },
  { name: 'אדום', value: '#EF4444' },
  { name: 'כחול', value: '#3B82F6' },
  { name: 'ירוק', value: '#10B981' },
  { name: 'סגול', value: '#8B5CF6' },
  { name: 'ורוד', value: '#EC4899' },
  { name: 'כתום', value: '#F97316' },
  { name: 'צהוב', value: '#EAB308' }
];

type GameMode = 'single' | 'multi';

const DrawingGame: React.FC<DrawingGameProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0].value);
  const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>([]);
  const [selectedDrawing, setSelectedDrawing] = useState<SavedDrawing | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [drawingName, setDrawingName] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('multi'); // ברירת מחדל למולטי

  const { 
    saveDrawing, 
    getDrawings, 
    deleteDrawing, 
    loading,
    deviceId,
    currentSession,
    initializeSession,
    switchTurn,
    isMyTurn,
    getCurrentPlayerName,
    saveDraftCanvas,
    getDraftCanvasData,
  } = useDrawingGame();
  const { toast } = useToast();

  // החזקת תוכן אחרון של ציור (רק למצב multi)
  const [lastDrawingData, setLastDrawingData] = useState<string | null>(null);

  // יצירת קנבס
  const initializeCanvas = (imgSrc?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    const width = isMobile ? Math.min(window.innerWidth - 32, 480) : 800;
    const height = isMobile ? Math.round(width * 0.625) : 500;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // אם יש ציור, טען אותו
    if (imgSrc) {
      const image = new window.Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0, width, height);
      };
      image.src = imgSrc;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = selectedColor;
  };

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Get mouse/touch position
  const getCanvasPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Drawing functions
  const startDrawing = (point: Point) => {
    // Multi only: Check if player's turn
    if (gameMode === 'multi' && !isMyTurn()) {
      toast({
        variant: "destructive",
        title: "לא התורו שלך!",
        description: `כרגע התורו של ${getCurrentPlayerName()}`,
      });
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.strokeStyle = selectedColor;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (point: Point) => {
    if (!isDrawing || !isMyTurn()) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPos(e.clientX, e.clientY);
    startDrawing(point);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPos(e.clientX, e.clientY);
    draw(point);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const point = getCanvasPos(touch.clientX, touch.clientY);
    startDrawing(point);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const point = getCanvasPos(touch.clientX, touch.clientY);
    draw(point);
  };

  // Switch player turn
  const handleSwitchTurn = async () => {
    if (gameMode === 'single') return; // disable
    if (!isMyTurn()) {
      toast({
        variant: "destructive",
        title: "לא יכול להחליף תור",
        description: "רק השחקן שהתור שלו יכול להחליף תור",
      });
      return;
    }

    // שמור טיוטה של הקנבס הנוכחי המשוייכת לסשן
    const canvas = canvasRef.current;
    if (canvas) {
      const currentImageData = canvas.toDataURL();
      await saveDraftCanvas(currentImageData);
      setLastDrawingData(currentImageData);
    }
    const result = await switchTurn();
    if (result.success) {
      toast({
        title: `התור עבר ל${getCurrentPlayerName()}`,
        description: "עכשיו השחקן השני יכול לצייר!",
      });
    } else {
      toast({
        variant: "destructive",
        title: "שגיאה בהחלפת תור",
        description: "נסו שוב מאוחר יותר",
      });
    }
  };

  // Save drawing
  const handleSaveDrawing = async () => {
    if (!drawingName.trim()) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אנא הזינו שם לציור",
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL();
    const currentTurn = (currentSession?.current_turn as 'player1' | 'player2') || 'player1';
    const result = await saveDrawing(imageData, currentTurn, true, drawingName.trim());

    if (result.success) {
      toast({
        title: "הציור נשמר!",
        description: `"${drawingName.trim()}" נוסף לגלריה.`,
        className: "bg-green-100 border-green-300 text-green-800",
      });
      setShowSaveDialog(false);
      setDrawingName('');
      loadSavedDrawings();
      setLastDrawingData(imageData); // עדכן תמונה לאחר שמירה, המשך למשתמש הבא (multi)
    } else {
      toast({
        variant: "destructive",
        title: "שגיאה בשמירת הציור",
        description: "נסו שוב מאוחר יותר.",
      });
    }
  };

  // Load saved drawings
  const loadSavedDrawings = async () => {
    const result = await getDrawings();
    if (result.success) {
      setSavedDrawings(result.data || []);
    }
  };

  // Delete drawing
  const handleDeleteDrawing = async (drawingId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הציור?')) {
      const result = await deleteDrawing(drawingId);
      if (result.success) {
        loadSavedDrawings();
        if (selectedDrawing?.id === drawingId) {
          setSelectedDrawing(null);
        }
        toast({
          title: "הציור נמחק",
          description: "הציור הוסר מהגלריה.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "שגיאה במחיקת הציור",
          description: "לא ניתן היה למחוק את הציור.",
        });
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (gameMode === 'multi' && lastDrawingData) {
        initializeCanvas(lastDrawingData);
      } else {
        initializeCanvas();
      }
      initializeSession();
      loadSavedDrawings();
    }
  }, [isOpen, gameMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = selectedColor;
    }
  }, [selectedColor]);

  useEffect(() => {
    if (!isOpen) return;

    async function loadCanvasForMulti() {
      // Only for multi mode: load the latest draft for the session
      const draft = getDraftCanvasData();
      if (gameMode === 'multi' && draft) {
        initializeCanvas(draft);
        setLastDrawingData(draft);
      } else {
        initializeCanvas();
        setLastDrawingData(null);
      }
    }

    if (gameMode === 'multi') {
      loadCanvasForMulti();
    } else {
      initializeCanvas();
      setLastDrawingData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, gameMode, currentSession?.draft_canvas_data]);

  if (!isOpen) return null;

  const myTurn = gameMode === 'single' ? true : isMyTurn();
  const currentPlayerName = getCurrentPlayerName();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2" dir="rtl">
      <Card className="w-full h-full max-w-7xl max-h-[95vh] bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardContent className="p-4 md:p-6 h-full flex flex-col lg:flex-row gap-4">
          {/* Main Drawing Area */}
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
              <div className={`text-lg font-semibold flex items-center gap-2 ${myTurn ? 'text-green-600' : 'text-orange-600'}`}>
                {!myTurn && <Lock className="w-4 h-4" />}
                {myTurn ? 'התורו שלך!' : `תורו של ${currentPlayerName}`}
              </div>
            </div>

            {/* מצב משחק: יחיד/שני משתתפים */}
            <div className="flex gap-2 items-center justify-center mb-2">
              <Button
                variant={gameMode === 'multi' ? "default" : "outline"}
                onClick={() => setGameMode('multi')}
                disabled={gameMode === 'multi'}
                className={`flex items-center gap-1 ${gameMode === 'multi' ? 'bg-purple-200 text-purple-900' : ''}`}
              >
                <Users className="w-4 h-4" />
                שני משתתפים
              </Button>
              <Button
                variant={gameMode === 'single' ? "default" : "outline"}
                onClick={() => setGameMode('single')}
                disabled={gameMode === 'single'}
                className={`flex items-center gap-1 ${gameMode === 'single' ? 'bg-yellow-100 text-yellow-900' : ''}`}
              >
                <User className="w-4 h-4" />
                עם עצמי
              </Button>
            </div>

            {/* Turn Status */}
            {gameMode === 'multi' && !myTurn && (
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 mb-4 text-center">
                <p className="text-orange-800">🔒 ממתין ל{currentPlayerName} לסיים את התור...</p>
                <p className="text-sm text-orange-600">המכשיר שלך: {deviceId}</p>
              </div>
            )}

            {/* Color Selection */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-orange-600" />
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    title={color.name}
                    disabled={!myTurn}
                    className={`w-8 h-8 rounded-full border-2 transition ${
                      selectedColor === color.value
                        ? 'border-orange-500 ring-2 ring-orange-400'
                        : 'border-gray-300'
                    } ${!myTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                  />
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className={`border-4 border-orange-300 rounded-lg mb-4 bg-white ${!myTurn ? 'opacity-70' : ''}`}>
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={stopDrawing}
                  className={`${myTurn ? 'cursor-crosshair' : 'cursor-not-allowed'} touch-none rounded`}
                  style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap justify-center">
                <Button 
                  onClick={handleSwitchTurn}
                  disabled={gameMode === 'single' || !myTurn || loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                >
                  <Send className="w-4 h-4 ml-1" />
                  סיים תור
                </Button>
                <Button 
                  onClick={() => setShowSaveDialog(true)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 ml-1" />
                  שמור ציור
                </Button>
                <Button 
                  onClick={() => clearCanvas()}
                  disabled={!myTurn}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 ml-1" />
                  נקה
                </Button>
              </div>
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
                        onClick={() => setSelectedDrawing(drawing)}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDrawing(drawing);
                          }}
                          className="bg-white/80 hover:bg-white"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60 p-4" dir="rtl">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-orange-800 mb-4">שמור ציור</h3>
            <Input
              placeholder="שם הציור..."
              value={drawingName}
              onChange={(e) => setDrawingName(e.target.value)}
              className="mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleSaveDrawing()}
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveDialog(false);
                  setDrawingName('');
                }}
              >
                ביטול
              </Button>
              <Button
                onClick={handleSaveDrawing}
                disabled={!drawingName.trim() || loading}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {loading ? 'שומר...' : 'שמור'}
              </Button>
            </div>
          </div>
        </div>
      )}

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
