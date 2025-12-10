import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Mic, X, MapPin, Building, Coffee, Briefcase, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigation, Location } from '@/contexts/NavigationContext';
import BottomNavigation from '@/components/BottomNavigation';
import { cn } from '@/lib/utils';

const allLocations: Location[] = [
  { id: '1', name: 'Library Level 2', building: 'South Building', floor: 'L2', category: 'other' },
  { id: '2', name: 'Cafeteria A', building: 'Main Building', floor: 'G', category: 'cafe' },
  { id: '3', name: 'Lab 4-B', building: 'East Building', floor: 'L4', category: 'lab' },
  { id: '4', name: 'UW-3-3', building: 'University Building', floor: 'L2', category: 'class' },
  { id: '5', name: 'Hall 2', building: 'North Building', floor: 'G', category: 'other' },
  { id: '6', name: 'JC Hall 1', building: 'University Building', floor: 'L1', category: 'other' },
  { id: '7', name: 'Lecture Theatre 3', building: 'Main Building', floor: 'L3', category: 'class' },
  { id: '8', name: 'Student Services', building: 'Admin Building', floor: 'G', category: 'office' },
  { id: '9', name: 'Computer Lab 1', building: 'Tech Building', floor: 'L2', category: 'lab' },
  { id: '10', name: 'Starbucks', building: 'Main Building', floor: 'G', category: 'cafe' },
];

const categories = [
  { id: 'all', label: 'All', icon: MapPin },
  { id: 'class', label: 'Classes', icon: GraduationCap },
  { id: 'lab', label: 'Labs', icon: Building },
  { id: 'office', label: 'Offices', icon: Briefcase },
  { id: 'cafe', label: 'Cafe', icon: Coffee },
];

const Search: React.FC = () => {
  const navigate = useNavigate();
  const { setDestination, addToRecent } = useNavigation();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredLocations = allLocations.filter((location) => {
    const matchesQuery = location.name.toLowerCase().includes(query.toLowerCase()) ||
                        location.building.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'all' || location.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  const handleSelectLocation = (location: Location) => {
    setDestination(location);
    addToRecent(location);
    navigate('/ar');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'class': return <GraduationCap className="w-4 h-4" />;
      case 'lab': return <Building className="w-4 h-4" />;
      case 'office': return <Briefcase className="w-4 h-4" />;
      case 'cafe': return <Coffee className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
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
          <h1 className="font-semibold text-foreground">Search Destination</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a place..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-20 h-12"
            autoFocus
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button className="text-muted-foreground hover:text-foreground">
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeCategory === id
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-4">
        <p className="text-sm text-muted-foreground mb-3">
          {filteredLocations.length} results found
        </p>
        <div className="space-y-2">
          {filteredLocations.map((location) => (
            <button
              key={location.id}
              onClick={() => handleSelectLocation(location)}
              className="flex items-center gap-4 w-full p-4 bg-card rounded-xl border border-border hover:bg-muted/50 hover:border-primary/20 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {getCategoryIcon(location.category)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{location.name}</p>
                <p className="text-sm text-muted-foreground">
                  {location.building} • {location.floor}
                </p>
              </div>
            </button>
          ))}
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">No locations found</p>
            <p className="text-sm text-muted-foreground">Try a different search term</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Search;
