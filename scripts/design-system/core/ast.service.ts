export class AstService {
  /**
   * Generates props alias using React.ComponentProps.
   * exportName: nombre con el que la librería exporta el componente (ej. "Checkbox" en Hangar).
   * Si no se pasa, se usa componentName.
   */
  public generatePropsAlias(
    componentName: string,
    importPath: string,
    exportName?: string,
  ): string {
    const hangarExportName = exportName ?? componentName;
    return `
import type { ComponentProps } from 'react';
import { ${hangarExportName} as Hangar${componentName} } from '${importPath}';

/**
 * Auto-generated from Hangar source.
 * Do not edit manually.
 */
export type ${componentName}Props = ComponentProps<typeof Hangar${componentName}>;
`;
  }

  /**
   * Validation removed intentionally.
   * Compilation will fail later if component does not exist.
   */
  public validateComponentExists(): void {
    return;
  }
}
