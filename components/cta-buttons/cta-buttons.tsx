import React from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils';

type CtaButtonsProps = {
    primaryAction: (event: React.MouseEvent<HTMLButtonElement>) => void;
    secondaryAction: (event: React.MouseEvent<HTMLButtonElement>) => void;
    primaryActionText: string;
    secondaryActionText: string;
    className?: string;
}


export const CtaButtons = ({ primaryAction, secondaryAction, primaryActionText, secondaryActionText, className }: CtaButtonsProps) => {
  return (
    <div className={cn("border-t p-4 max-h-[75px] gap-3 w-full flex items-center justify-center border-white/10 mt-auto", className)}>
      <Button onClick={primaryAction} size="lg" className="flex-1  bg-white text-black font-semibold rounded-full backdrop-blur-lg border border-white/20 text-center">
        {primaryActionText}
      </Button>
      <Button onClick={secondaryAction} size="lg" className="flex-1 gradient-bg text-white font-semibold rounded-full backdrop-blur-lg border border-white/20 text-center">
        {secondaryActionText}
      </Button>
    </div>
  )
}
