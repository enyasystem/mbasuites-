import { Users, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import * as React from "react";

type Guests = {
  adults: number;
  children: number;
  rooms: number;
};

type Props = {
  defaultAdults?: number;
  defaultChildren?: number;
  defaultRooms?: number;
  onChange?: (g: Guests) => void;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function GuestSelector({
  defaultAdults = 2,
  defaultChildren = 0,
  defaultRooms = 1,
  onChange,
}: Props) {
  const [adults, setAdults] = React.useState<number>(defaultAdults);
  const [children, setChildren] = React.useState<number>(defaultChildren);
  const [rooms, setRooms] = React.useState<number>(defaultRooms);

  // Use ref to avoid onChange in dependency array causing infinite loops
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  React.useEffect(() => {
    onChangeRef.current?.({ adults, children, rooms });
  }, [adults, children, rooms]);

  const label = React.useMemo(() => {
    const parts: string[] = [];
    parts.push(`${adults} ${adults === 1 ? "adult" : "adults"}`);
    parts.push(`${children} ${children === 1 ? "child" : "children"}`);
    parts.push(`${rooms} ${rooms === 1 ? "room" : "rooms"}`);
    return parts.join(", ");
  }, [adults, children, rooms]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal h-12 rounded-[35px]")}
        >
          <Users className="mr-2 h-4 w-4" />
          <span className={adults || children || rooms ? "" : "text-muted-foreground"}>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          {/* Adults */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Adults</div>
              <div className="text-xs text-muted-foreground">Ages 13 or above</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdults((v) => clamp(v - 1, 1, 10))}
                aria-label="Decrease adults"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-8 text-center">{adults}</div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdults((v) => clamp(v + 1, 1, 10))}
                aria-label="Increase adults"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Children</div>
              <div className="text-xs text-muted-foreground">Ages 0–12</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setChildren((v) => clamp(v - 1, 0, 5))}
                aria-label="Decrease children"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-8 text-center">{children}</div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setChildren((v) => clamp(v + 1, 0, 5))}
                aria-label="Increase children"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Rooms */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Rooms</div>
              <div className="text-xs text-muted-foreground">How many rooms</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRooms((v) => clamp(v - 1, 1, 5))}
                aria-label="Decrease rooms"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-8 text-center">{rooms}</div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRooms((v) => clamp(v + 1, 1, 5))}
                aria-label="Increase rooms"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
