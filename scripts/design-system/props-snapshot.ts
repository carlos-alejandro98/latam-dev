import fs from 'fs';
import path from 'path';
import { Project, Type } from 'ts-morph';
import { DESIGN_SYSTEM_COMPONENTS } from './config/design-system.config';

const SNAPSHOT_PATH = path.resolve(
  'scripts/design-system/.props-snapshot.json',
);

interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
}

type Snapshot = Record<string, PropDefinition[]>;

const project = new Project({
  tsConfigFilePath: path.resolve('tsconfig.json'),
});

/**
 * Extracts deep prop definitions from a component type
 */
function normalizeTypeText(typeText: string): string {
  const normalizedSlashes = typeText.replace(/\\/g, '/');
  return normalizedSlashes.replace(
    /import\(".*?node_modules\/([^"]+)"\)/g,
    'import("$1")',
  );
}

function extractProps(type: Type): PropDefinition[] {
  return type.getProperties().map((symbol) => {
    const declarations = symbol.getDeclarations();
    const declaration = declarations[0];

    const propType = symbol.getTypeAtLocation(declaration);
    const isOptional = symbol.isOptional();

    return {
      name: symbol.getName(),
      type: normalizeTypeText(propType.getText()),
      required: !isOptional,
    };
  });
}

/**
 * Resuelve la ruta al archivo de tipos (.d.ts) cuando exista, para que ts-morph lea los exports correctamente.
 */
function resolveToTypesPath(importPath: string): string {
  const resolved = require.resolve(importPath);
  if (resolved.endsWith('.js')) {
    const dts = resolved
      .replace(/\.cjs\.js$/, '.d.ts')
      .replace(/\.js$/, '.d.ts');
    if (fs.existsSync(dts)) return dts;
  }
  return resolved;
}

function resolveTypesEntry(importPath: string): string {
  const resolvedPath = require.resolve(importPath);

  // 1️⃣ Intentar .d.ts al lado del JS
  const possibleDtsPaths = [
    resolvedPath.replace(/\.cjs\.js$/, '.d.ts'),
    resolvedPath.replace(/\.js$/, '.d.ts'),
    resolvedPath.replace(/\.mjs$/, '.d.ts'),
  ];

  for (const dtsPath of possibleDtsPaths) {
    if (fs.existsSync(dtsPath)) {
      return dtsPath;
    }
  }

  // 2️⃣ Buscar el root del paquete (node_modules/@hangar/mobile-components)
  let currentDir = path.dirname(resolvedPath);
  let packageRoot: string | null = null;

  while (currentDir !== path.parse(currentDir).root) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      packageRoot = currentDir;
      break;
    }
    currentDir = path.dirname(currentDir);
  }

  if (!packageRoot) {
    throw new Error(`❌ Could not locate package root for ${importPath}`);
  }

  // 3️⃣ Buscar types en rutas comunes
  const candidatePaths = [
    path.join(packageRoot, 'index.d.ts'),
    path.join(packageRoot, 'lib/types/index.d.ts'),
    path.join(packageRoot, 'lib/typescript/index.d.ts'),
    path.join(packageRoot, 'lib/typescript/src/index.d.ts'),
    path.join(packageRoot, 'dist/types/index.d.ts'),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`❌ Could not find type declarations for ${importPath}`);
}

/**
 * Obtiene el símbolo del componente desde los exports del módulo.
 * Intenta TypeChecker (re-exports) y luego declaraciones directas.
 */
function getComponentSymbol(
  sourceFile: import('ts-morph').SourceFile,
  exportName: string,
  importPath: string,
): import('ts-morph').Symbol {
  const typeChecker = project.getTypeChecker();

  const moduleSymbol = typeChecker.getSymbolAtLocation(sourceFile);
  if (moduleSymbol) {
    const exports = typeChecker.getExportsOfModule(moduleSymbol);
    const symbol = exports.find((s) => s.getName() === exportName);
    if (symbol) return symbol;
  }

  const exported = sourceFile.getExportedDeclarations();
  const decl = exported.get(exportName)?.[0];
  if (decl) {
    const symbol = decl.getSymbol();
    if (symbol) return symbol;
  }

  throw new Error(`❌ ${exportName} not exported from ${importPath}`);
}

/**
 * Gets real component props using React.ComponentProps
 */
function getComponentProps(
  exportName: string,
  importPath: string,
): PropDefinition[] {
  const sourceText = `
    import { ${exportName} } from '${importPath}';
    type Props = React.ComponentProps<typeof ${exportName}>;
  `;

  const tempFile = project.createSourceFile(
    `temp-${exportName}.ts`,
    sourceText,
    { overwrite: true },
  );

  const typeAlias = tempFile.getTypeAliasOrThrow('Props');
  const propsType = typeAlias.getType();

  return extractProps(propsType);
}

/**
 * Nombre con el que la librería exporta el componente (p. ej. "Checkbox" en path .../Checkbox).
 */
function getExportName(
  component: (typeof DESIGN_SYSTEM_COMPONENTS)[0],
): string {
  const importPath = component.webImportPath || component.nativeImportPath;
  if (!importPath) return component.name;
  if (importPath.includes('web-components') && importPath.includes('/')) {
    return importPath.split('/').pop() ?? component.name;
  }
  return component.name;
}

/**
 * Generates current snapshot
 */
function generateSnapshot(): Snapshot {
  const snapshot: Snapshot = {};

  DESIGN_SYSTEM_COMPONENTS.forEach((component) => {
    const importPath = component.webImportPath || component.nativeImportPath;

    if (!importPath) return;

    const exportName = getExportName(component);
    const props = getComponentProps(exportName, importPath);

    snapshot[component.name] = props;
  });

  return snapshot;
}

/**
 * Deep comparison between old and new props
 */
function compareSnapshots(previous: Snapshot, current: Snapshot): void {
  Object.keys(current).forEach((component) => {
    const oldProps = previous[component] || [];
    const newProps = current[component];

    const oldMap = new Map(oldProps.map((p) => [p.name, p]));
    const newMap = new Map(newProps.map((p) => [p.name, p]));

    // ✅ Removed props
    oldProps.forEach((oldProp) => {
      if (!newMap.has(oldProp.name)) {
        throw new Error(
          `❌ Breaking: Prop "${oldProp.name}" removed from ${component}`,
        );
      }
    });

    newProps.forEach((newProp) => {
      const oldProp = oldMap.get(newProp.name);

      if (!oldProp) return;

      // ✅ Type change detection
      const oldType = normalizeTypeText(oldProp.type);
      const newType = normalizeTypeText(newProp.type);
      if (oldType !== newType) {
        throw new Error(
          `❌ Breaking: Prop "${newProp.name}" type changed in ${component}\nOld: ${oldType}\nNew: ${newType}`,
        );
      }

      // ✅ Optional → Required
      if (!oldProp.required && newProp.required) {
        throw new Error(
          `❌ Breaking: Prop "${newProp.name}" became required in ${component}`,
        );
      }

      // ✅ Required → Optional (non-breaking but warn)
      if (oldProp.required && !newProp.required) {
        console.warn(
          `⚠️ Prop "${newProp.name}" became optional in ${component}`,
        );
      }
    });
  });
}

/**
 * Main runner
 */
function run(): void {
  const current = generateSnapshot();
  const isUpdate = process.argv.includes('--update');

  if (!fs.existsSync(SNAPSHOT_PATH) || isUpdate) {
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(current, null, 2));
    console.log(
      isUpdate ? '✅ Props snapshot updated' : '✅ Props snapshot created',
    );
    return;
  }

  const previous: Snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));

  compareSnapshots(previous, current);

  console.log('✅ No breaking prop changes detected');
}

run();
