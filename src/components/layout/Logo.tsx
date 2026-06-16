import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import AdminAccessModal from '../admin/AdminAccessModal';

interface LogoProps {
  className?: string;
  variant?: 'black' | 'white';
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  const [clicks, setClicks] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    const newClicks = clicks + 1;
    if (newClicks >= 6) {
      setIsModalOpen(true);
      setClicks(0);
    } else {
      setClicks(newClicks);
      // Reset clicks after 2 seconds of inactivity
      const timer = setTimeout(() => setClicks(0), 2000);
      return () => clearTimeout(timer);
    }
  };

  return (
    <div 
      className={cn("flex items-center gap-2 cursor-pointer select-none", className)}
      onClick={handleClick}
    >
      <img 
        src="https://storage.googleapis.com/dala-prod-public-storage/attachments/6bd9e991-008c-4c2d-9286-c2a1a3f64cb3/1780930077807_Vertex_black.png" 
        alt="Vertex Tech Solutions" 
        className="h-10 w-auto object-contain"
      />
      <AdminAccessModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
};

export default Logo;