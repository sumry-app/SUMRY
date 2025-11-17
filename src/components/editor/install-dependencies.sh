#!/bin/bash

# SUMRY Rich Text Editor - Dependency Installer
# This script installs all required Tiptap dependencies

echo "======================================"
echo "SUMRY Rich Text Editor Setup"
echo "======================================"
echo ""
echo "Installing Tiptap dependencies..."
echo ""

# Install core Tiptap packages
npm install @tiptap/react @tiptap/starter-kit

# Install Tiptap extensions
npm install @tiptap/extension-underline \
            @tiptap/extension-link \
            @tiptap/extension-table \
            @tiptap/extension-table-row \
            @tiptap/extension-table-cell \
            @tiptap/extension-table-header \
            @tiptap/extension-text-align \
            @tiptap/extension-placeholder \
            @tiptap/extension-character-count

echo ""
echo "======================================"
echo "Installation Complete!"
echo "======================================"
echo ""
echo "The Rich Text Editor is ready to use."
echo ""
echo "Quick Start:"
echo "  import RichTextEditor from './components/editor/RichTextEditor';"
echo ""
echo "Documentation: src/components/editor/README.md"
echo "Examples: src/components/editor/EditorExample.jsx"
echo ""
