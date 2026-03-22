# ============================================
# Setup Script: GCS → Supabase + Vercel
# ============================================
# Run from project root in PowerShell:
# powershell -ExecutionPolicy Bypass -File setup-deployment.ps1

Write-Host "🚀 Match-Maker Free Deployment Setup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json") -or -not (Test-Path "artifacts")) {
    Write-Host "❌ Error: Run this script from the project root" -ForegroundColor Red
    exit 1
}

# Step 1: Backup current files
Write-Host "📦 Backing up current configuration..." -ForegroundColor Yellow
if (-not (Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups" | Out-Null
}

if (Test-Path "artifacts/api-server/src/lib/objectStorage.ts") {
    Copy-Item "artifacts/api-server/src/lib/objectStorage.ts" "backups/objectStorage.gcs.backup.ts" -Force
}
if (Test-Path ".env") {
    Copy-Item ".env" "backups/.env.backup.txt" -Force
}
Write-Host "   ✅ Backups saved to .\backups" -ForegroundColor Green

# Step 2: Update storage service
Write-Host ""
Write-Host "🔄 Replacing storage service..." -ForegroundColor Yellow
if (Test-Path "artifacts/api-server/src/lib/objectStorage.supabase.ts") {
    Copy-Item "artifacts/api-server/src/lib/objectStorage.supabase.ts" "artifacts/api-server/src/lib/objectStorage.ts" -Force
    Write-Host "   ✅ Switched to Supabase storage service" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  objectStorage.supabase.ts not found" -ForegroundColor Yellow
}

# Step 3: Update dependencies
Write-Host ""
Write-Host "📚 Installing new dependencies..." -ForegroundColor Yellow
Push-Location "artifacts/api-server"

Write-Host "   Removing Google Cloud Storage dependencies..." -ForegroundColor Gray
pnpm remove @google-cloud/storage google-auth-library 2>$null | Out-Null

Write-Host "   Adding Supabase dependencies..." -ForegroundColor Gray
pnpm add @supabase/supabase-js `@supabase/storage-js | Out-Null
Write-Host "   ✅ Dependencies updated" -ForegroundColor Green

Pop-Location

# Step 4: Create .env template
Write-Host ""
Write-Host "📝 Creating environment template..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "   ✅ Created .env from template" -ForegroundColor Green
        Write-Host "   ⚠️  Important: Edit .env with your Supabase credentials!" -ForegroundColor Yellow
    }
}

# Step 5: Verify configuration files
Write-Host ""
Write-Host "✔️  Verifying deployment files..." -ForegroundColor Yellow
$files = @("vercel.json", ".env.example", "DEPLOYMENT_GUIDE.md", "CHANGES_CHECKLIST.md")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing: $file" -ForegroundColor Red
    }
}

# Step 6: Git configuration
Write-Host ""
Write-Host "🔒 Securing sensitive files..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $content = Get-Content ".gitignore" -Raw
    if ($content -notlike "*\.env*") {
        Add-Content ".gitignore" ".env"
        Write-Host "   ✅ Added .env to .gitignore" -ForegroundColor Green
    }
} else {
    Add-Content ".gitignore" ".env"
    Write-Host "   ✅ Created .gitignore with .env" -ForegroundColor Green
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env with your Supabase credentials"
Write-Host "2. Read DEPLOYMENT_GUIDE.md for full instructions"
Write-Host "3. Review CHANGES_CHECKLIST.md for what changed"
Write-Host "4. Test locally: pnpm run dev"
Write-Host "5. Push to GitHub and connect to Vercel"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - DEPLOYMENT_GUIDE.md"
Write-Host "   - CHANGES_CHECKLIST.md"
Write-Host ""
Write-Host "💾 Backups saved to: .\backups\" -ForegroundColor Cyan
Write-Host ""
