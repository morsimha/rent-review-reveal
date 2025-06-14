import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Save, Eye, Palette, Trash2, Lock, Users, User, UserPlus, UserMinus } from 'lucide-react';
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
  const [gameMode, setGameMode] = useState<GameMode>('multi');

  const { 
    saveDrawing, 
    getDrawings, 
    deleteDrawing, 
    loading,
    deviceId,
    currentSession,
    initializeSession,
    joinGame,
    leaveGame,
    switchTurn,
    isMyTurn,
    getCurrentPlayerName,
    saveDraftCanvas,
    getDraftCanvasData,
    isGameReady,
    isPlayer,
    isReady
  } = useDrawingGame();
  const { toast } = useToast();

  const [lastDrawingData, setLastDrawingData] = useState<string | null>(null);

  // Handle joining/leaving game
  const handleJoinGame = async () => {
    const result = await joinGame();
    if (result.success) {
      toast({
        title: "הצטרפת למשחק!",
        description: "ממתין לשחקן נוסף...",
        className: "bg-green-100 border-green-300 text-green-800",
      });
    } else {
      toast({
        variant: "destructive",
        title: "שגיאה בהצטרפות למשחק",
        description: result.error?.toString() || "נסו שוב מאוחר יותר",
      });
    }
  };

  const handleLeaveGame = async () => {
    const result = await leaveGame();
    if (result.success) {
      toast({
        title: "עזבת את המשחק",
        description: "ניתן להצטרף שוב בכל עת",
      });
    }
  };

  // יצירת קנבס
  const initializeCanvas = (imgSrc?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    const width = isMobile ? Math.min(window.innerWidth - 60, 600) : 900;
    const height = isMobile ? Math.round(width * 0.6) : 540;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

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
    if (gameMode === 'multi' && (!isGameReady() || !isMyTurn())) {
      if (!isGameReady()) {
        toast({
          variant: "destructive",
          title: "המשחק לא מוכן!",
          description: "ממתינים לשני שחקנים",
        });
      } else {
        toast({
          variant: "destructive",
          title: "לא התורו שלך!",
          description: `כרגע התורו של ${getCurrentPlayerName()}`,
        });
      }
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
    if (!isDrawing) return;
    if (gameMode === 'multi' && (!isGameReady() || !isMyTurn())) return;
    
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
    if (gameMode === 'single') return;
    if (!isMyTurn() || !isGameReady()) {
      toast({
        variant: "destructive",
        title: "לא ניתן להחליף תור",
        description: !isGameReady() ? "המשחק לא מוכן" : "רק השחקן שבתורו יכול להחליף תור",
      });
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const currentImageData = canvas.toDataURL();
      await saveDraftCanvas(currentImageData);
      setLastDrawingData(currentImageData);
    }
    const result = await switchTurn();
    if (result.success) {
      toast({
        title: `עבר לתור שלהם`,
        description: "עכשיו הצד השני יכול לצייר!",
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
      setLastDrawingData(imageData);
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
  }, [isOpen, gameMode, currentSession?.draft_canvas_data]);

  if (!isOpen) return null;

  const myTurn = gameMode === 'single' ? true : (isGameReady() && isMyTurn());
  const turnLabel = myTurn ? 'התור שלך' : 'התור שלהם';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="w-full h-full max-w-[1400px] max-h-[95vh] bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 rounded-xl shadow-2xl border-4 border-orange-200">
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="hover:bg-red-100 border-red-300 text-red-600 font-semibold"
            >
              <X className="w-5 h-5 ml-2" />
              סגור
            </Button>
            
            <div className="text-center">
              <h2 className="text-3xl font-bold text-orange-800 mb-2 flex items-center gap-3 justify-center">
                🎨 משחק ציור שיתופי
              </h2>
              <div className={`text-xl font-bold px-4 py-2 rounded-full ${myTurn ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'} flex items-center gap-2 justify-center`}>
                {!myTurn && <Lock className="w-5 h-5" />}
                {gameMode === 'multi' && !isGameReady() ? '🔄 ממתין לשחקנים' : `🎯 ${turnLabel}`}
              </div>
            </div>

            <div className="w-20"></div>
          </div>

          <div className="flex-1 flex gap-6">
            {/* Sidebar - Gallery */}
            <div className="w-80 flex flex-col">
              <Card className="h-full bg-white/90 border-2 border-orange-300 shadow-lg">
                <CardContent className="p-4 h-full flex flex-col">
                  <h3 className="text-xl font-bold text-orange-800 mb-4 text-center flex items-center justify-center gap-2">
                    🖼️ גלריית ציורים
                  </h3>
                  
                  {savedDrawings.length > 0 ? (
                    <div className="flex-1 grid grid-cols-2 gap-3 overflow-y-auto max-h-[400px] pr-2">
                      {savedDrawings.map((drawing) => (
                        <div key={drawing.id} className="relative group">
                          <div className="bg-white rounded-lg border-2 border-gray-200 p-2 hover:border-orange-400 transition-all duration-200 hover:shadow-md">
                            <img 
                              src={drawing.drawing_data} 
                              alt={drawing.drawing_name || 'ציור'} 
                              className="w-full h-20 object-cover rounded cursor-pointer"
                              onClick={() => setSelectedDrawing(drawing)}
                            />
                            <p className="text-xs text-center mt-2 text-orange-700 truncate font-medium">
                              {drawing.drawing_name || 'ללא שם'}
                            </p>
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDrawing(drawing);
                              }}
                              className="bg-white/90 hover:bg-white text-xs"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDrawing(drawing.id);
                              }}
                              className="bg-red-500/90 hover:bg-red-600 text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-orange-600">
                      <div>
                        <div className="text-6xl mb-4">🎨</div>
                        <p className="text-lg font-medium">עדיין אין ציורים</p>
                        <p className="text-sm opacity-70">צייר משהו ושמור!</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Drawing Area */}
            <div className="flex-1 flex flex-col">
              {/* Game Mode Selection */}
              <div className="flex gap-3 items-center justify-center mb-4">
                <Button
                  variant={gameMode === 'multi' ? "default" : "outline"}
                  onClick={() => setGameMode('multi')}
                  disabled={gameMode === 'multi'}
                  className={`flex items-center gap-2 px-6 py-3 text-lg font-semibold ${gameMode === 'multi' ? 'bg-purple-500 text-white shadow-lg' : 'border-2 border-purple-300 text-purple-700 hover:bg-purple-50'}`}
                >
                  <Users className="w-5 h-5" />
                  שני משתתפים
                </Button>
                <Button
                  variant={gameMode === 'single' ? "default" : "outline"}
                  onClick={() => setGameMode('single')}
                  disabled={gameMode === 'single'}
                  className={`flex items-center gap-2 px-6 py-3 text-lg font-semibold ${gameMode === 'single' ? 'bg-yellow-500 text-white shadow-lg' : 'border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50'}`}
                >
                  <User className="w-5 h-5" />
                  עם עצמי
                </Button>
              </div>

              {/* Player Status for Multi Mode */}
              {gameMode === 'multi' && (
                <Card className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-purple-800 font-bold text-lg">סטטוס שחקנים:</span>
                      <span className="text-sm text-purple-600 bg-purple-200 px-3 py-1 rounded-full">המכשיר: {deviceId}</span>
                    </div>
                    <div className="flex items-center justify-center gap-6">
                      {!isPlayer() ? (
                        <Button
                          onClick={handleJoinGame}
                          disabled={loading}
                          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                        >
                          <UserPlus className="w-5 h-5 ml-2" />
                          🎮 אני רוצה לשחק
                        </Button>
                      ) : (
                        <div className="flex items-center gap-6">
                          <span className="text-green-700 font-bold text-lg flex items-center gap-2">
                            ✅ הצטרפת למשחק
                          </span>
                          <Button
                            onClick={handleLeaveGame}
                            disabled={loading}
                            variant="outline"
                            className="border-2 border-red-300 text-red-600 hover:bg-red-50 px-6 py-2 font-semibold"
                          >
                            <UserMinus className="w-4 h-4 ml-1" />
                            עזוב משחק
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="text-center mt-3">
                      <span className={`text-lg font-bold ${isGameReady() ? 'text-green-700' : 'text-purple-700'}`}>
                        {isGameReady() ? '🎉 שני שחקנים מוכנים!' : 
                         `⏳ ממתין ל${currentSession?.player1_ready && currentSession?.player2_ready ? '' : 
                         (!currentSession?.player1_ready && !currentSession?.player2_ready) ? 'שני שחקנים' :
                         'שחקן נוסף'}`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Turn Status Warning */}
              {gameMode === 'multi' && isGameReady() && !myTurn && (
                <Card className="mb-4 bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300">
                  <CardContent className="p-4 text-center">
                    <p className="text-orange-800 font-bold text-lg flex items-center justify-center gap-2">
                      🔒 ממתין לסיום התור שלהם...
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Color Selection */}
              <div className="bg-white/80 rounded-xl p-4 mb-4 border-2 border-orange-200">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <Palette className="w-6 h-6 text-orange-600" />
                    <span className="font-bold text-orange-800">בחר צבע:</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        title={color.name}
                        disabled={gameMode === 'multi' && (!isGameReady() || !myTurn)}
                        className={`w-12 h-12 rounded-full border-4 transition-all duration-200 hover:scale-110 ${
                          selectedColor === color.value
                            ? 'border-orange-500 ring-4 ring-orange-300 shadow-lg scale-110'
                            : 'border-gray-300 hover:border-gray-400'
                        } ${(gameMode === 'multi' && (!isGameReady() || !myTurn)) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSelectedColor(color.value)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className={`border-4 border-orange-400 rounded-xl mb-4 bg-white shadow-xl ${(gameMode === 'multi' && (!isGameReady() || !myTurn)) ? 'opacity-70' : ''}`}>
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={stopDrawing}
                    className={`${(gameMode === 'single' || (isGameReady() && myTurn)) ? 'cursor-crosshair' : 'cursor-not-allowed'} touch-none rounded-lg`}
                    style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 flex-wrap justify-center">
                  <Button 
                    onClick={handleSwitchTurn}
                    disabled={gameMode === 'single' || !isGameReady() || !myTurn || loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 px-6 py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Send className="w-5 h-5 ml-2" />
                    ✅ סיים תור
                  </Button>
                  <Button 
                    onClick={() => setShowSaveDialog(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                    disabled={loading}
                  >
                    <Save className="w-5 h-5 ml-2" />
                    💾 שמור ציור
                  </Button>
                  <Button 
                    onClick={() => clearCanvas()}
                    disabled={gameMode === 'multi' && (!isGameReady() || !myTurn)}
                    variant="outline"
                    className="border-2 border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 px-6 py-3 text-lg font-bold"
                  >
                    <Trash2 className="w-5 h-5 ml-2" />
                    🗑️ נקה
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4" dir="rtl">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-orange-800 mb-4 text-center">💾 שמור ציור</h3>
              <Input
                placeholder="שם הציור..."
                value={drawingName}
                onChange={(e) => setDrawingName(e.target.value)}
                className="mb-4 text-lg p-3 border-2 border-orange-300"
                onKeyPress={(e) => e.key === 'Enter' && handleSaveDrawing()}
              />
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setDrawingName('');
                  }}
                  className="px-6 py-2 border-2 border-gray-300"
                >
                  ביטול
                </Button>
                <Button
                  onClick={handleSaveDrawing}
                  disabled={!drawingName.trim() || loading}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 font-bold"
                >
                  {loading ? 'שומר...' : '✅ שמור'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Drawing Viewer Modal */}
      {selectedDrawing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4" dir="rtl">
          <Card className="max-w-4xl max-h-full overflow-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-orange-800">
                  🖼️ {selectedDrawing.drawing_name || 'ציור ללא שם'}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDrawing(selectedDrawing.id)}
                    className="px-4 py-2"
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    מחק
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDrawing(null)}
                    className="px-4 py-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <img 
                src={selectedDrawing.drawing_data} 
                alt={selectedDrawing.drawing_name || 'ציור'} 
                className="w-full h-auto rounded-lg border-2 border-orange-200 shadow-lg"
              />
              <p className="text-sm text-orange-600 mt-3 text-center font-medium">
                📅 נוצר ב: {new Date(selectedDrawing.created_at).toLocaleDateString('he-IL')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DrawingGame;
