// FIX: Changed React import from namespace import ('* as React') to default import ('React') to resolve widespread JSX intrinsic element type errors. The default import is standard with modern TypeScript/React configurations and should restore the correct JSX type definitions.
import React from 'react';
import { Icon } from '@iconify/react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={`relative flex flex-col items-center justify-center w-1/5 h-full transition-all duration-300 hover:scale-105 focus:outline-none group ${
        isActive ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'
      }`}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute top-0 h-1 w-8 bg-gradient-to-r from-orange-400 to-amber-500 rounded-b-full animate-slide-up shadow-sm"></span>
      )}
      
      {/* Icon container with background effect */}
      <div className={`relative p-2 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-br from-orange-100 to-amber-100 shadow-sm' 
          : 'group-hover:bg-orange-50'
      }`}>
        <Icon 
          icon={icon} 
          className={`text-2xl transition-all duration-300 ${
            isActive ? 'scale-110' : 'group-hover:scale-105'
          }`}
        />
        
        {/* Subtle glow effect for active item */}
        {isActive && (
          <div className="absolute inset-0 bg-orange-200 rounded-xl blur-sm opacity-30 -z-10 animate-bounce-gentle"></div>
        )}
      </div>
      
      {/* Label with enhanced typography */}
      <span className={`text-xs mt-1 transition-all duration-300 ${
        isActive 
          ? 'font-semibold text-orange-700' 
          : 'font-medium group-hover:font-semibold'
      }`}>
        {label}
      </span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="h-20 bg-white/95 backdrop-blur-md border-t border-orange-100 flex justify-around items-center shadow-[0_-4px_20px_-4px_rgba(251,146,60,0.15)] rounded-b-3xl flex-shrink-0 relative">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-50/30 to-transparent rounded-b-3xl"></div>
      
      <NavItem
        icon="solar:home-smile-bold-duotone"
        label="Home"
        isActive={currentView === View.Home}
        onClick={() => setCurrentView(View.Home)}
      />
      <NavItem
        icon="solar:ticket-bold-duotone"
        label="Booking"
        isActive={currentView === View.Booking}
        onClick={() => setCurrentView(View.Booking)}
      />
      <NavItem
        icon="solar:users-group-rounded-bold-duotone"
        label="Family"
        isActive={currentView === View.FamilyConnect}
        onClick={() => setCurrentView(View.FamilyConnect)}
      />
      <NavItem
        icon="solar:map-bold-duotone"
        label="Map"
        isActive={currentView === View.Map}
        onClick={() => setCurrentView(View.Map)}
      />
      <NavItem
        icon="solar:compass-bold-duotone"
        label="My Yatra"
        isActive={currentView === View.Yatra}
        onClick={() => setCurrentView(View.Yatra)}
      />
    </nav>
  );
};

export default BottomNav;