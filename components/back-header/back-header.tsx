"use client";


import { ChevronLeft } from '@untitledui/icons';
import { useRouter } from 'next/navigation';

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
  className?: string;
}

export default function BackHeader({ title, onBack, className = 'mb-6' }: BackHeaderProps) {
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
      <div className='flex items-center justify-start gap-2'>
        <ChevronLeft 
          size={20} 
          onClick={handleBack}
          className="cursor-pointer hover:text-gray-400 transition-colors"
        />
        <h3 className="text-lg tracking-tighter font-bold">{title}</h3>
      </div>
    </div>
  );
}