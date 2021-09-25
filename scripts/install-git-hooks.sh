#!/bin/bash

set -euo pipefail

if [ "${CI:-}" != "true" ]; then
  git config core.hooksPath .githooks
fi
