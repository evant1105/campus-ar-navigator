import React, { useState } from 'react';
import { AlertTriangle, Eye, Smartphone, Users, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface ARSafetyModalProps {
  onAccept: () => void;
  onCancel: () => void;
}

const safetyTips = [
  { icon: Eye, text: 'Be aware of your surroundings at all times' },
  { icon: AlertTriangle, text: 'Do not use AR while on stairs or escalators' },
  { icon: Smartphone, text: 'Hold your phone securely with both hands' },
  { icon: Users, text: 'Watch for obstacles, people, and vehicles' },
  { icon: Sun, text: 'Use in well-lit areas for best tracking' },
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
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl w-full max-w-sm p-6 animate-fade-in-up">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-warning-light flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-warning-foreground" />
          </div>
        </div>

        {/* Safety Tips */}
        <div className="space-y-4 mb-6">
          {safetyTips.map(({ icon: Icon, text }, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground">{text}</p>
            </div>
          ))}
        </div>

        {/* Don't show again checkbox */}
        <div className="flex items-center gap-2 mb-6">
          <Checkbox
            id="dontShow"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
          />
          <label htmlFor="dontShow" className="text-sm text-muted-foreground cursor-pointer">
            Don't show this again
          </label>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleAccept}
            className="w-full"
            variant="hero"
          >
            I Understand, Start AR
          </Button>
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ARSafetyModal;
