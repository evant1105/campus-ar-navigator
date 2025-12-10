import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Navigation, Map, Building, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import BottomNavigation from '@/components/BottomNavigation';
import LocationCard from '@/components/LocationCard';

const popularDestinations = [
  { id: 'lib', name: 'Library', icon: Building },
  { id: 'cafe', name: 'Cafeteria', icon: Building },
  { id: 'lt3', name: 'Lecture Hall', icon: Building },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recentPlaces, setDestination } = useNavigation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleNavigateTo = (location: typeof recentPlaces[0]) => {
    setDestination(location);
    navigate('/ar');
  };

  return (
    <div className="min-h-screen bg-background pb-28 mobile-container">
      {/* Expanded Header */}
      <div className="bg-primary px-6 pt-16 pb-12 rounded-b-[2.5rem] shadow-lg relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium mb-1">
              {getGreeting()}
            </p>
            <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">
              {user?.name?.split(' ')[0] || 'Guest'}! 👋
            </h1>
          </div>
          {user?.avatar && (
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30" />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 -mt-6 relative z-20 space-y-8">
        
        {/* Search & Actions Card */}
        <div className="bg-card rounded-3xl p-2 shadow-xl shadow-black/5 border border-border/50">
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/search')}
              variant="ghost"
              className="w-full justify-start gap-3 h-14 px-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-2xl"
            >
              <Search className="w-5 h-5" />
              <span className="text-base font-normal">Search Destination...</span>
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => navigate('/ar')}
                className="w-full justify-center gap-2 h-14 rounded-2xl font-semibold shadow-md active:scale-95 transition-all"
                variant="default"
              >
                <Navigation className="w-5 h-5 fill-current" />
                AR Nav
              </Button>

              <Button
                onClick={() => navigate('/map')}
                variant="secondary"
                className="w-full justify-center gap-2 h-14 rounded-2xl font-semibold bg-secondary hover:bg-secondary/80 active:scale-95 transition-all"
              >
                <Map className="w-5 h-5" />
                Map View
              </Button>
            </div>
          </div>
        </div>

        {/* Next Class */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-lg text-foreground">Up Next</h2>
            <Button variant="link" className="text-primary h-auto p-0 font-semibold text-sm">
              See All
            </Button>
          </div>
          
          <div className="bg-gradient-to-br from-card to-secondary/30 rounded-3xl border border-border/60 p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" />
            
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              In 45 mins
            </div>
            
            <h3 className="font-bold text-foreground text-xl mb-1 leading-tight">
              UI/UX Design
            </h3>
            <p className="text-base text-muted-foreground mb-4">
              Lecture Theatre 5 • North Building
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <p className="text-sm font-medium text-foreground">10:00 AM - 12:00 PM</p>
              <button className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Places */}
        <div className="space-y-2">
          <h2 className="font-bold text-lg text-foreground px-1">Recent</h2>
          <div className="space-y-3">
            {recentPlaces.slice(0, 3).map((place) => (
              <LocationCard
                key={place.id}
                location={place}
                variant="default"
                onClick={() => handleNavigateTo(place)}
              />
            ))}
          </div>
        </div>

        {/* Quick Categories */}
        <div className="pb-4">
          <h2 className="font-bold text-lg text-foreground mb-4 px-1">Explore</h2>
          <div className="grid grid-cols-3 gap-4">
            {popularDestinations.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => navigate('/search')}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:bg-accent/50 active:scale-95 transition-all shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground text-center">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Home;
