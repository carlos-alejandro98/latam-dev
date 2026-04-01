# Cómo pasar especificaciones de Figma al desarrollo

Para que los cambios en código coincidan con el diseño y no se pierdan detalles (espacios, tipografía, colores), usa **una** de estas opciones.

---

## Opción 1: Especificaciones escritas (recomendada)

En Figma, abre **Inspect** (panel derecho) y, para el frame o componente que quieres implementar, copia o escribe:

- **Espaciado:** padding (top, right, bottom, left), gap entre elementos.
- **Tipografía:** font, size, weight, line height, letter spacing, color (hex).
- **Tamaños:** width, height, min/max si aplica.
- **Bordes:** width, color, qué lados (top/right/bottom/left).
- **Otros:** border-radius, sombras, si algo es opcional.

**Ejemplo para un header:**

```
Header "Fila de Voos"
- Contenedor: padding 24 left, 16 right, 20 top, 20 bottom. minHeight 76. Borde solo abajo 1px #D9D9D9.
- Título: 28px Bold, line-height 36, letter-spacing 0.25, color #303030.
- Icono: 32x32, color #303030.
- Espacio entre título e icono: [valor en px si lo ves en Inspect].
```

Pega esto en el chat cuando pidas el cambio. Así no dependo de interpretar el JSON de la API ni de coordenadas absolutas.

---

## Opción 2: Captura con Inspect visible

1. En Figma, selecciona el nodo (frame o componente).
2. En el panel **Inspect**, deja visibles las propiedades que importan (padding, font, fill, etc.).
3. Haz una **captura de pantalla** donde se vea el diseño y el panel Inspect con esos valores.

Con la imagen puedo leer los números exactos y aplicarlos en código.

---

## Opción 3: Exportar nodo y tabla de valores

1. Ejecuta: `FIGMA_TOKEN=xxx node scripts/figma-export-node.mjs 3:XXXX` (con el node-id que corresponda).
2. Del JSON, **no hace falta pegar todo**. Mejor: abre el JSON y escribe una tabla resumen, por ejemplo:

| Elemento     | Propiedad   | Valor  |
|-------------|-------------|--------|
| Frame       | paddingTop  | 20     |
| Frame       | paddingLeft | 24     |
| Text "Fila…"| fontSize    | 28     |
| Text        | lineHeight  | 36     |
| …           | …           | …      |

Así evito confundirme con anidamiento, variables de Figma o coordenadas absolutas.

---

## Qué evita errores

- **No** asumir que “el JSON de la API” es suficiente: a veces el frame que exportas no es el que se ve en pantalla (hay grupos/frames padres), o los valores vienen en variables.
- **Sí** dar valores **numéricos y concretos** (px, hex) para lo que quieres que cambie.
- **Sí** indicar el **nodo o nombre del frame** en Figma (ej. “Header Fila de Voos”, node 3-8360) para tener contexto.

Si prefieres, podemos definir una plantilla fija (por ejemplo para “header”, “card”, “search block”) y la rellenamos cada vez que sincronices con Figma.
