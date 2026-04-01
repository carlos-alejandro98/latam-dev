import { useCallback, useState } from 'react';

import type {
  ExpandedSections,
  SectionId,
} from '@/presentation/hooks/use-flight-virtualized-data';

const DEFAULT_EXPANDED: ExpandedSections = {
  mine: true,
  others: true,
};

/**
 * Hook que gestiona el estado expandido/colapsado de las secciones
 * "Meus Voos" y "Otros Voos" de la lista de vuelos.
 *
 * @param initial - Estado inicial opcional (parcial) de las secciones.
 * @returns expandedSections y función toggleSection para alternar cada sección.
 */
export const useExpandedSections = (
  initial?: Partial<ExpandedSections>,
): {
  expandedSections: ExpandedSections;
  toggleSection: (sectionId: SectionId) => void;
} => {
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    ...DEFAULT_EXPANDED,
    ...initial,
  });

  const toggleSection = useCallback((sectionId: SectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  return { expandedSections, toggleSection };
};
