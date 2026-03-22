#!/bin/bash
# ============================================
# Setup Script: GCS → Supabase + Vercel
# ============================================
# This script helps prepare your project for free deployment
# Run from project root: bash setup-deployment.sh

set -e

echo "🚀 Match-Maker Free Deployment Setup"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "artifacts" ]; then
    echo "❌ Error: Run this script from the project root"
    exit 1
fi

# Step 1: Backup current files
echo "📦 Backing up current configuration..."
mkdir -p backups
cp artifacts/api-server/src/lib/objectStorage.ts backups/objectStorage.gcs.backup.ts || true
cp .env backups/.env.backup.txt || true
echo "   ✅ Backups saved to /backups"

# Step 2: Update storage service
echo ""
echo "🔄 Replacing storage service..."
if [ -f "artifacts/api-server/src/lib/objectStorage.supabase.ts" ]; then
    cp artifacts/api-server/src/lib/objectStorage.supabase.ts artifacts/api-server/src/lib/objectStorage.ts
    echo "   ✅ Switched to Supabase storage service"
else
    echo "   ⚠️  objectStorage.supabase.ts not found"
fi

# Step 3: Update dependencies
echo ""
echo "📚 Installing new dependencies..."
cd artifacts/api-server
echo "   Removing Google Cloud Storage dependencies..."
pnpm remove @google-cloud/storage google-auth-library || true
echo "   Adding Supabase dependencies..."
pnpm add @supabase/supabase-js @supabase/storage-js
echo "   ✅ Dependencies updated"
cd ../..

# Step 4: Create .env template
echo ""
echo "📝 Creating environment template..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "   ✅ Created .env from template"
    echo "   ⚠️  Important: Edit .env with your Supabase credentials!"
fi

# Step 5: Verify configuration files
echo ""
echo "✔️  Verifying deployment files..."
files_to_check=("vercel.json" ".env.example" "DEPLOYMENT_GUIDE.md" "CHANGES_CHECKLIST.md")
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ Missing: $file"
    fi
done

# Step 6: Git configuration
echo ""
echo "🔒 Securing sensitive files..."
if ! grep -q ".env" .gitignore; then
    echo ".env" >> .gitignore
    echo "   ✅ Added .env to .gitignore"
fi

echo ""
echo "===================================="
echo "✅ Setup Complete!"
echo "===================================="
echo ""
echo "📋 Next Steps:"
echo "1. Edit .env with your Supabase credentials"
echo "2. Read DEPLOYMENT_GUIDE.md for full instructions"
echo "3. Review CHANGES_CHECKLIST.md for what changed"
echo "4. Test locally: pnpm run dev"
echo "5. Push to GitHub and connect to Vercel"
echo ""
echo "📚 Documentation:"
echo "   - DEPLOYMENT_GUIDE.md"
echo "   - CHANGES_CHECKLIST.md"
echo ""
echo "💾 Backups saved to: ./backups/"
echo ""
