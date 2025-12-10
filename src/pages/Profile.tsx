import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, ChevronRight, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import BottomNavigation from '@/components/BottomNavigation';
import LocationCard from '@/components/LocationCard';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { savedPlaces, recentPlaces, setDestination } = useNavigation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigateTo = (location: typeof savedPlaces[0]) => {
    setDestination(location);
    navigate('/ar');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-foreground">Profile & Settings</h1>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xl font-bold">
            {user?.name?.charAt(0) || 'G'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">{user?.name || 'Guest User'}</h2>
            <p className="text-sm text-muted-foreground">Student ID: {user?.studentId || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">{user?.department || 'Visitor'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Saved Places */}
      <div className="px-4 mb-6">
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-foreground">Saved Places</h3>
          </div>
          <div className="space-y-1 divide-y divide-border">
            {savedPlaces.slice(0, 3).map((place) => (
              <div key={place.id} className="py-3 first:pt-0">
                <button
                  onClick={() => handleNavigateTo(place)}
                  className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{place.name}</p>
                    <p className="text-sm text-muted-foreground">{place.building}</p>
                  </div>
                </button>
              </div>
            ))}
          </div>
          <button className="flex items-center gap-1 text-primary text-sm font-medium mt-3 hover:underline">
            View All Saved Places
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent Destinations */}
      <div className="px-4 mb-6">
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Recent Destinations</h3>
          </div>
          <div className="space-y-1 divide-y divide-border">
            {recentPlaces.slice(0, 2).map((place) => (
              <div key={place.id} className="py-3 first:pt-0">
                <button
                  onClick={() => handleNavigateTo(place)}
                  className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{place.name}</p>
                    <p className="text-sm text-muted-foreground">{place.building}</p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help & FAQ */}
      <div className="px-4">
        <button className="flex items-center gap-3 w-full p-4 bg-card rounded-2xl border border-border hover:bg-muted/50 transition-colors">
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium text-foreground">Help & FAQ</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
