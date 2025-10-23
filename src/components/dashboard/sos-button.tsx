'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Circle, CircleDot } from 'lucide-react';
import { toast } from 'sonner';
import { SOSType } from '@/types';

interface SosButtonProps {
  onEmergency: (type: SOSType) => void;
}

export function SosButton({ onEmergency }: SosButtonProps) {
  const [emergencyType, setEmergencyType] = useState<SOSType | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleEmergency = () => {
    if (!emergencyType) {
      toast.error('Silakan pilih jenis darurat');
      return;
    }

    onEmergency(emergencyType);
    toast.success('Permintaan bantuan darurat terkirim', {
      description: `Jenis: ${emergencyType === 'kebakaran' ? 'Kebakaran' : emergencyType === 'medis' ? 'Medis' : 'Keamanan'}`,
    });
    setIsOpen(false);
    setEmergencyType(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="lg" 
          className="w-full py-6 text-lg font-bold flex items-center gap-2"
        >
          <AlertTriangle className="h-5 w-5" />
          Tombol Darurat (SOS)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Permintaan Bantuan Darurat</DialogTitle>
          <DialogDescription>
            Pilih jenis darurat yang terjadi untuk mengirimkan permintaan bantuan ke admin dan pihak berwenang.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Jenis Darurat:</p>
          
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              className={`flex items-center p-3 rounded-lg border ${
                emergencyType === 'kebakaran' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setEmergencyType('kebakaran')}
            >
              {emergencyType === 'kebakaran' ? (
                <CircleDot className="h-5 w-5 text-red-500 mr-2" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 mr-2" />
              )}
              <span className={emergencyType === 'kebakaran' ? 'font-medium text-red-700' : ''}>
                Kebakaran
              </span>
            </button>
            
            <button
              type="button"
              className={`flex items-center p-3 rounded-lg border ${
                emergencyType === 'medis' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setEmergencyType('medis')}
            >
              {emergencyType === 'medis' ? (
                <CircleDot className="h-5 w-5 text-red-500 mr-2" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 mr-2" />
              )}
              <span className={emergencyType === 'medis' ? 'font-medium text-red-700' : ''}>
                Medis
              </span>
            </button>
            
            <button
              type="button"
              className={`flex items-center p-3 rounded-lg border ${
                emergencyType === 'keamanan' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setEmergencyType('keamanan')}
            >
              {emergencyType === 'keamanan' ? (
                <CircleDot className="h-5 w-5 text-red-500 mr-2" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 mr-2" />
              )}
              <span className={emergencyType === 'keamanan' ? 'font-medium text-red-700' : ''}>
                Keamanan
              </span>
            </button>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleEmergency}
            disabled={!emergencyType}
            className="w-full"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Kirim Bantuan Darurat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}