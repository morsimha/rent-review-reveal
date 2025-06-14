
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApartments, type Apartment } from '@/hooks/useApartments';
import Map from '@/components/Map';
import CatGame from '@/components/CatGame';
import ApartmentForm from '@/components/ApartmentForm';
import ApartmentCard from '@/components/ApartmentCard';
import EditApartmentDialog from '@/components/EditApartmentDialog';

const Index = () => {
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCatGameOpen, setIsCatGameOpen] = useState(false);

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

  const handleAddApartment = async (apartmentData: any) => {
    const result = await addApartment(apartmentData);
    return result.success;
  };

  const handleMorRatingChange = async (apartmentId: string, newRating: number) => {
    await updateMorRating(apartmentId, newRating);
  };

  const handleGabiRatingChange = async (apartmentId: string, newRating: number) => {
    await updateGabiRating(apartmentId, newRating);
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

        {/* Add Apartment Form */}
        <ApartmentForm onAddApartment={handleAddApartment} uploadImage={uploadImage} />

        {/* Map Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-4 text-center">מפת הדירות</h2>
          <Map apartments={apartments} />
        </div>

        {/* Apartments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {apartments.map((apartment) => (
            <ApartmentCard
              key={apartment.id}
              apartment={apartment}
              onEdit={handleEditApartment}
              onDelete={handleDelete}
              onMorRatingChange={handleMorRatingChange}
              onGabiRatingChange={handleGabiRatingChange}
            />
          ))}
        </div>

        {apartments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-purple-600 text-lg">עדיין לא נוספו דירות. התחילו לחפש! 🏠</p>
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

      {/* Cat Game Modal */}
      <CatGame isOpen={isCatGameOpen} onClose={() => setIsCatGameOpen(false)} />
    </div>
  );
};

export default Index;
