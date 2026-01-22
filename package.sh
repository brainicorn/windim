#!/bin/bash

# Package GNOME Shell Extension for extensions.gnome.org
# This script creates a zip file containing only the necessary extension files

set -e  # Exit on error

# Get the extension UUID from metadata.json
UUID=$(grep -Po '"uuid":\s*"\K[^"]+' metadata.json)

if [ -z "$UUID" ]; then
    echo "Error: Could not find UUID in metadata.json"
    exit 1
fi

# Output filename
OUTPUT="${UUID}.shell-extension.zip"

echo "Packaging extension: $UUID"
echo "Output file: $OUTPUT"

# Remove old zip if it exists
if [ -f "$OUTPUT" ]; then
    echo "Removing existing $OUTPUT"
    rm "$OUTPUT"
fi

# Create the zip file with only the necessary files
zip -r "$OUTPUT" \
    extension.js \
    metadata.json \
    stylesheet.css \
    -x "*.git*" "*.md" "LICENSE" "package.sh"

echo ""
echo "✓ Extension packaged successfully!"
echo "  File: $OUTPUT"
echo ""
echo "You can now upload this file to extensions.gnome.org"
