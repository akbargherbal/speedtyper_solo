#!/bin/bash

echo "🗑️  Removing SQLite database..."
rm -f packages/back-nest/speedtyper-local.db

if [ $? -eq 0 ]; then
    echo "✅ Database reset complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Run 'npm run dev' to recreate the database"
    echo "  2. Run 'npm run reimport' to reload your snippets"
else
    echo "❌ Failed to remove database file"
    exit 1
fi