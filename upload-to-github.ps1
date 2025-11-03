# Upload IBBA Roster Form to GitHub
# This script uses GitHub CLI to upload files

Write-Host "🚀 Uploading IBBA Roster Form to GitHub..." -ForegroundColor Green

# Make sure we're authenticated
Write-Host "`n📝 Step 1: Checking GitHub authentication..." -ForegroundColor Yellow
gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not authenticated. Please run: gh auth login" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Authenticated!" -ForegroundColor Green

# Create a temporary branch with all our files
Write-Host "`n📦 Step 2: Creating upload branch..." -ForegroundColor Yellow
$branchName = "modular-refactor-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git checkout -b $branchName

# Commit all files
Write-Host "`n💾 Step 3: Committing all files..." -ForegroundColor Yellow
git add .
git commit -m "Refactor: Modular architecture with separate CSS and JS modules"

# Push to new branch
Write-Host "`n⬆️  Step 4: Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin $branchName

# Create pull request
Write-Host "`n📬 Step 5: Creating pull request..." -ForegroundColor Yellow
gh pr create --title "Refactor: Split into modular architecture" `
    --body "## 🎯 Changes`n`n- Split 2,927-line file into modular components`n- Separate CSS file`n- 9 focused JavaScript modules`n- Fixed EmailJS with correct credentials`n- Added debugging tools`n`n## 📦 New Structure:`n- css/styles.css`n- js/ (9 modules)`n- test-email.html`n- Clean index.html" `
    --base main `
    --head $branchName

Write-Host "`n✅ Done! Check your GitHub repository for the pull request." -ForegroundColor Green
Write-Host "👉 Go to: https://github.com/uriroiz/ibba-club-roster-form/pulls" -ForegroundColor Cyan

