import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Mic, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import BottomNavigation from '@/components/BottomNavigation';

const categories = ['All', 'Classes', 'Labs', 'Offices', 'Cafe'];

const floors = [
  'L12', 'L11', 'L10', 'L9', 'L8', 'L7', 'L6', 'L5', 'L4', 'L3', 'L2', 'L1',
  'M2', 'M1', 'G', 'LG', 'LG2'
];

const CampusMap: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFloor, setActiveFloor] = useState('G');
  const [zoom, setZoom] = useState(1);

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
          <h1 className="font-semibold text-foreground">2D Map</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-12"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeCategory === category
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Location Info */}
      <div className="px-4 pb-3">
        <p className="text-sm text-muted-foreground">Location</p>
        <p className="font-medium text-foreground flex items-center gap-1">
          <span className="text-primary">📍</span>
          Uni Foyer, G Floor, University Building
        </p>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 mx-4 mb-4 bg-card rounded-2xl border border-border overflow-hidden" style={{ height: 'calc(100vh - 340px)' }}>
        {/* Zoom Controls */}
        <div className="absolute top-4 right-16 z-10 flex flex-col gap-2">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.25, 2))}
            className="w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
            className="w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {/* Floor Selector */}
        <div className="absolute top-4 right-4 z-10 bg-card border border-border rounded-xl shadow-md overflow-hidden max-h-80 overflow-y-auto">
          {floors.map((floor) => (
            <button
              key={floor}
              onClick={() => setActiveFloor(floor)}
              className={cn(
                "w-10 h-8 flex items-center justify-center text-xs font-medium transition-colors",
                activeFloor === floor
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              )}
            >
              {floor}
            </button>
          ))}
        </div>

        {/* Map Content (Simplified floor plan) */}
        <div 
          className="w-full h-full p-4 overflow-auto"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          <svg viewBox="0 0 400 300" className="w-full h-full">
            {/* Floor Plan Outline */}
            <rect x="20" y="20" width="360" height="260" fill="none" stroke="hsl(var(--border))" strokeWidth="2" rx="8"/>
            
            {/* Rooms */}
            <rect x="40" y="40" width="80" height="60" fill="hsl(var(--muted))" stroke="hsl(var(--border))" rx="4"/>
            <text x="80" y="75" textAnchor="middle" className="text-xs fill-foreground">Security</text>
            
            <rect x="140" y="40" width="100" height="80" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" rx="4"/>
            <text x="190" y="85" textAnchor="middle" className="text-xs fill-primary font-medium">You are here</text>
            
            <rect x="260" y="40" width="100" height="60" fill="hsl(var(--muted))" stroke="hsl(var(--border))" rx="4"/>
            <text x="310" y="75" textAnchor="middle" className="text-xs fill-foreground">Lab 4-A</text>
            
            <rect x="40" y="140" width="120" height="100" fill="hsl(var(--accent) / 0.2)" stroke="hsl(var(--accent))" rx="4"/>
            <text x="100" y="195" textAnchor="middle" className="text-xs fill-accent-foreground font-medium">Fresco</text>
            
            <rect x="180" y="160" width="80" height="80" fill="hsl(var(--muted))" stroke="hsl(var(--border))" rx="4"/>
            <text x="220" y="205" textAnchor="middle" className="text-xs fill-foreground">Stairs</text>
            
            <rect x="280" y="140" width="80" height="100" fill="hsl(var(--muted))" stroke="hsl(var(--border))" rx="4"/>
            <text x="320" y="195" textAnchor="middle" className="text-xs fill-foreground">Lift</text>
            
            {/* Navigation Arrow */}
            <g transform="translate(170, 100)">
              <path d="M0 20 L10 0 L20 20 L10 15 Z" fill="hsl(var(--warning))" />
              <text x="10" y="35" textAnchor="middle" className="text-[8px] fill-foreground font-bold">YOU</text>
            </g>
          </svg>
        </div>

        {/* 3D Toggle */}
        <button className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors">
          <Compass className="w-6 h-6" />
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CampusMap;
