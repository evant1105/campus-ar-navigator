import React, { useState } from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface ARSafetyModalProps {
  onAccept: () => void;
  onCancel: () => void;
}

const safetyTips = [
  'Be aware of your surroundings at all times',
  'Do not use AR while on stairs or escalators',
  'Hold your phone securely with both hands',
  'Watch for obstacles, people, and vehicles',
  'Use in well-lit areas for best tracking',
];

const ARSafetyModal: React.FC<ARSafetyModalProps> = ({ onAccept, onCancel }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleAccept = () => {
    if (dontShowAgain) {
      localStorage.setItem('arSafetyAccepted', 'true');
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <div className="bg-card rounded-[2rem] w-full max-w-sm p-8 animate-fade-in-up shadow-2xl">
        
        {/* Main Warning Icon - Matches Screenshot Style */}
        <div className="flex justify-center mb-8">
          <div className="w-28 h-28 rounded-full bg-[#FAFFC7] flex items-center justify-center border-4 border-[#F5FDB0]">
            <AlertTriangle className="w-14 h-14 text-foreground stroke-[1.5]" />
          </div>
        </div>

        {/* Safety Tips List */}
        <div className="space-y-5 mb-8">
          {safetyTips.map((text, index) => (
            <div key={index} className="flex items-start gap-4">
              {/* Yellow Warning Icon for bullets */}
              <div className="flex-shrink-0 mt-0.5">
                <AlertCircle className="w-6 h-6 text-[#FFC107] fill-[#FFF9C4]" />
              </div>
              <p className="text-[15px] font-medium text-foreground leading-snug">
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Don't show again checkbox */}
        <div className="flex items-center gap-3 mb-8 pl-1">
          <Checkbox
            id="dontShow"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            className="w-5 h-5 border-2 border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <label 
            htmlFor="dontShow" 
            className="text-sm font-medium text-muted-foreground cursor-pointer select-none"
          >
            Don't show this again
          </label>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleAccept}
            className="w-full h-14 text-base rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            variant="default"
          >
            I Understand, Start AR
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            className="w-full h-14 text-base rounded-xl font-medium text-muted-foreground bg-muted/50 hover:bg-muted"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ARSafetyModal;
