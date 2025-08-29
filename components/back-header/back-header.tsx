"use client";


import { ChevronLeft } from '@untitledui/icons';
import { useRouter } from 'next/navigation';

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
  className?: string;
}

export function BackHeader({ title, onBack, className = 'mb-6' }: BackHeaderProps) {
  const router = useRouter();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={className}>
      <div className='flex items-center p-2 justify-start gap-1'>
        <ChevronLeft 
          size={20} 
          onClick={handleBack}
          className="cursor-pointer hover:text-gray-400 transition-colors"
        />
        <h3 className="text-lg tracking-wide font-medium">{title}</h3>
      </div>
    </div>
  );
}