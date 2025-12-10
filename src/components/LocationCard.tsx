import React from 'react';
import { MapPin, Clock, Building } from 'lucide-react';
import { Location } from '@/contexts/NavigationContext';
import { cn } from '@/lib/utils';

interface LocationCardProps {
  location: Location;
  variant?: 'default' | 'compact' | 'recent';
  onClick?: () => void;
  showIcon?: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  variant = 'default',
  onClick,
  showIcon = true,
}) => {
  const getCategoryIcon = () => {
    switch (location.category) {
      case 'class':
        return <Building className="w-5 h-5" />;
      case 'cafe':
        return <Building className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:bg-accent/50 active:scale-[0.98] transition-all text-left w-full shadow-sm"
      >
        {showIcon && (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
            {getCategoryIcon()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base text-foreground truncate mb-0.5">{location.name}</p>
          <p className="text-sm text-muted-foreground truncate">{location.building}</p>
        </div>
      </button>
    );
  }

  if (variant === 'recent') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-4 py-4 px-2 hover:bg-accent/30 rounded-xl active:bg-accent/50 transition-colors text-left w-full"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base text-foreground truncate mb-0.5">{location.name}</p>
          <p className="text-sm text-muted-foreground truncate">{location.building}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-5 p-5 rounded-2xl bg-card border border-border shadow-sm",
        "hover:bg-accent/40 hover:shadow-md hover:border-primary/20 active:scale-[0.98] transition-all duration-200 text-left w-full"
      )}
    >
      {showIcon && (
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          {getCategoryIcon()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-lg text-foreground mb-1">{location.name}</h4>
        <div className="flex items-center text-muted-foreground text-sm">
          <span className="truncate">{location.building}</span>
          <span className="mx-2 text-border">•</span>
          <span className="font-medium bg-muted px-2 py-0.5 rounded-md text-xs">{location.floor}</span>
        </div>
      </div>
    </button>
  );
};

export default LocationCard;
