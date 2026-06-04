#!/bin/bash

set -e

echo "Cleaning dist directory..."
rm -rf ./dist
mkdir -p ./dist

echo "Building with Babel..."
yarn babel src --out-dir dist --extensions ".ts" --source-maps

echo "Generating TypeScript declarations..."
yarn tsc --emitDeclarationOnly --declaration --declarationMap --outDir dist

echo "Build completed successfully!"

