import type { PanelColors } from './flight-list.types';

export interface FlightListDateSelectorProps {
  colors: PanelColors;
  selectedDateKey: string | null;
  availableDateKeys: string[];
  onDateChange: (value: string) => void;
  onPreviousDate: () => void;
  onNextDate: () => void;
}
