import { type VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export const getBadgeVariant = (status: string): BadgeVariant => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'default';
      case 'paid':
        return 'secondary';
      case 'used':
        return 'outline';
      case 'transferred':
        return 'destructive';
      default:
        return 'default';
    }
};