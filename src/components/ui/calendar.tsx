import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/buttonVariants";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

type ChevronProps = {
  orientation?: "left" | "right" | "up" | "down";
  size?: number;
  className?: string;
};

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  // Provide a sensible default for `modifiersClassNames` so callers can pass a
  // `booked` modifier and have it visually highlighted.
  const defaultModifiersClassNames = {
    // Softer booked color to reduce visual intensity
    booked: "bg-destructive/20 text-destructive-foreground",
  } as Record<string, string>;

  const mergedModifiersClassNames = {
    ...defaultModifiersClassNames,
    ...(props.modifiersClassNames || {}),
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1",
        ),
        month_grid: "inline-table border-collapse",
        weekdays: "",
        weekday: "text-muted-foreground w-9 font-normal text-[0.8rem] text-center",
        weeks: "",
        week: "",
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      modifiersClassNames={mergedModifiersClassNames}
      components={{
        Chevron: (props: ChevronProps) => {
          const { orientation } = props;
          const size = props.size || 16;
          const className = props.className;
          if (orientation === "left") return <ChevronLeft className={className} size={size} />;
          if (orientation === "right") return <ChevronRight className={className} size={size} />;
          if (orientation === "up") return <ChevronUp className={className} size={size} />;
          if (orientation === "down") return <ChevronDown className={className} size={size} />;
          return <ChevronLeft className={className} size={size} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
