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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 animate-in zoom-in-95 duration-200 shadow-2xl">
        
        {/* Main Warning Icon Container */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-full bg-[#FAFFC7] flex items-center justify-center border-4 border-transparent shadow-sm">
            <AlertTriangle className="w-16 h-16 text-slate-900 stroke-[1.5]" />
          </div>
        </div>

        {/* Safety Tips List */}
        <div className="space-y-5 mb-8">
          {safetyTips.map((text, index) => (
            <div key={index} className="flex items-start gap-4">
              {/* Yellow Warning Bullet Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <AlertCircle className="w-6 h-6 text-[#FFC107] fill-white" />
              </div>
              <p className="text-[15px] font-medium text-slate-700 leading-snug">
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Checkbox Section */}
        <div className="flex items-center gap-3 mb-8 pl-1">
          <Checkbox
            id="dontShow"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            className="w-5 h-5 border-2 border-slate-400 data-[state=checked]:bg-slate-700 data-[state=checked]:border-slate-700"
          />
          <label 
            htmlFor="dontShow" 
            className="text-sm font-medium text-slate-500 cursor-pointer select-none"
          >
            Don't show this again
          </label>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleAccept}
            className="w-full h-14 text-base rounded-xl font-semibold shadow-md bg-[#6366f1] hover:bg-[#5558e6] text-white"
          >
            I Understand, Start AR
          </Button>
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full h-14 text-base rounded-xl font-medium text-slate-500 bg-slate-100 hover:bg-slate-200"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ARSafetyModal;
