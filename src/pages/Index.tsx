import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ApartmentForm from '@/components/ApartmentForm';
import ApartmentGallery from '@/components/ApartmentGallery';
import EditApartmentDialog from '@/components/EditApartmentDialog';
import DrawingGame from '@/components/DrawingGame';
import CatChaseGame from '@/components/CatChaseGame';
import ThemeHeader from '@/components/ThemeHeader';
import TinderMode from '@/components/TinderMode';
import Yad2ScanDialog from '@/components/Yad2ScanDialog';
import Map from '@/components/Map';
import { useToast } from '@/hooks/use-toast';
import type { Apartment } from '@/types/ApartmentTypes';
import { getApartments, addApartment, updateApartment, deleteApartment, uploadImage } from '@/api/apartmentApi';
import { getScannedApartments } from '@/api/scannedApartmentApi';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { themeConfig } = useTheme();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [scannedApartments, setScannedApartments] = useState<any[]>([]);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDrawingGameOpen, setIsDrawingGameOpen] = useState(false);
  const [isCatGameOpen, setIsCatGameOpen] = useState(false);
  const [isYad2ScanOpen, setIsYad2ScanOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'regular' | 'functional' | 'tinder'>('regular');
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchData();
    fetchScannedApartments();
  }, []);

  const fetchData = async () => {
    const data = await getApartments();
    setApartments(data);
  };

  const fetchScannedApartments = async () => {
    const data = await getScannedApartments();
    setScannedApartments(data);
  };

  const handleAddApartment = async (apartmentData: any) => {
    try {
      const newApartment = await addApartment(apartmentData);
      if (newApartment) {
        setApartments([...apartments, newApartment]);
        toast({
          title: "הדירה נוספה בהצלחה!",
          description: `${newApartment.title} נוספה לרשימה`,
        });
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "שגיאה בהוספת דירה",
        description: "משהו השתבש, נסה שוב",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteApartment = async (id: string) => {
    const success = await deleteApartment(id);
    if (success) {
      setApartments(apartments.filter(apt => apt.id !== id));
      toast({
        title: "הדירה נמחקה",
        description: "הדירה הוסרה מהרשימה",
      });
    } else {
      toast({
        title: "שגיאה במחיקה",
        description: "לא הצלחנו למחוק את הדירה",
        variant: "destructive",
      });
    }
  };

  const handleEditApartment = (apartment: Apartment) => {
    setEditingApartment(apartment);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (apartmentId: string, updates: Partial<Apartment>) => {
    const success = await updateApartment(apartmentId, updates);
    if (success) {
      setApartments(apartments.map(apt => 
        apt.id === apartmentId ? { ...apt, ...updates } : apt
      ));
      setIsEditModalOpen(false);
      setEditingApartment(null);
      toast({
        title: "הדירה עודכנה",
        description: "השינויים נשמרו בהצלחה",
      });
    } else {
      toast({
        title: "שגיאה בעדכון",
        description: "לא הצלחנו לשמור את השינויים",
        variant: "destructive",
      });
    }
  };

  const handleMorRatingChange = async (apartmentId: string, rating: number) => {
    const success = await updateApartment(apartmentId, { mor_rating: rating });
    if (success) {
      setApartments(apartments.map(apt => 
        apt.id === apartmentId ? { ...apt, mor_rating: rating } : apt
      ));
    }
  };

  const handleGabiRatingChange = async (apartmentId: string, rating: number) => {
    const success = await updateApartment(apartmentId, { gabi_rating: rating });
    if (success) {
      setApartments(apartments.map(apt => 
        apt.id === apartmentId ? { ...apt, gabi_rating: rating } : apt
      ));
    }
  };

  const handleAddScannedApartment = async (scannedApartment: any) => {
    try {
      // המר את הדירה הסרוקה לפורמט של דירה רגילה
      const newApartment = {
        fb_url: scannedApartment.apartment_link || `https://yad2.co.il/${Date.now()}`,
        title: scannedApartment.title,
        description: scannedApartment.description,
        price: scannedApartment.price,
        location: scannedApartment.location,
        image_url: scannedApartment.image_url,
        apartment_link: scannedApartment.apartment_link,
        contact_phone: scannedApartment.contact_phone,
        contact_name: scannedApartment.contact_name,
        status: 'not_spoke' as const,
        pets_allowed: scannedApartment.pets_allowed || 'unknown',
        rating: 0,
        mor_rating: 0,
        gabi_rating: 0,
      };
      
      const success = await handleAddApartment(newApartment);
      if (success) {
        // הסר את הדירה מרשימת הסרוקות
        setScannedApartments(scannedApartments.filter(apt => apt.id !== scannedApartment.id));
        toast({
          title: "הדירה נוספה!",
          description: "הדירה הסרוקה נוספה למאגר הדירות הרגיל",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו להוסיף את הדירה",
        variant: "destructive",
      });
    }
  };

  const handleLayoutToggle = () => {
    if (layoutMode === 'regular') {
      setLayoutMode('functional');
    } else if (layoutMode === 'functional') {
      setLayoutMode('tinder');
    } else {
      setLayoutMode('regular');
    }
  };

  const handleScannedButtonClick = () => {
    setLayoutMode('tinder');
  };

  const scannedCount = scannedApartments.length;

  // If in tinder mode, show TinderMode component
  if (layoutMode === 'tinder') {
    return (
      <TinderMode 
        apartments={apartments} 
        scannedApartments={scannedApartments}
        mode={scannedCount > 0 ? 'scanned' : 'regular'}
        onLikeScanned={handleAddScannedApartment}
        onMorRatingChange={handleMorRatingChange} 
        onGabiRatingChange={handleGabiRatingChange} 
        isAuthenticated={isAuthenticated} 
      />
    );
  }

  return (
    <div className={`min-h-screen ${themeConfig.gradient} transition-all duration-500 p-8`}>
      <div className="max-w-7xl mx-auto">
        <ThemeHeader 
          onDrawingGameOpen={() => setIsDrawingGameOpen(true)}
          onCatGameOpen={() => setIsCatGameOpen(true)}
          onLayoutToggle={handleLayoutToggle}
          layoutMode={layoutMode}
        />

        {/* Scanned Apartments Button */}
        {scannedCount > 0 && (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleScannedButtonClick}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <span className="text-xl">🏠</span>
              דירות סרוקות ({scannedCount})
              <span className="text-xl animate-pulse">💕</span>
            </button>
          </div>
        )}

        <div className={layoutMode === 'functional' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'}>
          {/* Map */}
          <div className={layoutMode === 'functional' ? 'lg:col-span-1' : ''}>
            <Map 
              apartments={apartments}
              selectedApartmentId={selectedApartmentId}
              setSelectedApartmentId={setSelectedApartmentId}
              isCompact={layoutMode === 'functional'}
            />
          </div>

          {/* Form and Gallery */}
          <div className={layoutMode === 'functional' ? 'lg:col-span-1 space-y-6' : 'space-y-6'}>
            <ApartmentForm onAddApartment={handleAddApartment} uploadImage={uploadImage} />
            
            {/* Yad2 Scan Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setIsYad2ScanOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-full font-bold shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                🔍 סרוק דירות אוטומטית מ-Yad2
              </button>
            </div>

            <ApartmentGallery
              apartments={apartments}
              onDelete={handleDeleteApartment}
              onEdit={handleEditApartment}
              onMorRatingChange={handleMorRatingChange}
              onGabiRatingChange={handleGabiRatingChange}
              isAuthenticated={isAuthenticated}
              selectedApartmentId={selectedApartmentId}
              isCompact={layoutMode === 'functional'}
            />
          </div>
        </div>

        <EditApartmentDialog
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingApartment(null);
          }}
          apartment={editingApartment}
          onSave={handleSaveEdit}
          uploadImage={uploadImage}
        />

        <DrawingGame
          isOpen={isDrawingGameOpen}
          onClose={() => setIsDrawingGameOpen(false)}
        />

        <CatChaseGame
          isOpen={isCatGameOpen}
          onClose={() => setIsCatGameOpen(false)}
        />

        <Yad2ScanDialog
          open={isYad2ScanOpen}
          onOpenChange={setIsYad2ScanOpen}
          onScanComplete={() => {
            fetchScannedApartments();
          }}
        />
      </div>
    </div>
  );
};

export default Index;