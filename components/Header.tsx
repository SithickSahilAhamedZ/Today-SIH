// FIX: Changed React import from namespace import ('* as React') to default import ('React') to resolve widespread JSX intrinsic element type errors. The default import is standard with modern TypeScript/React configurations and should restore the correct JSX type definitions.
import React from 'react';
import { Icon } from '@iconify/react';
import { Temple } from '../types';
import { TEMPLES } from '../constants';

interface HeaderProps {
  selectedTemple: Temple;
  setSelectedTemple: (temple: Temple) => void;
  isOnline?: boolean;
}

// Fix: Create the Header component to resolve the module not found error.
const Header: React.FC<HeaderProps> = ({ selectedTemple, setSelectedTemple, isOnline = true }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleSelectTemple = (temple: Temple) => {
    setSelectedTemple(temple);
    setDropdownOpen(false);
  };

  return (
    <header className="relative bg-gradient-to-r from-amber-50 to-orange-50 backdrop-blur-sm p-4 border-b border-orange-200 shadow-sm rounded-t-3xl flex-shrink-0">
      {!isOnline && (
        <div className="bg-red-500 text-white text-center py-2 px-4 text-sm font-medium rounded-lg mb-3 animate-slide-up">
          <Icon icon="material-symbols:wifi-off" className="inline mr-2 text-lg" />
          You are offline - Some features may be limited
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
              <Icon icon="material-symbols:temple-hindu" className="text-white text-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-800 truncate">{selectedTemple.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Icon icon="material-symbols:location-on" className="text-orange-500 text-sm flex-shrink-0" />
                <p className="text-sm text-gray-600 truncate">{selectedTemple.location}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status indicators and controls */}
        <div className="flex items-center gap-3 ml-4">
          {/* Online/Offline indicator */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
            isOnline 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-500 animate-bounce-gentle' : 'bg-red-500'
            }`}></div>
            <span className="hidden sm:inline">{isOnline ? 'Live' : 'Offline'}</span>
          </div>
          
          {/* Temple selector dropdown */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="card-interactive p-2 rounded-xl hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all duration-200"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              aria-label="Select temple"
            >
              <Icon icon="material-symbols:tune" className="text-gray-600 text-xl" />
            </button>
            
            {dropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setDropdownOpen(false)}
                ></div>
                
                {/* Dropdown menu */}
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl z-20 border border-gray-100 animate-slide-up"
                  role="menu"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
                      Select Temple
                    </div>
                    <div className="mt-2 space-y-1">
                      {TEMPLES.map(temple => (
                        <button
                          key={temple.id}
                          onClick={() => handleSelectTemple(temple)}
                          className={`w-full text-left px-3 py-3 text-sm rounded-xl transition-all duration-200 flex items-center gap-3 ${
                            temple.id === selectedTemple.id
                              ? 'bg-orange-100 text-orange-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          role="menuitem"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            temple.id === selectedTemple.id
                              ? 'bg-orange-200 text-orange-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon icon="material-symbols:temple-hindu" className="text-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{temple.name}</div>
                            <div className="text-xs text-gray-500 truncate">{temple.location}</div>
                          </div>
                          {temple.id === selectedTemple.id && (
                            <Icon icon="material-symbols:check-circle" className="text-orange-500 text-lg flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;