📘 Design System – Apto Airport Ground Operations
🎯 Objetivo
Definir un Sistema de Diseño multiplataforma (Web + Mobile) que:

Sea consistente visualmente
Sea independiente del dominio
No rompa Clean Architecture
Permita escalar el proyecto
No acople el negocio a Hangar
Funcione con Expo (web + native)
Sea mantenible a largo plazo
🧠 Principios del Design System
1️⃣ El Design System es conceptual
Hangar NO es el Design System.
Hangar es una implementación web del Design System.

El DS define:

Contratos (interfaces)
Tokens (colores, spacing, tipografía)
Reglas visuales
Comportamiento esperado
2️⃣ El dominio nunca conoce el Design System
El DS vive exclusivamente en:

text

presentation/components/design-system/
❌ Nunca en domain
❌ Nunca en application
❌ Nunca en infrastructure

3️⃣ Multiplataforma sin duplicar lógica
Se usa resolución por plataforma:

text

button.web.tsx
button.native.tsx
Expo resuelve automáticamente según entorno.

📁 Estructura Oficial
text

presentation/
components/
design-system/
button/
index.ts
button.types.ts
button.web.tsx
button.native.tsx
card/
input/
list/
📐 Patrón Oficial de Componente
Cada componente debe seguir esta estructura:

text

component-name/
index.ts
component-name.types.ts
component-name.web.tsx
component-name.native.tsx
🧩 Contrato del Componente (Framework-Agnostic)
Ejemplo button.types.ts:

ts

export interface ButtonIntent {
label: string;
onPress: () => void;
disabled?: boolean;
loading?: boolean;
}

export interface ButtonStyleProps {
variant?: 'primary' | 'secondary' | 'tertiary' | 'text';
size?: 'normal' | 'compact';
}

export interface ButtonProps
extends ButtonIntent,
ButtonStyleProps {}
Reglas:
✅ No importar React
✅ No importar Hangar
✅ No importar React Native
✅ No usar any
✅ Interfaces en PascalCase

🌐 Implementación Web
📄 button.web.tsx

Puede importar Hangar
No puede transformar datos del backend
Solo adapta props visuales
tsx

import { Button as HangarButton } from '@hangar/web-components/core/Button';
import React, { memo } from 'react';

import type { ButtonProps } from './button.types';

export const Button = memo<ButtonProps>(
({
label,
onPress,
disabled = false,
loading = false,
size = 'normal',
variant = 'primary',
}) => {
return (
<HangarButton
        label={label}
        onClick={onPress}
        disabled={disabled}
        loading={loading}
        size={size}
        variant={variant}
        colorMode="standard"
      />
);
},
);

Button.displayName = 'Button';
📱 Implementación Native
📄 button.native.tsx

No puede importar Hangar
Debe respetar el mismo contrato
Puede aplicar estilos propios
tsx

export const Button = memo<ButtonProps>(
({
label,
onPress,
disabled = false,
loading = false,
size = 'normal',
variant = 'primary',
}) => {
return (
<Pressable onPress={onPress}>
<Text>{label}</Text>
</Pressable>
);
},
);
🚦 Reglas Obligatorias del DS
✅ DO
Usar React.memo
Mantener funciones < 20 líneas
Usar named exports
Mantener contrato separado
Respetar naming conventions
Mantener consistencia web/native
❌ DON’T
No importar Hangar en native
No usar any
No transformar datos del backend
No usar lógica de negocio en DS
No importar Redux
No usar useSelector dentro de DS
No usar Axios dentro de DS
🔄 Resolución Multiplataforma
El archivo index.ts debe contener:

ts

export { Button } from './button';
Y NO debe existir:

text

button.ts
Porque rompe la resolución por plataforma.

🎨 Tokens (Futuro)
Cuando el DS crezca, agregar:

text

design-system/
tokens/
colors.ts
spacing.ts
typography.ts
Nunca hardcodear colores dentro del dominio.

📊 Validación contra Clean Architecture
Capa ¿Puede usar DS?
domain ❌
application ❌
infrastructure ❌
presentation ✅
⚠️ Relación con Regla 10.1
El DS:

✅ No transforma datos del backend
✅ No cambia nombres de campos
✅ No mapea estructuras

Solo renderiza lo que recibe.

🧪 Testing del Design System
Cada componente debe tener:

text

button.test.tsx
Mínimo validar:

Render correcto
Props disabled
Props loading
Variant aplicado
Size aplicado
Cobertura mínima recomendada: 80%

📈 Escalabilidad
Este patrón permite:

Agregar nuevos componentes fácilmente
Cambiar Hangar sin romper mobile
Cambiar mobile sin romper web
Mantener dominio intacto
Escalar equipo
🏁 Conclusión
El Sistema de Diseño:

✅ Es independiente del dominio
✅ Es multiplataforma
✅ Es escalable
✅ Es compatible con Clean Architecture
✅ Respeta reglas del equipo
✅ No acopla el negocio a Hangar
✅ Está preparado para crecimiento a largo plazo

📌 Nota Final para el Equipo
El Design System es infraestructura visual, no negocio.

Puede cambiar el framework.
Puede cambiar Hangar.
Puede cambiar React.

El dominio no debe enterarse.
