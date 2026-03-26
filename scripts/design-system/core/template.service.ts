export class TemplateService {
  public generateComponentTemplate(
    componentName: string,
    importPath: string,
    platform: 'web' | 'native',
    exportName?: string,
  ): string {
    const kebabName = this.toKebabCase(componentName);
    const hangarExportName = exportName ?? componentName;

    return `
import React, { memo, forwardRef } from 'react';
import { ${hangarExportName} as Hangar${componentName} } from '${importPath}';
import type { ${componentName}Props } from './${kebabName}.types';

/**
 * ${platform.toUpperCase()} wrapper for ${componentName}.
 * Pure wrapper with ref forwarding.
 */
const ${componentName}Component = forwardRef<any, ${componentName}Props>(
  (props, ref) => {
    return <Hangar${componentName} ref={ref} {...props} />;
  }
);

${componentName}Component.displayName = '${componentName}';

export const ${componentName} = memo(${componentName}Component);
export default ${componentName};
`;
  }

  private toKebabCase(name: string): string {
    return name.replace(
      /[A-Z]/g,
      (letter, index) => `${index === 0 ? '' : '-'}${letter.toLowerCase()}`,
    );
  }
}
