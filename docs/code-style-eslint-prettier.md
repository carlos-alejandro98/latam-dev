🧹 **Code Style, ESLint & Prettier**
**Proyecto**: AptoGantt Frontend
**Stack**: React Native (Expo) + TypeScript
**Arquitectura**: Clean Architecture + Hexagonal
**Última actualización**: 2026‑01

# 🎯 Objetivo de este documento

Definir **cómo se aplican y por qué existen ESLint y Prettier en el proyecto**, asegurando que:

    - El código sea consistente
    - Las reglas sean objetivas y automáticas
    - Los PRs no dependan de opiniones
    - El proyecto escale con más desarrolladores
    - CI/CD pueda bloquear errores reales

# 🧠 Principio clave

**Prettier formatea.**
**ESLint valida reglas y arquitectura.**
**Nunca se solapan.**

# 🔍 ¿Qué herramienta hace qué?

## ✅ Prettier

Responsable de:

    -Formato de código
    -Espacios
    -Comillas
    -Longitud de línea
    -Comas finales

### 📌 Prettier NO valida lógica ni arquitectura.

# ✅ ESLint

Responsable de: - Reglas de código - Convenciones de naming - Uso correcto de hooks - Imports ordenados - Restricciones arquitectónicas - Evitar any - Tamaño de funciones y componentes

### 📌 ESLint SÍ bloquea PRs.

# ✅ Configuración utilizada en el proyecto

## 🟢 ESLint (Flat Config – estándar moderno)

El proyecto utiliza **ESLint Flat Config**, definido en:

    eslint.config.js

❌ No se usan:

    - .eslintrc.js
    - .eslintrc.cjs
    - .eslintignore

### 📌 Todas las reglas e ignores viven en eslint.config.js.

# 🟢 Prettier

Prettier está configurado en:

    prettier.config.js

Ignorados en:

    .prettierignore

# 📁 Archivos de configuración

✅ ESLint

    eslint.config.js

Incluye: - Reglas base JS - Reglas TypeScript (strict) - Reglas React y Hooks - Reglas de imports - Reglas de tamaño de funciones - Reglas de seguridad (no-console, no-debugger) - Ignorados globales (node_modules, dist, .expo, etc.)

### 📌 ESLint se ejecuta tanto local como en CI.

# ✅ Prettier

    prettier.config.js

Define: - singleQuote - semi - trailingComma - printWidth - tabWidth

### 📌 Prettier solo formatea, nunca decide reglas de negocio.

# 🖥️ Configuración de VS Code (OBLIGATORIA)

Cada desarrollador debe tener en:

    .vscode/settings.json

La siguiente configuración:

`{`
`"eslint.useFlatConfig": true,`
``     `"editor.formatOnSave": true,`
    `"editor.defaultFormatter": "esbenp.prettier-vscode",`
    ``
`"editor.codeActionsOnSave": {`
`"source.fixAll.eslint": "explicit"`
`}`
`}`

### 📌 Comportamiento esperado

    - Al guardar → Prettier formatea
    - ESLint solo corrige cuando se guarda explícitamente
    - ESLint marca errores en rojo
    - Las reglas son las mismas en todos los equipos

# 🧪 Scripts disponibles

En package.json:

`{`
`"scripts": {`
`"lint": "eslint .",`
`"lint:fix": "eslint . --fix",`
`"format": "prettier --write ."`
`}`
`}`

## Uso recomendado

    - npm run lint
    - npm run lint:fix
    - npm run format

# 🚦 Reglas importantes aplicadas por ESLint

Algunas reglas **CRÍTICAS** del proyecto:

    - ❌ any prohibido
    - ✅ camelCase, PascalCase, kebab-case
    - ✅ Imports ordenados y agrupados
    - ✅ Hooks correctamente usados
    - ✅ Máx. 20 líneas por función
    - ✅ Máx. 200 líneas por archivo
    - ❌ console.log en producción
    - ❌ debugger

## 📌 Estas reglas no son opcionales.

# 🚫 Antipatterns prohibidos

    ❌ Desactivar ESLint con // eslint-disable sin justificación
    ❌ Ignorar errores en PR
    ❌ Reformatear código manualmente
    ❌ Mezclar Prettier con ESLint para formato
    ❌ Añadir configuraciones locales distintas

# ✅ Relación con CI/CD

    - ESLint corre en el pipeline como Quality Gate
    - PRs con errores ESLint NO se aprueban
    - Prettier no bloquea CI, ESLint sí

# ✅ Checklist antes de abrir PR

    - [ ] npm run lint sin errores
    - [ ] Prettier aplicado
    - [ ] No hay reglas desactivadas
    - [ ] Código respeta arquitectura
    - [ ] Imports ordenados
    - [ ] Sin any

# 🏁 Conclusión

Este setup de ESLint + Prettier:
✔ Elimina discusiones de estilo
✔ Protege la arquitectura
✔ Asegura calidad consistente
✔ Facilita onboarding
✔ Permite escalar el equipo
✔ Es estándar en proyectos grandes

**El código no se negocia en PRs.**
**Se valida automáticamente.**

# 📌 Nota final para el equipo

Si algo **no pasa ESLint,**
**no es una opinión, es una regla del proyecto.**
