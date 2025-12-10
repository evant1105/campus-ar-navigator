import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Navigation, Map, Clock, Building, ChevronRight, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import BottomNavigation from '@/components/BottomNavigation';
import LocationCard from '@/components/LocationCard';

const popularDestinations = [
  { id: 'lib', name: 'Library', icon: Building },
  { id: 'cafe', name: 'Cafeteria', icon: Building },
  { id: 'lt3', name: 'Lecture Theatre 3', icon: Building },
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-8 rounded-b-3xl">
        <h1 className="text-lg font-bold text-primary-foreground">
          MyCampus AR Wayfinder
        </h1>
        <p className="text-primary-foreground/80 text-sm mt-1">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Guest'}! 👋
        </p>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-4 space-y-4">
        {/* Quick Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/search')}
            variant="hero"
            className="w-full justify-start gap-3"
          >
            <Search className="w-5 h-5" />
            Search Destination
          </Button>

          <Button
            onClick={() => navigate('/ar')}
            variant="warning"
            className="w-full justify-start gap-3 h-14"
          >
            <Navigation className="w-5 h-5" />
            Start AR Navigation
          </Button>

          <Button
            onClick={() => navigate('/map')}
            variant="ghost"
            className="w-full justify-start gap-3 text-foreground font-semibold"
          >
            <Map className="w-5 h-5" />
            View Campus Map
          </Button>
        </div>

        {/* Next Class Card */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Next Class</span>
          </div>
          <h3 className="font-semibold text-foreground text-lg">
            UI/UX Design and Development
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            LT-5 • North Building • Level 4
          </p>
          <p className="text-sm text-muted-foreground">
            10:00 AM - 12:00 PM (in 45 mins)
          </p>
          <button className="flex items-center gap-1 text-primary text-sm font-medium mt-3 hover:underline">
            View Full Timetable
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Recent Places */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">Recent Places</h2>
          <div className="space-y-1">
            {recentPlaces.slice(0, 3).map((place) => (
              <LocationCard
                key={place.id}
                location={place}
                variant="recent"
                onClick={() => handleNavigateTo(place)}
              />
            ))}
          </div>
        </div>

        {/* Popular Destinations */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">Popular Destinations</h2>
          <div className="grid grid-cols-3 gap-3">
            {popularDestinations.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => navigate('/search')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground text-center">{name}</span>
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
