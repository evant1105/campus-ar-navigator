import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Location {
  id: string;
  name: string;
  building: string;
  floor: string;
  category: 'class' | 'lab' | 'office' | 'cafe' | 'other';
  coordinates?: { x: number; y: number };
}

interface NavigationContextType {
  destination: Location | null;
  setDestination: (location: Location | null) => void;
  recentPlaces: Location[];
  savedPlaces: Location[];
  addToRecent: (location: Location) => void;
  toggleSaved: (location: Location) => void;
  isNavigating: boolean;
  setIsNavigating: (value: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const defaultSavedPlaces: Location[] = [
  { id: '1', name: 'Library Level 2', building: 'South Building', floor: 'L2', category: 'other' },
  { id: '2', name: 'Cafeteria A', building: 'Main Building', floor: 'G', category: 'cafe' },
  { id: '3', name: 'Lab 4-B', building: 'East Building', floor: 'L4', category: 'lab' },
];

const defaultRecentPlaces: Location[] = [
  { id: '4', name: 'UW-3-3', building: 'University Building', floor: 'L2', category: 'class' },
  { id: '5', name: 'Hall 2', building: 'North Building', floor: 'G', category: 'other' },
  { id: '6', name: 'JC Hall 1', building: 'University Building', floor: 'L1', category: 'other' },
];

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [destination, setDestination] = useState<Location | null>(null);
  const [recentPlaces, setRecentPlaces] = useState<Location[]>(defaultRecentPlaces);
  const [savedPlaces, setSavedPlaces] = useState<Location[]>(defaultSavedPlaces);
  const [isNavigating, setIsNavigating] = useState(false);

  const addToRecent = (location: Location) => {
    setRecentPlaces(prev => {
      const filtered = prev.filter(p => p.id !== location.id);
      return [location, ...filtered].slice(0, 10);
    });
  };

  const toggleSaved = (location: Location) => {
    setSavedPlaces(prev => {
      const exists = prev.find(p => p.id === location.id);
      if (exists) {
        return prev.filter(p => p.id !== location.id);
      }
      return [...prev, location];
    });
  };

  return (
    <NavigationContext.Provider value={{
      destination,
      setDestination,
      recentPlaces,
      savedPlaces,
      addToRecent,
      toggleSaved,
      isNavigating,
      setIsNavigating,
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
