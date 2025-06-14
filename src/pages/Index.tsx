
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApartments, type Apartment } from '@/hooks/useApartments';
import Map from '@/components/Map';
import CatGame from '@/components/CatGame';
import DrawingGame from '@/components/DrawingGame';
import ApartmentForm from '@/components/ApartmentForm';
import ApartmentCard from '@/components/ApartmentCard';
import EditApartmentDialog from '@/components/EditApartmentDialog';
import PasswordPromptDialog from '@/components/PasswordPromptDialog';
import { useToast } from '@/hooks/use-toast';

const SECRET = "wika";

const Index = () => {
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCatGameOpen, setIsCatGameOpen] = useState(false);
  const [isDrawingGameOpen, setIsDrawingGameOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "entry_date" | "created_at">("rating");
  const [showWithShelter, setShowWithShelter] = useState<null | boolean>(null);

  // דיאלוגים ותצוגה להוספה ולסיסמה
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [pendingPasswordAction, setPendingPasswordAction] = useState<null | { cb: (ok: boolean) => void; action: 'add' | 'edit' | 'delete'; }>(null);
  const [pendingApartmentData, setPendingApartmentData] = useState<any>(null);
  const [pendingEditData, setPendingEditData] = useState<{ id: string, updates: Partial<Apartment> } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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

  const { toast } = useToast();

  const handleAddApartmentIntent = (apartmentData: any) => {
    setPendingApartmentData(apartmentData);
    setPendingPasswordAction({ cb: handleAddApartmentPassword, action: 'add' });
  };

  const handleAddApartmentPassword = (ok: boolean) => {
    if (ok && pendingApartmentData) {
      addApartment(pendingApartmentData);
      setIsAddDialogOpen(false);
    } else if (!ok) {
      toast({
        title: "סיסמה שגויה",
        description: "הוספה בוטלה.",
        variant: "destructive"
      });
    }
    setPendingApartmentData(null);
    setPendingPasswordAction(null);
  };

  const handleAddApartment = async (apartmentData: any) => {
    // מופעל מתוך ApartmentForm: במקום להוסיף מיד, תפתח בקשת סיסמה
    handleAddApartmentIntent(apartmentData);
    return true;
  };

  // *** עריכת דירה ***
  const handleEditApartment = (apartment: Apartment) => {
    setEditingApartment(apartment);
    setIsEditDialogOpen(true);
  };
  const handleSaveEdit = (apartmentId: string, updates: Partial<Apartment>) => {
    setPendingEditData({ id: apartmentId, updates });
    setPendingPasswordAction({ cb: handleEditPassword, action: 'edit' });
  };
  const handleEditPassword = (ok: boolean) => {
    if (ok && pendingEditData) {
      updateApartment(pendingEditData.id, pendingEditData.updates);
      setIsEditDialogOpen(false);
    } else if (!ok) {
      toast({
        title: "סיסמה שגויה",
        description: "הפעולה בוטלה.",
        variant: "destructive"
      });
    }
    setPendingEditData(null);
    setPendingPasswordAction(null);
  };

  // *** מחיקת דירה ***
  const handleRequestDelete = (apartmentId: string) => {
    setPendingDeleteId(apartmentId);
    setPendingPasswordAction({ cb: handleDeletePassword, action: 'delete' });
  };
  const handleDeletePassword = (ok: boolean) => {
    if (ok && pendingDeleteId) {
      deleteApartment(pendingDeleteId);
    } else if (!ok) {
      toast({
        title: "סיסמה שגויה",
        description: "המחיקה בוטלה.",
        variant: "destructive"
      });
    }
    setPendingDeleteId(null);
    setPendingPasswordAction(null);
  };

  // הצגת דיאלוג סיסמה
  const handlePasswordPrompt = (password: string) => {
    const ok = password.trim() === SECRET;
    if (pendingPasswordAction) {
      pendingPasswordAction.cb(ok);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-4xl mb-4">🏠</div>
          <p className="text-purple-600 text-lg">טוען דירות...</p>
        </div>
      </div>
    );
  }

  let filteredApartments = apartments;
  if (showWithShelter !== null) {
    filteredApartments = filteredApartments.filter(a => (a.has_shelter ?? false) === showWithShelter);
  }
  if (sortBy === "entry_date") {
    filteredApartments = [...filteredApartments].sort((a, b) => {
      if (!a.entry_date) return 1;
      if (!b.entry_date) return -1;
      return a.entry_date.localeCompare(b.entry_date); // מוקדם קודם
    });
  } else if (sortBy === "rating") {
    filteredApartments = [...filteredApartments].sort((a, b) => {
      const totalA = (a.mor_rating||0)+(a.gabi_rating||0);
      const totalB = (b.mor_rating||0)+(b.gabi_rating||0);
      return totalB-totalA;
    });
  } else if (sortBy === "created_at") {
    filteredApartments = [...filteredApartments].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 relative overflow-hidden" dir="rtl">
      {/* Cat Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl">🐱</div>
        <div className="absolute top-32 right-20 text-4xl">😸</div>
        <div className="absolute top-64 left-1/4 text-5xl">🐈</div>
        <div className="absolute bottom-40 right-1/3 text-6xl">😻</div>
        <div className="absolute bottom-20 left-20 text-4xl">🐾</div>
        <div className="absolute top-1/2 right-10 text-5xl">🙀</div>
        <div className="absolute bottom-1/2 left-1/2 text-4xl">😺</div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">מור וגבי מוצאים דירה</h1>
          <p className="text-purple-600 text-lg">וואו איזה ביתתת 🏠✨</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Button
              onClick={() => setIsDrawingGameOpen(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-2xl p-3 rounded-full animate-pulse"
              title="משחק ציור שיתופי!"
            >
              🎨
            </Button>
            <p className="text-sm text-purple-500">מי שמוסיף הכי פחות דירות עושה כלים לשבוע בבית החדש</p>
            <Button
              onClick={() => setIsCatGameOpen(true)}
              className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white text-2xl p-3 rounded-full animate-bounce"
              title="תפוס את החתול!"
            >
              🐱
            </Button>
          </div>
        </div>

        {/* תפריט מיון ופילטור */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-7">
          <div className="flex items-center gap-2">
            <label className="font-medium text-purple-700 text-sm">מיין לפי:</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="rounded border px-2 py-1 text-right"
            >
              <option value="rating">דירוג 🏅</option>
              <option value="entry_date">תאריך כניסה 🗓️</option>
              <option value="created_at">מועד הוספה ⏰</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-medium text-purple-700 text-sm">רק עם מקלט</label>
            <input
              type="checkbox"
              checked={showWithShelter === true}
              onChange={() => setShowWithShelter(showWithShelter === true ? null : true)}
              className="accent-purple-600 w-4 h-4"
            />
            <label className="font-medium text-purple-700 text-sm">רק בלי מקלט</label>
            <input
              type="checkbox"
              checked={showWithShelter === false}
              onChange={() => setShowWithShelter(showWithShelter === false ? null : false)}
              className="accent-purple-600 w-4 h-4"
            />
          </div>
        </div>

        {/* כפתור בלבד להוספת דירה */}
        <div className="flex justify-center mb-7">
          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-lg text-xl"
            onClick={() => setIsAddDialogOpen(true)}
          >
            הוסף דירה
          </Button>
        </div>

        {/* דיאלוג הוספת דירה */}
        <EditApartmentDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          apartment={null}
          onSave={handleAddApartment}
          uploadImage={uploadImage}
          isAdd={true}
        />

        {/* Map Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-4 text-center">מפת הדירות</h2>
          <Map apartments={apartments} />
        </div>

        {/* Apartments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredApartments.map((apartment) => (
            <ApartmentCard
              key={apartment.id}
              apartment={apartment}
              onEdit={handleEditApartment}
              onDelete={handleRequestDelete}
              onMorRatingChange={updateMorRating}
              onGabiRatingChange={updateGabiRating}
            />
          ))}
        </div>

        {filteredApartments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-purple-600 text-lg">לא נמצאו דירות בהתאם לסינון 🏠</p>
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
        isAdd={false}
      />

      {/* דיאלוג להזנת סיסמה */}
      <PasswordPromptDialog
        isOpen={!!pendingPasswordAction}
        onConfirm={handlePasswordPrompt}
        onCancel={() => setPendingPasswordAction(null)}
        title="אימות סיסמה"
        confirmText="אישור"
      />

      {/* Drawing Game Modal */}
      <DrawingGame isOpen={isDrawingGameOpen} onClose={() => setIsDrawingGameOpen(false)} />

      {/* Cat Game Modal */}
      <CatGame isOpen={isCatGameOpen} onClose={() => setIsCatGameOpen(false)} />
    </div>
  );
};

export default Index;
