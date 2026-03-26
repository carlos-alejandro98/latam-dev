#!/usr/bin/env node
/**
 * Exporta un nodo de Figma a JSON (estructura, estilos, tamaños).
 * Uso: FIGMA_TOKEN=tu_token node scripts/figma-export-node.mjs [nodeId]
 * Ejemplo para nodo 3-8360: node scripts/figma-export-node.mjs 3:8360
 *
 * El node-id de la URL (3-8360) en la API se usa con dos puntos: 3:8360
 * Obtén tu token en: Figma → Settings → Account → Personal access tokens
 */

const FIGMA_FILE_KEY = 'PKAbknheDZsH0jtLsaK47Z';
const nodeIdFromUrl = process.argv[2];
const NODE_ID = nodeIdFromUrl ? nodeIdFromUrl.replace('-', ':') : '3:8373';

const token = process.env.FIGMA_TOKEN;
if (!token) {
  console.error(
    'Pasa tu token: FIGMA_TOKEN=xxx node scripts/figma-export-node.mjs',
  );
  process.exit(1);
}

const url = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/nodes?ids=${encodeURIComponent(NODE_ID)}`;
const res = await fetch(url, {
  headers: { 'X-Figma-Token': token },
});

if (!res.ok) {
  console.error('Error', res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
console.log(JSON.stringify(data, null, 2));
