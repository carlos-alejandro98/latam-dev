import fs from 'fs';
import path from 'path';
import { build } from 'esbuild';

const BASE_PATH = path.resolve('presentation/components/design-system');
const SNAPSHOT_PATH = path.resolve(
  'scripts/design-system/.hangar-snapshot.json',
);

/**
 * Convierte kebab-case a PascalCase (ej: avatar -> Avatar).
 */
function toPascalCase(name: string): string {
  return name
    .replace(/^-/, '')
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join('');
}

/**
 * Plugin para el bundle WEB del design-system:
 * - Resuelve ./xxx.web a ./xxx/xxx.web.tsx (solo variante web).
 * - Si no existe .web.tsx (componente solo native), devuelve un stub vacío.
 * Así esbuild no incluye React Native ni @hangar/mobile-components.
 */
const resolveWebBarrelPlugin = {
  name: 'resolve-web-barrel',
  setup(build: import('esbuild').PluginBuild): void {
    // Resolver: ./alert.web -> alert/alert.web.tsx o stub
    build.onResolve({ filter: /^\.\/[^/]+\.web$/ }, (args) => {
      const pathWithoutWeb = args.path.replace(/\.web$/, '');
      const name = pathWithoutWeb.replace(/^\.\//, ''); // "avatar", "bottom-navigation"
      const dir = path.join(args.resolveDir, name);
      const file = path.join(dir, `${name}.web.tsx`);
      if (fs.existsSync(file)) {
        return { path: file };
      }
      return { path: `stub:${name}`, namespace: 'stub' };
    });

    build.onLoad({ filter: /.*/, namespace: 'stub' }, (args) => {
      const raw = args.path.replace(/^(stub:)+/, '').replace(/^\.\//, '');
      const componentName = toPascalCase(raw);
      return {
        contents: `import React from 'react';
export const ${componentName} = () => null;
export default ${componentName};
`,
        loader: 'tsx',
      };
    });
  },
};

/**
 * Verificación de tamaño del bundle del Design System (solo variante web).
 */
async function checkBundle(): Promise<void> {
  const result = await build({
    entryPoints: [path.join(BASE_PATH, 'index.web.ts')],
    bundle: true,
    metafile: true,
    write: false,
    plugins: [resolveWebBarrelPlugin],
    external: [
      'react',
      'react-dom',
      'styled-components',
      '@hangar/web-components',
    ],
  });

  const output = Object.values(result.metafile!.outputs)[0];
  if (!output) throw new Error('No bundle output');
  const size = output.bytes;

  const MAX_SIZE = 200_000;

  if (size > MAX_SIZE) {
    throw new Error(`❌ Bundle exceeded limit (${size} bytes)`);
  }

  console.log(`✅ Bundle size OK (${size} bytes)`);
}

/**
 * Verificación de versión de Hangar (snapshot).
 * Si cambia la versión, advierte y sugiere regenerar.
 */
function checkHangarVersion(): void {
  const pkg = require('../../package.json');

  const current = {
    web: pkg.dependencies?.['@hangar/web-components'],
    native: pkg.dependencies?.['@hangar/mobile-components'],
  };

  if (!fs.existsSync(SNAPSHOT_PATH)) {
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(current, null, 2));
    console.log('✅ Hangar version snapshot created');
    return;
  }

  const previous = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));

  if (previous.web !== current.web || previous.native !== current.native) {
    console.warn('⚠️ Hangar version changed');
    console.warn('👉 Run: npm run ds');
  }
}

/**
 * Pipeline de verificación.
 * No se audita uso de wrappers: el DS es adaptador y los diseños evolucionan.
 */
async function run(): Promise<void> {
  await checkBundle();
  checkHangarVersion();
  console.log('✅ Design System verification passed');
}

run();
