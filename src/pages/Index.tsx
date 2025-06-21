
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, Music, Gamepad2, LogIn, UserPlus } from 'lucide-react';
import ApartmentCard from '@/components/ApartmentCard';
import EditApartmentDialog from '@/components/EditApartmentDialog';
import ApartmentForm from '@/components/ApartmentForm';
import TinderMode from '@/components/TinderMode';
import Yad2ScanDialog from '@/components/Yad2ScanDialog';
import CatGame from '@/components/CatGame';
import DrawingGame from '@/components/DrawingGame';
import AdvancedPiano from '@/components/AdvancedPiano';
import ThemeHeader from '@/components/ThemeHeader';
import { useApartments } from '@/hooks/useApartments';
import { useScannedApartments } from '@/hooks/useScannedApartments';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const [editingApartment, setEditingApartment] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [tinderMode, setTinderMode] = useState<'regular' | 'scanned'>('regular');
  const [showYad2Dialog, setShowYad2Dialog] = useState(false);
  const [showCatGame, setShowCatGame] = useState(false);
  const [showDrawingGame, setShowDrawingGame] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  
  const { isAuthenticated, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  const {
    apartments,
    loading: apartmentsLoading,
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
    deleteScanned,
    refreshScanned
  } = useScannedApartments();

  // Public features available to everyone
  const publicFeatures = (
    <div className="space-y-8">
      <ThemeHeader 
        onDrawingGameOpen={() => setShowDrawingGame(true)}
        onCatGameOpen={() => setShowCatGame(true)}
        onLayoutToggle={() => setLayoutMode(prev => prev === 'grid' ? 'list' : 'grid')}
        layoutMode={layoutMode}
      />
      
      {/* Music Feature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            פסנתר
          </CardTitle>
          <CardDescription>
            נגן מוזיקה עם הפסנתר הווירטואלי
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedPiano />
        </CardContent>
      </Card>

      {/* Games Feature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            משחקים
          </CardTitle>
          <CardDescription>
            משחקים מהנים לזוג
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cat" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cat">משחק החתול</TabsTrigger>
              <TabsTrigger value="drawing">משחק ציור</TabsTrigger>
            </TabsList>
            <TabsContent value="cat">
              <CatGame isOpen={showCatGame} onClose={() => setShowCatGame(false)} />
            </TabsContent>
            <TabsContent value="drawing">
              <DrawingGame isOpen={showDrawingGame} onClose={() => setShowDrawingGame(false)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Authentication Call to Action */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Heart className="h-6 w-6 text-pink-500" />
            התחל לחפש דירה עם בן/בת הזוג שלך
          </CardTitle>
          <CardDescription>
            התחבר או הירשם כדי לגשת לכל התכונות של מערכת חיפוש הדירות
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 justify-center">
          <Button 
            onClick={() => navigate('/auth')} 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <LogIn className="h-4 w-4 mr-2" />
            התחבר
          </Button>
          <Button 
            onClick={() => navigate('/auth')} 
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            הירשם
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-pink-500 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  // Show public features if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          {publicFeatures}
        </div>
      </div>
    );
  }

  // Authenticated user content
  const handleEditApartment = (apartment) => {
    setEditingApartment(apartment);
  };

  const handleDeleteApartment = (apartmentId) => {
    deleteApartment(apartmentId);
  };

  const handleSaveApartment = async (apartmentData) => {
    if (editingApartment) {
      await updateApartment(editingApartment.id, apartmentData);
      setEditingApartment(null);
    } else {
      // Add couple_id to new apartments
      const dataWithCouple = {
        ...apartmentData,
        couple_id: profile?.couple_id || null
      };
      await addApartment(dataWithCouple);
      setShowAddForm(false);
    }
  };

  const handleMorRatingChange = (apartmentId, rating) => {
    updateMorRating(apartmentId, rating);
  };

  const handleGabiRatingChange = (apartmentId, rating) => {
    updateGabiRating(apartmentId, rating);
  };

  const handleLikeScanned = async (apartment) => {
    await likeScannedApartment(apartment);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto p-4">
        <ThemeHeader 
          onDrawingGameOpen={() => setShowDrawingGame(true)}
          onCatGameOpen={() => setShowCatGame(true)}
          onLayoutToggle={() => setLayoutMode(prev => prev === 'grid' ? 'list' : 'grid')}
          layoutMode={layoutMode}
        />
        
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="grid">רשימת דירות</TabsTrigger>
            <TabsTrigger value="tinder">מצב טינדר</TabsTrigger>
            <TabsTrigger value="scanned">דירות סרוקות</TabsTrigger>
            <TabsTrigger value="piano">פסנתר</TabsTrigger>
            <TabsTrigger value="games">משחקים</TabsTrigger>
            <TabsTrigger value="add">הוספת דירה</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-purple-800">הדירות שלנו</h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowYad2Dialog(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  סריקת Yad2
                </Button>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  הוסף דירה חדשה
                </Button>
              </div>
            </div>
            
            {apartmentsLoading ? (
              <div className="text-center py-8">
                <p>טוען דירות...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apartments.map((apartment) => (
                  <ApartmentCard
                    key={apartment.id}
                    apartment={apartment}
                    onEdit={handleEditApartment}
                    onDelete={handleDeleteApartment}
                    onMorRatingChange={handleMorRatingChange}
                    onGabiRatingChange={handleGabiRatingChange}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tinder" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-purple-800">מצב טינדר</h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setTinderMode('regular')}
                  variant={tinderMode === 'regular' ? 'default' : 'outline'}
                >
                  דירות רגילות
                </Button>
                <Button
                  onClick={() => setTinderMode('scanned')}
                  variant={tinderMode === 'scanned' ? 'default' : 'outline'}
                >
                  דירות סרוקות
                </Button>
              </div>
            </div>
            
            <TinderMode
              apartments={apartments}
              scannedApartments={scannedApartments}
              onMorRatingChange={handleMorRatingChange}
              onGabiRatingChange={handleGabiRatingChange}
              onLikeScanned={handleLikeScanned}
              onDeleteScanned={deleteScanned}
              isAuthenticated={isAuthenticated}
              mode={tinderMode}
            />
          </TabsContent>

          <TabsContent value="scanned" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-purple-800">דירות סרוקות</h2>
              <Button
                onClick={() => setShowYad2Dialog(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                סריקת Yad2
              </Button>
            </div>
            
            {scannedLoading ? (
              <div className="text-center py-8">
                <p>טוען דירות סרוקות...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scannedApartments.map((apartment) => (
                  <div key={apartment.id} className="bg-white rounded-lg p-4 shadow-md">
                    <h3 className="font-bold text-lg mb-2">{apartment.title}</h3>
                    <p className="text-gray-600 mb-2">{apartment.description}</p>
                    <p className="text-purple-600 font-semibold">₪{apartment.price?.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{apartment.location}</p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleLikeScanned(apartment)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        הוסף לרשימה
                      </Button>
                      <Button
                        onClick={() => deleteScanned(apartment.id)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        מחק
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="piano">
            <AdvancedPiano />
          </TabsContent>

          <TabsContent value="games">
            <Tabs defaultValue="cat" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cat">משחק החתול</TabsTrigger>
                <TabsTrigger value="drawing">משחק ציור</TabsTrigger>
              </TabsList>
              <TabsContent value="cat">
                <CatGame isOpen={showCatGame} onClose={() => setShowCatGame(false)} />
              </TabsContent>
              <TabsContent value="drawing">
                <DrawingGame isOpen={showDrawingGame} onClose={() => setShowDrawingGame(false)} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="add">
            <ApartmentForm
              apartment={null}
              onSave={handleSaveApartment}
              onCancel={() => setShowAddForm(false)}
              uploadImage={uploadImage}
            />
          </TabsContent>
        </Tabs>

        {showAddForm && (
          <ApartmentForm
            apartment={null}
            onSave={handleSaveApartment}
            onCancel={() => setShowAddForm(false)}
            uploadImage={uploadImage}
          />
        )}

        {editingApartment && (
          <EditApartmentDialog
            apartment={editingApartment}
            isOpen={!!editingApartment}
            onClose={() => setEditingApartment(null)}
            onSave={handleSaveApartment}
            uploadImage={uploadImage}
          />
        )}

        <Yad2ScanDialog
          open={showYad2Dialog}
          onOpenChange={setShowYad2Dialog}
          onScanComplete={async () => {
            await refreshScanned();
            setShowYad2Dialog(false);
          }}
        />
      </div>
    </div>
  );
};

export default Index;
