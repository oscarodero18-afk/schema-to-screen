import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import * as Sonner from 'sonner';

interface AdminAccessModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminAccessModal: React.FC<AdminAccessModalProps> = ({ isOpen, onOpenChange }) => {
  const [pin, setPin] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (pin === '3381') {
      Sonner.toast.success('Admin access granted');
      sessionStorage.setItem('admin_bypass', 'true');
      onOpenChange(false);
      navigate('/admin');
    } else {
      Sonner.toast.error('Invalid PIN');
      setPin('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Admin Access Only</DialogTitle>
          <DialogDescription className="text-center italic text-xs">
            Enter the 4-digit PIN to access strategic management.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={(value) => setPin(value)}
            onComplete={handleSubmit}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={pin.length < 4} className="font-bold">Unlock Dashboard</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAccessModal;