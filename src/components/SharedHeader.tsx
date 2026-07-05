import React from 'react';
import { Search, MapPin, ChevronDown, Shield, User, ArrowLeft } from 'lucide-react';

interface SharedHeaderProps {
  userName: string;
  userLocation: string;
  currentRole: 'admin' | 'veterinarian' | 'receptionist' | 'client';
  onExitRole: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onLocationChange?: (newLoc: string) => void;
}

const LOCATIONS = ['New York', 'Los Angeles', 'Chicago', 'Madrid', 'London', 'Tokyo'];

export default function SharedHeader({
  userName,
  userLocation,
  currentRole,
  onExitRole,
  searchQuery = '',
  onSearchChange,
  onLocationChange
}: SharedHeaderProps) {
  const [showLocationDropdown, setShowLocationDropdown] = React.useState(false);

  // Define role specific colors/badges for the avatar & sub-indicator
  const getRoleTheme = () => {
    switch (currentRole) {
      case 'admin':
        return {
          bg: 'from-amber-500 to-amber-600',
          border: 'border-amber-300',
          label: 'Admin',
          avatarBg: 'bg-amber-500 border-amber-300'
        };
      case 'veterinarian':
        return {
          bg: 'from-indigo-500 to-indigo-600',
          border: 'border-indigo-300',
          label: 'Veterinario',
          avatarBg: 'bg-indigo-500 border-indigo-350'
        };
      case 'receptionist':
        return {
          bg: 'from-pink-500 to-pink-650',
          border: 'border-pink-300',
          label: 'Recepción',
          avatarBg: 'bg-pink-500 border-pink-300'
        };
      case 'client':
        return {
          bg: 'from-cyan-500 to-teal-500',
          border: 'border-cyan-300',
          label: 'Cliente',
          avatarBg: 'bg-cyan-500 border-cyan-300'
        };
      default:
        return {
          bg: 'from-slate-500 to-slate-600',
          border: 'border-slate-300',
          label: 'Usuario',
          avatarBg: 'bg-white/20 border-white/40'
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className="bg-[#3db5d7] text-white rounded-b-[32px] shadow-md relative z-30 w-full transition-colors duration-300" id="shared-header-container">
      {/* Search, Name, Profile Bar */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-3 pb-4 sm:pt-4 sm:pb-5 flex items-center justify-between gap-4" id="header-top-bar">
        
        {/* Back Button and Zeebra Branding Group */}
        <div className="flex items-center space-x-3 shrink-0" id="header-logo-group">
          <button 
            onClick={onExitRole}
            className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/10 text-white text-[10px] sm:text-xs font-black transition-all duration-150 cursor-pointer whitespace-nowrap shadow-xs"
            id="btn-exit-role"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Volver</span>
          </button>

          {/* Direct, unencapsulated Logo for Zeebra */}
          <img 
            src="https://appdesign.appdesignproyectos.com/zeebra.png" 
            alt="Zeebra" 
            className="h-10 sm:h-12 w-auto object-contain animate-fade-in"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* User Info & Avatar - Fully Responsive */}
        <div className="flex items-center space-x-2 text-right shrink-0 ml-auto" id="header-profile-section">
          <div className="flex flex-col justify-center">
            {/* User Name */}
            <span className="text-[11px] sm:text-xs md:text-sm font-black tracking-tight leading-none block max-w-[100px] sm:max-w-[150px] truncate" id="user-name-text">
              {userName}
            </span>
            
            {/* Location Selector */}
            {onLocationChange ? (
              <div className="relative mt-1 self-end" id="location-selector-container">
                <button 
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="flex items-center space-x-0.5 text-[8.5px] sm:text-[10px] text-cyan-50/90 font-bold hover:text-white transition-colors cursor-pointer"
                  id="btn-location-dropdown"
                >
                  <MapPin className="h-2.5 w-2.5 text-cyan-200 fill-current" />
                  <span className="truncate max-w-[60px] sm:max-w-[85px]">{userLocation}</span>
                  <ChevronDown className="h-2 w-2 text-cyan-200" />
                </button>

                {showLocationDropdown && (
                  <div className="absolute right-0 mt-1.5 w-24 bg-white rounded-lg shadow-xl py-1 text-[10px] text-slate-800 border border-slate-100 z-50 overflow-hidden" id="location-dropdown-menu">
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          onLocationChange(loc);
                          setShowLocationDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 hover:bg-cyan-50 transition-colors ${userLocation === loc ? 'font-black text-cyan-600 bg-cyan-50/50' : ''}`}
                        id={`btn-loc-${loc.toLowerCase().replace(' ', '-')}`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-0.5 text-[8.5px] sm:text-[10px] text-cyan-50/90 font-bold justify-end mt-0.5">
                <MapPin className="h-2.5 w-2.5 text-cyan-200 fill-current" />
                <span className="truncate max-w-[60px] sm:max-w-[85px]">{userLocation}</span>
              </div>
            )}
          </div>

          {/* Profile Avatar Frame */}
          <div className={`w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-full flex items-center justify-center text-white cursor-pointer transition-all shadow-inner overflow-hidden border ${theme.avatarBg}`} id="profile-avatar">
            {currentRole === 'admin' ? (
              <>
                <img 
                  src="blob:https://gemini.google.com/a6922b06-a9ae-4f9e-bb5c-0cb1e21c2d40" 
                  alt="Admin Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.getElementById('admin-shield-fallback-header');
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div id="admin-shield-fallback-header" className="hidden">
                  <Shield className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white" />
                </div>
              </>
            ) : (
              <User className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
