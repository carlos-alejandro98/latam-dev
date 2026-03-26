#!/bin/bash

set -euo pipefail

YAML_FILE="${APP_ENV_FILE:-./deploy/env/dev.yaml}"
ENV_FILE=".env"
ENV_EXAMPLE_FILE=".env.example"
REQUIRED_ENV_KEY="EXPO_PUBLIC_API_BASE_URL"

write_env_from_runtime_variables() {
  local runtime_written=0
  : > "$ENV_FILE"

  while IFS='=' read -r key value; do
    if [[ "$key" == EXPO_PUBLIC_* ]] && [ -n "$value" ]; then
      printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
      runtime_written=1
    fi
  done < <(env)

  if [ "$runtime_written" -eq 1 ]; then
    echo "Variables EXPO_PUBLIC_* copied from runtime environment to $ENV_FILE."
    return 0
  fi

  return 1
}

write_env_from_yaml() {
  : > "$ENV_FILE"

  while IFS=':' read -r raw_key raw_value; do
    key=$(echo "$raw_key" | xargs)
    value=$(echo "$raw_value" | xargs)

    if [[ "$key" == \#* ]] || [ -z "$key" ] || [ -z "$value" ]; then
      continue
    fi

    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//')
    key=$(echo "$key" | tr '[:lower:]' '[:upper:]')
    printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
  done < "$YAML_FILE"

  echo "Variables from $YAML_FILE have been added to $ENV_FILE."
}

if [ -f "$YAML_FILE" ]; then
  write_env_from_yaml
else
  echo "Warning: $YAML_FILE not found."

  if write_env_from_runtime_variables; then
    :
  elif [ -f "$ENV_EXAMPLE_FILE" ]; then
    cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
    echo "Fallback applied: $ENV_FILE created from $ENV_EXAMPLE_FILE."
  else
    echo "Error: No environment source available (missing $YAML_FILE, EXPO_PUBLIC_* variables, and $ENV_EXAMPLE_FILE)."
    exit 1
  fi
fi

if ! grep -q "^${REQUIRED_ENV_KEY}=" "$ENV_FILE"; then
  echo "Error: ${REQUIRED_ENV_KEY} is missing in $ENV_FILE."
  exit 1
fi
