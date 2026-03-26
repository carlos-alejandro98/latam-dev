# Design System Scripts

Scripts para generar y verificar el **wrapper del Design System** (adaptador de Hangar para web + mobile). El DS es solo para este proyecto: adaptador técnico, sin versionado independiente ni publicación NPM.

## Comandos

| Comando | Descripción |
|--------|-------------|
| `npm run ds` | Pipeline completo: build → verify → props |
| `npm run ds build` | Genera wrappers desde la config |
| `npm run ds verify` | Verifica tamaño de bundle y snapshot de versión Hangar |
| `npm run ds props` | Snapshot de props (detecta breaking changes) |
| `npm run ds check` | verify + props |

## Cuando Hangar agrega un componente nuevo

1. **Editar la config**  
   `scripts/design-system/config/design-system.config.ts`

   Añadir un nuevo objeto en `DESIGN_SYSTEM_COMPONENTS`:

   ```ts
   {
     name: 'Accordion',
     webImportPath: '@hangar/web-components/core/Accordion',
     nativeImportPath: '@hangar/mobile-components',
     hasChildren: true,  // opcional
   }
   ```

   - Si solo existe en web: pon solo `webImportPath`.
   - Si solo existe en native: pon solo `nativeImportPath`.

2. **Ejecutar**  
   ```bash
   npm run ds
   ```

3. **Archivos que se generan/actualizan**

   | Path | Descripción |
   |------|-------------|
   | `presentation/components/design-system/<nombre-kebab>/` | Carpeta del wrapper (ej. `accordion/`) |
   | `presentation/components/design-system/<nombre-kebab>/<nombre-kebab>.types.ts` | Tipos (props) |
   | `presentation/components/design-system/<nombre-kebab>/<nombre-kebab>.web.tsx` | Wrapper web (si tiene `webImportPath`) |
   | `presentation/components/design-system/<nombre-kebab>/<nombre-kebab>.native.tsx` | Wrapper native (si tiene `nativeImportPath`) |
   | `presentation/components/design-system/<nombre-kebab>/index.ts` | Barrel del componente |
   | `presentation/components/design-system/index.ts` | Barrel global (se actualiza con el nuevo export) |
   | `presentation/components/design-system/index.web.ts` | Barrel web |
   | `presentation/components/design-system/index.native.ts` | Barrel native |

4. **Uso en el proyecto**  
   Siempre importar desde el wrapper, nunca desde Hangar:

   ```ts
   import { Accordion } from '@/presentation/components/design-system';
   ```

## Cuando Hangar modifica un componente existente

1. **Actualizar dependencias** (si cambió la versión del paquete):
   ```bash
   npm update @hangar/web-components @hangar/mobile-components
   ```

2. **Regenerar y verificar**  
   ```bash
   npm run ds
   ```

3. **Qué hace cada parte**
   - **build**: Regenera wrappers y tipos desde la config.
   - **verify**: Comprueba tamaño de bundle y, si cambió la versión de Hangar, muestra advertencia para que ejecutes de nuevo el pipeline.
   - **props**: Compara props actuales con el snapshot anterior. Si una prop se eliminó o pasó de opcional a obligatoria, **falla** (breaking change).

4. **Si `ds props` falla por breaking**  
   Revisar el mensaje (ej. “Prop X became required”). Ajustar usos del componente en el proyecto y luego volver a ejecutar:
   ```bash
   npm run ds props
   ```
   hasta que el snapshot se actualice y pase.

## Verificación (verify.ts)

- **Bundle size**: límite 200 KB para el bundle del DS.
- **Hangar version**: si cambian las versiones de `@hangar/web-components` o `@hangar/mobile-components`, se muestra un **warn** y se sugiere ejecutar `npm run ds`. No se lanza error; el pipeline no bloquea por cambio de versión.
- **Uso de wrappers**: no se comprueba. Los wrappers pueden existir sin uso (diseños en evolución, Figma cambiante).

## Estructura esperada

- `presentation/components/design-system/`: solo wrappers puros (sin lógica de negocio).
- `presentation/components/business/` (o equivalente): componentes de negocio que importan del design-system.

Siempre importar desde `@/presentation/components/design-system`, nunca directamente desde Hangar.
