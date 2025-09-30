// FIX: Changed React import from namespace import ('* as React') to default import ('React') to resolve widespread JSX intrinsic element type errors. The default import is standard with modern TypeScript/React configurations and should restore the correct JSX type definitions.
import React from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeScreen from './components/HomeScreen';
import BookingScreen from './components/BookingScreen';
import MapScreen from './components/MapScreen';
import EmergencyScreen from './components/EmergencyScreen';
import YatraScreen from './components/YatraScreen';
import FamilyConnectScreen from './components/FamilyConnectScreen';
import HelpModal from './components/HelpModal';
import { View, Temple } from './types';
import { TEMPLES } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = React.useState<View>(View.Home);
  const [selectedTemple, setSelectedTemple] = React.useState<Temple>(TEMPLES[0]);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [isHelpModalOpen, setHelpModalOpen] = React.useState(false);
  const [poiToHighlight, setPoiToHighlight] = React.useState<string | null>(null);
  const [yatraInitialTab, setYatraInitialTab] = React.useState<'journey' | 'history'>('journey');

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleNavigate = (poiId: string) => {
    setPoiToHighlight(poiId);
    setCurrentView(View.Map);
    setHelpModalOpen(false);
  };

  const handleBooking = () => {
    setCurrentView(View.Booking);
    setHelpModalOpen(false);
  };

  const handleViewHistory = () => {
    setYatraInitialTab('history');
    setCurrentView(View.Yatra);
    setHelpModalOpen(false);
  };

  const handleNavigateToView = (view: string) => {
    switch (view) {
      case 'FamilyConnect':
        setCurrentView(View.FamilyConnect);
        break;
      case 'Booking':
        setCurrentView(View.Booking);
        break;
      case 'Map':
        setCurrentView(View.Map);
        break;
      case 'Emergency':
        setCurrentView(View.Emergency);
        break;
      case 'Calendar':
        setCurrentView(View.Calendar);
        break;
      case 'Yatra':
        setCurrentView(View.Yatra);
        break;
      default:
        console.warn(`Unknown view: ${view}`);
        break;
    }
    setHelpModalOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case View.Home:
        return <HomeScreen
                  isOnline={isOnline}
                  onNavigate={handleNavigateToView}
                  selectedTemple={selectedTemple}
                  onTempleChange={setSelectedTemple}
                />;
      case View.Booking:
        return <BookingScreen isOnline={isOnline} />;
      case View.FamilyConnect:
        return <FamilyConnectScreen />;
      case View.Map:
        return <MapScreen 
                  highlightPOI={poiToHighlight} 
                  onHighlightDone={() => setPoiToHighlight(null)}
                />;
      case View.Calendar:
        return <HomeScreen
                  isOnline={isOnline}
                  onNavigate={handleNavigateToView}
                  selectedTemple={selectedTemple}
                  onTempleChange={setSelectedTemple}
                />;
      case View.Emergency:
        return <EmergencyScreen />;
      case View.Yatra:
        return <YatraScreen 
                  onNavigate={handleNavigate}
                  initialTab={yatraInitialTab}
                />;
      default:
        return <HomeScreen
                  isOnline={isOnline}
                  onNavigate={handleNavigateToView}
                  selectedTemple={selectedTemple}
                  onTempleChange={setSelectedTemple}
                />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-100 font-sans p-0 sm:p-4">
      <div className={`relative w-full max-w-7xl mx-auto bg-white shadow-2xl flex flex-col overflow-hidden h-screen sm:h-[calc(100vh-2rem)] sm:rounded-3xl sm:border border-orange-200 transition-all duration-300`}>
        <Header 
          selectedTemple={selectedTemple} 
          setSelectedTemple={setSelectedTemple}
          isOnline={isOnline}
        />
        <main className="flex-grow overflow-y-auto custom-scrollbar p-3 sm:p-6 transition-all duration-300 ease-in-out bg-gradient-to-b from-orange-50/30 to-white">
          <div className="animate-fade-in">
            {renderView()}
          </div>
        </main>
        <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
        
        {/* Enhanced AI Assistant FAB */}
        <button
          onClick={() => setHelpModalOpen(true)}
          className="fixed bottom-24 sm:bottom-28 right-4 sm:right-6 z-20 bg-gradient-to-br from-orange-500 to-amber-600 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-orange-500/30 group"
          aria-label="Open AI Help Assistant"
        >
          <iconify-icon icon="material-symbols:chat" className="text-xl sm:text-2xl group-hover:animate-bounce-gentle"></iconify-icon>
          
          {/* Subtle pulse ring effect */}
          <div className="absolute inset-0 rounded-full bg-orange-400 opacity-20 animate-ping"></div>
        </button>

        {isHelpModalOpen && (
          <HelpModal 
            isOnline={isOnline} 
            closeModal={() => setHelpModalOpen(false)} 
            onNavigate={handleNavigate}
            onBooking={handleBooking}
            onViewHistory={handleViewHistory}
          />
        )}
      </div>
    </div>
  );
};

export default App;