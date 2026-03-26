/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env");

function normalizeEnvValue(rawValue) {
  return rawValue.replace(/^['"]|['"]$/g, "").trim();
}

function toExpoEnvContent(sourceContent) {
  const lines = sourceContent.split(/\r?\n/);
  const envEntries = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    if (trimmedLine.includes("=")) {
      const [rawKey, ...rawValueParts] = trimmedLine.split("=");
      const key = rawKey.trim();
      if (!key.startsWith("EXPO_PUBLIC_")) {
        continue;
      }

      const value = normalizeEnvValue(rawValueParts.join("="));
      if (!value) {
        continue;
      }

      envEntries.push(`${key}=${value}`);
      continue;
    }

    if (trimmedLine.includes(":")) {
      const [rawKey, ...rawValueParts] = trimmedLine.split(":");
      const key = rawKey.trim();
      if (!key.startsWith("EXPO_PUBLIC_")) {
        continue;
      }

      const value = normalizeEnvValue(rawValueParts.join(":"));
      if (!value) {
        continue;
      }

      envEntries.push(`${key}=${value}`);
    }
  }

  return envEntries.join("\n");
}

function setupEnv() {
  if (fs.existsSync(envPath)) {
    console.log("✅ .env already exists, skipping creation.");
    return;
  }

  const envName = process.env.environment;
  if (!envName) {
    console.warn('⚠️ "environment" env var not set. Skipping .env generation.');
    return;
  }

  const sourcePath = path.join(rootDir, "deploy", "env", `${envName}.yaml`);
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠️ ${path.relative(rootDir, sourcePath)} not found. Skipping .env generation.`);
    return;
  }

  try {
    const sourceContent = fs.readFileSync(sourcePath, "utf8");
    const expoEnvContent = toExpoEnvContent(sourceContent);
    if (!expoEnvContent) {
      console.warn(`⚠️ No EXPO_PUBLIC_* variables found in ${path.relative(rootDir, sourcePath)}. Skipping .env generation.`);
      return;
    }

    fs.writeFileSync(envPath, `${expoEnvContent}\n`, "utf8");
    console.log(`✅ .env file created from ${path.relative(rootDir, sourcePath)} with EXPO_PUBLIC_* variables.`);
  } catch (err) {
    console.error("❌ Failed to create .env:", err);
    process.exitCode = 1;
  }
}

setupEnv();
