import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ChevronDown } from "@untitledui/icons";

interface DescriptionProps {
    description: string;
}

export const Description = ({ description }: DescriptionProps) => {
  return (
    (
      <div className="w-full flex items-start justify-start flex-col">
          <h2 className="text-white w-full font-bold font-mono mb-2 flex items-center justify-between">sbre el ev_nto </h2>
          <p className="text-sm  text-start w-full leading-relaxed">{description || 'No hay descripción disponible para este evento.'}</p>
      </div>
    )
  )
}

