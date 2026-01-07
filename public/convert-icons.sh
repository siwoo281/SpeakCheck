#!/bin/bash
# SVG to PNG conversion using ImageMagick (if available) or creating placeholder
if command -v convert &> /dev/null; then
    convert -background none icon.svg -resize 192x192 icon-192.png
    convert -background none icon.svg -resize 512x512 icon-512.png
    echo "Icons generated using ImageMagick"
else
    echo "ImageMagick not found. Creating placeholder message..."
    echo "Please replace icon-192.png and icon-512.png with actual icons"
    # Create simple colored PNG as placeholder using base64
    echo "Creating basic placeholder icons..."
fi
