import type { Flight } from '@/domain/entities/flight';

export type OrderKey = 'eta' | 'etd' | 'fleet';

export interface PanelColors {
  backgroundSecondary: string;
  borderPrimary: string;
  borderInfo: string;
  iconInfo: string;
  interactionSoftDefault: string;
  surfacePrimary: string;
  surfaceSecondary: string;
  textPrimary: string;
  textTertiary: string;
}

export interface SectionConfig {
  id: 'mine' | 'others';
  label: string;
  flights: Flight[];
}

export type SectionListItem =
  | { type: 'date'; dateKey: string; label: string }
  | { type: 'flight'; flight: Flight };

export type StatusTagType =
  | 'successSoftDot'
  | 'warningSoftDot'
  | 'errorSoftDot';

export interface StatusTag {
  label: string;
  type: StatusTagType;
}
