import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApartments } from '@/hooks/useApartments';
import type { Apartment } from '@/types/ApartmentTypes';
import Map from '@/components/Map';
import CatGame from '@/components/CatGame';
import DrawingGame from '@/components/DrawingGame';
import ApartmentForm from '@/components/ApartmentForm';
import ApartmentCard from '@/components/ApartmentCard';
import EditApartmentDialog from '@/components/EditApartmentDialog';
import { useAuth } from '@/contexts/AuthContext';
import PasswordDialog from '@/components/PasswordDialog';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeHeader from '@/components/ThemeHeader';
import TinderMode from '@/components/TinderMode';
import Yad2ScanDialog from '@/components/Yad2ScanDialog';
import { useScannedApartments } from '@/hooks/useScannedApartments';

const Index = () => {
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCatGameOpen, setIsCatGameOpen] = useState(false);
  const [isDrawingGameOpen, setIsDrawingGameOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "entry_date" | "created_at" | "status">("rating");
  const [statusFilter, setStatusFilter] = useState<"all" | "spoke" | "not_spoke" | "no_answer">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<'regular' | 'functional' | 'tinder'>('regular');
  const [tinderMode, setTinderMode] = useState<'regular' | 'scanned'>('regular');
  const [isYad2ScanDialogOpen, setIsYad2ScanDialogOpen] = useState(false);

  const { isAuthenticated, login } = useAuth();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);
  const { toast } = useToast();
  const { themeConfig } = useTheme();

  useEffect(() => {
    if (!isAuthenticated && !authAttempted) {
      setTimeout(() => {
        if (!sessionStorage.getItem('isAuthenticated')) {
          setIsPasswordDialogOpen(true);
        }
      }, 100);
    }
  }, [isAuthenticated, authAttempted]);

  const {
    apartments,
    loading,
    addApartment,
    updateApartment,
    deleteApartment,
    updateMorRating,
    updateGabiRating,
    uploadImage
  } = useApartments();

  const {
    scannedApartments,
    loading: scannedLoading,
    likeScannedApartment,
    refreshScanned
  } = useScannedApartments();

  const handleAddApartment = async (apartmentData: any) => {
    const result = await addApartment(apartmentData);
    return result.success;
  };

  const handleMorRatingChange = async (apartmentId: string, newRating: number) => {
    if (!isAuthenticated) return;
    await updateMorRating(apartmentId, newRating);
  };

  const handleGabiRatingChange = async (apartmentId: string, newRating: number) => {
    if (!isAuthenticated) return;
    await updateGabiRating(apartmentId, newRating);
  };

  const handleMorTalkedChange = async (apartmentId: string, value: boolean) => {
    if (!isAuthenticated) return;
    await updateApartment(apartmentId, { spoke_with_mor: value });
  };
  
  const handleGabiTalkedChange = async (apartmentId: string, value: boolean) => {
    if (!isAuthenticated) return;
    await updateApartment(apartmentId, { spoke_with_gabi: value });
  };

  const handleEditApartment = (apartment: Apartment) => {
    setEditingApartment(apartment);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (apartmentId: string, editFormData: Partial<Apartment>) => {
    const result = await updateApartment(apartmentId, editFormData);
    if (result.success) {
      setEditingApartment(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDelete = async (apartmentId: string) => {
    await deleteApartment(apartmentId);
  };

  const handlePasswordSubmit = (password: string) => {
    setAuthAttempted(true);
    const success = login(password);
    if (success) {
      setIsPasswordDialogOpen(false);
      toast({
        title: "התחברת בהצלחה!",
        description: "כעת באפשרותך לערוך את רשימת הדירות.",
      });
    } else {
      toast({
        title: "סיסמא שגויה",
        description: "הסיסמא שהזנת אינה נכונה. הנך במצב צפייה בלבד.",
        variant: "destructive",
      });
    }
  };

  const onPasswordDialogChange = (open: boolean) => {
    setIsPasswordDialogOpen(open);
    if (!open) {
      setAuthAttempted(true);
      if (!isAuthenticated) {
        toast({
          title: "מצב צפייה בלבד",
          description: "לא הוזנה סיסמא. לא ניתן לבצע שינויים.",
        });
      }
    }
  };

  const handleLayoutToggle = () => {
    if (layoutMode === 'regular') {
      setLayoutMode('functional');
    } else if (layoutMode === 'functional') {
      setLayoutMode('tinder');
      setTinderMode('regular'); // Reset to regular when entering tinder mode
    } else {
      setLayoutMode('regular');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeConfig.backgroundGradient} flex items-center justify-center`} dir="rtl">
        <div className="text-center">
          <div className="text-4xl mb-4">{themeConfig.mainEmoji}</div>
          <p className={`${themeConfig.accentColor} text-lg`}>טוען דירות...</p>
        </div>
      </div>
    );
  }

  // סינון לפי סטטוס
  let filteredApartments = apartments;
  if (statusFilter !== "all") {
    filteredApartments = filteredApartments.filter(a => a.status === statusFilter);
  }

  // ממיין
  if (sortBy === "entry_date") {
    filteredApartments = [...filteredApartments].sort((a, b) => {
      if (!a.entry_date) return 1;
      if (!b.entry_date) return -1;
      return a.entry_date.localeCompare(b.entry_date);
    });
  } else if (sortBy === "rating") {
    filteredApartments = [...filteredApartments].sort((a, b) => {
      const totalA = (a.mor_rating||0)+(a.gabi_rating||0);
      const totalB = (b.mor_rating||0)+(b.gabi_rating||0);
      return totalB-totalA;
    });
  } else if (sortBy === "created_at") {
    filteredApartments = [...filteredApartments].sort((a, b) => b.created_at.localeCompare(a.created_at));
  } else if (sortBy === "status") {
    const statusOrder = { "spoke": 0, "not_spoke": 1, "no_answer": 2 };
    filteredApartments = [...filteredApartments].sort((a, b) => {
      const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
      const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
      return aOrder - bOrder;
    });
  }

  return (
    <div className={`min-h-screen ${themeConfig.backgroundGradient} relative overflow-hidden`} dir="rtl">
      {/* Themed Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        {themeConfig.backgroundEmojis.map((emoji, index) => {
          const positions = [
            'top-10 left-10 text-6xl',
            'top-32 right-20 text-4xl',
            'top-64 left-1/4 text-5xl',
            'bottom-40 right-1/3 text-6xl',
            'bottom-20 left-20 text-4xl',
            'top-1/2 right-10 text-5xl',
            'bottom-1/2 left-1/2 text-4xl'
          ];
          return (
            <div key={index} className={`absolute ${positions[index] || 'top-10 left-10 text-4xl'}`}>
              {emoji}
            </div>
          );
        })}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Themed Header */}
        <ThemeHeader 
          onDrawingGameOpen={() => setIsDrawingGameOpen(true)}
          onCatGameOpen={() => setIsCatGameOpen(true)}
          onLayoutToggle={handleLayoutToggle}
          layoutMode={layoutMode}
        />

        {/* כפתורי הוסף דירה וסרוק דירות */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className={`${themeConfig.buttonGradient} text-white text-lg px-6 py-3 rounded shadow transition`}
            disabled={!isAuthenticated}
          >
            + הוסף דירה חדשה
          </Button>
          
          <Button
            onClick={() => setIsYad2ScanDialogOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg px-6 py-3 rounded shadow transition"
            disabled={!isAuthenticated}
          >
            🔍 סרוק דירות אוטומטית
          </Button>
        </div>

        {/* תפריט מיון וסינון סטטוס - הסתר במוד טינדר */}
        {layoutMode !== 'tinder' && (
          <div className="flex flex-wrap justify-center items-center gap-3 mb-7">
            <div className="flex items-center gap-2">
              <label className={`font-medium ${themeConfig.textColor} text-sm`}>מיין לפי:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="rounded border px-2 py-1 text-right"
              >
                <option value="rating">דירוג {themeConfig.sortEmojis.rating}</option>
                <option value="entry_date">תאריך כניסה {themeConfig.sortEmojis.entry_date}</option>
                <option value="created_at">מועד הוספה {themeConfig.sortEmojis.created_at}</option>
                <option value="status">סטטוס דיבור {themeConfig.sortEmojis.status}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className={`font-medium ${themeConfig.textColor} text-sm`}>סנן לפי סטטוס:</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="rounded border px-2 py-1 text-right"
              >
                <option value="all">הצג הכל</option>
                <option value="spoke">דיברנו</option>
                <option value="not_spoke">לא דיברנו</option>
                <option value="no_answer">אין תשובה</option>
              </select>
            </div>
          </div>
        )}

        {/* Modal להוספת דירה */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">הוסף דירה חדשה</DialogTitle>
            </DialogHeader>
            <ApartmentForm
              onAddApartment={async (data) => {
                const success = await handleAddApartment(data);
                if (success) setIsAddDialogOpen(false);
                return success;
              }}
              uploadImage={uploadImage}
            />
          </DialogContent>
        </Dialog>

        {/* Yad2 Scan Dialog */}
        <Yad2ScanDialog
          open={isYad2ScanDialogOpen}
          onOpenChange={setIsYad2ScanDialogOpen}
          onScanComplete={refreshScanned}
        />

        {/* Layout Content */}
        {layoutMode === 'tinder' ? (
          /* Enhanced Tinder Mode with scanned apartments option */
          <div className="space-y-6">
            {/* Tinder Title - Now above the toggle buttons */}
            <div className="text-center mb-6">
              <h2 className={`text-2xl font-bold ${themeConfig.textColor}`}>
                💕 Tindira Is Back 💕
              </h2>
            </div>
            
            {/* Toggle between regular and scanned apartments in Tinder mode */}
            {scannedApartments.length >= 0 && (
              <div className="flex justify-center mb-6">
                <div className="flex bg-white/80 rounded-lg p-1">
                  <button
                    onClick={() => setTinderMode('regular')}
                    className={`px-4 py-2 rounded text-sm transition ${
                      tinderMode === 'regular' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    דירות רגילות ({filteredApartments.length})
                  </button>
                  <button
                    onClick={() => setTinderMode('scanned')}
                    className={`px-4 py-2 rounded text-sm transition ${
                      tinderMode === 'scanned' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    דירות סרוקות ({scannedApartments.length})
                  </button>
                </div>
              </div>
            )}
            
            <TinderMode
              apartments={filteredApartments}
              scannedApartments={scannedApartments}
              onMorRatingChange={handleMorRatingChange}
              onGabiRatingChange={handleGabiRatingChange}
              onLikeScanned={likeScannedApartment}
              isAuthenticated={isAuthenticated}
              mode={tinderMode}
            />
          </div>
        ) : layoutMode === 'functional' ? (
          /* Functional Layout */
          <div className="space-y-6">
            {/* Compact Map */}
            <div className="mb-6">
              <h2 className={`text-xl font-bold ${themeConfig.textColor} mb-3 text-center`}>
                מפה קומפקטית 📍
              </h2>
              <div className="h-64 rounded-lg overflow-hidden shadow-lg">
                <Map
                  apartments={apartments}
                  selectedApartmentId={selectedApartmentId}
                  setSelectedApartmentId={setSelectedApartmentId}
                  isCompact={true}
                />
              </div>
            </div>

            {/* Apartments List View */}
            <div className="space-y-4">
              <h2 className={`text-xl font-bold ${themeConfig.textColor} mb-3 text-center`}>
                רשימת דירות 🏠
              </h2>
              {filteredApartments.map((apartment) => (
                <div key={apartment.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <ApartmentCard
                    apartment={apartment}
                    onEdit={handleEditApartment}
                    onDelete={handleDelete}
                    onMorRatingChange={handleMorRatingChange}
                    onGabiRatingChange={handleGabiRatingChange}
                    isAuthenticated={isAuthenticated}
                    onCardClick={() => setSelectedApartmentId(apartment.id)}
                    onMorTalkedChange={handleMorTalkedChange}
                    onGabiTalkedChange={handleGabiTalkedChange}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Regular Layout */
          <>
            {/* Map Section */}
            <div className="mb-8">
              <h2 className={`text-2xl font-bold ${themeConfig.textColor} mb-4 text-center`}>
                {themeConfig.mapTitle}
              </h2>
              <Map
                apartments={apartments}
                selectedApartmentId={selectedApartmentId}
                setSelectedApartmentId={setSelectedApartmentId}
              />
            </div>

            {/* Apartments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredApartments.map((apartment) => (
                <ApartmentCard
                  key={apartment.id}
                  apartment={apartment}
                  onEdit={handleEditApartment}
                  onDelete={handleDelete}
                  onMorRatingChange={handleMorRatingChange}
                  onGabiRatingChange={handleGabiRatingChange}
                  isAuthenticated={isAuthenticated}
                  onCardClick={() => setSelectedApartmentId(apartment.id)}
                  onMorTalkedChange={handleMorTalkedChange}
                  onGabiTalkedChange={handleGabiTalkedChange}
                />
              ))}
            </div>
          </>
        )}

        {filteredApartments.length === 0 && layoutMode !== 'tinder' && (
          <div className="text-center py-12">
            <p className={`${themeConfig.accentColor} text-lg`}>לא נמצאו דירות בהתאם לסינון {themeConfig.mainEmoji}</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <EditApartmentDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        apartment={editingApartment}
        onSave={handleSaveEdit}
        uploadImage={uploadImage}
      />

      {/* Drawing Game Modal */}
      <DrawingGame isOpen={isDrawingGameOpen} onClose={() => setIsDrawingGameOpen(false)} />

      {/* Cat Game Modal */}
      <CatGame isOpen={isCatGameOpen} onClose={() => setIsCatGameOpen(false)} />

      <PasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={onPasswordDialogChange}
        onPasswordSubmit={handlePasswordSubmit}
      />
    </div>
  );
};

export default Index;
