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
        return <Building className="w-4 h-4" />;
      case 'cafe':
        return <Building className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors text-left w-full"
      >
        {showIcon && (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            {getCategoryIcon()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{location.name}</p>
          <p className="text-sm text-muted-foreground truncate">{location.building}</p>
        </div>
      </button>
    );
  }

  if (variant === 'recent') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-3 py-3 hover:bg-muted/30 transition-colors text-left w-full"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{location.name}</p>
          <p className="text-sm text-muted-foreground truncate">{location.building}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl bg-card border border-border",
        "hover:bg-muted/50 hover:border-primary/20 transition-all text-left w-full"
      )}
    >
      {showIcon && (
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {getCategoryIcon()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{location.name}</p>
        <p className="text-sm text-muted-foreground">{location.building} • {location.floor}</p>
      </div>
    </button>
  );
};

export default LocationCard;
