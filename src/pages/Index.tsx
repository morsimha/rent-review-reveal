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

const Index = () => {
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCatGameOpen, setIsCatGameOpen] = useState(false);
  const [isDrawingGameOpen, setIsDrawingGameOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "entry_date" | "created_at" | "status">("rating");
  const [statusFilter, setStatusFilter] = useState<"all" | "spoke" | "not_spoke" | "no_answer">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);

  const { isAuthenticated, login } = useAuth();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);
  const { toast } = useToast();
  const { themeConfig } = useTheme();

  useEffect(() => {
    if (!isAuthenticated && !authAttempted) {
      // Use timeout to prevent dialog from opening before AuthProvider initializes
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

  // handleAddApartment now supports arnona
  const handleAddApartment = async (apartmentData: any) => {
    // נתמך גם arnona
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
        />

        {/* כפתור הוסף דירה */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className={`${themeConfig.buttonGradient} text-white text-lg px-6 py-3 rounded shadow transition`}
            disabled={!isAuthenticated}
          >
            + הוסף דירה חדשה
          </Button>
        </div>

        {/* תפריט מיון וסינון סטטוס */}
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

        {filteredApartments.length === 0 && (
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
