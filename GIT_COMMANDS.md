# 📝 Git Commands Reference - GitHub Actions Setup

## 🚀 Initial Setup Commands

### Clone Repository (jika belum)
```bash
git clone https://github.com/username/NuranantoScanlation.git
cd NuranantoScanlation
```

### Copy GitHub Actions Files
```bash
# Copy folder .github
cp -r /path/to/download/.github .

# Copy support files
cp /path/to/download/.gitignore .
cp /path/to/download/cleanup.sh .

# Make cleanup script executable
chmod +x cleanup.sh
```

## 🗑️ Cleanup Manual Files

### Opsi 1: Gunakan Script
```bash
bash cleanup.sh
# Ketik 'yes' untuk konfirmasi
```

### Opsi 2: Manual Delete
```bash
# Hapus file satu per satu
rm -f force-update-covers.js
rm -f Command_Buat_Download_Cover
rm -f script_js.force-backup
rm -f script.js.backup

# Atau hapus semua sekaligus
rm -f force-update-covers.js Command_Buat_Download_Cover script_js.force-backup script.js.backup
```

## 💾 Commit & Push

### Standard Flow
```bash
# 1. Cek status
git status

# 2. Add files
git add .github/ .gitignore

# 3. Commit dengan message
git commit -m "🤖 Setup GitHub Actions for auto cover update"

# 4. Push ke GitHub
git push origin main
```

### Alternative: Commit All Changes
```bash
# Add semua perubahan (include deleted files)
git add -A

# Commit dengan detailed message
git commit -m "🤖 Setup GitHub Actions & cleanup manual scripts" \
           -m "- Add automated cover update workflow" \
           -m "- Remove manual update scripts" \
           -m "- Add .gitignore for backup files"

# Push
git push
```

## 🔍 Verification Commands

### Cek Workflow File Exists
```bash
# Lihat isi folder .github
ls -la .github/workflows/

# Baca workflow file
cat .github/workflows/update-covers.yml
```

### Cek File Structure
```bash
# Show tree structure
tree -L 3 .github/

# Output expected:
# .github/
# └── workflows/
#     └── update-covers.yml
```

### Cek Git Status
```bash
# Status lengkap
git status

# Status singkat
git status -s

# Cek files yang akan di-commit
git diff --cached --name-only
```

## 📜 History & Logs

### Lihat Commit History
```bash
# Recent commits
git log --oneline -10

# Commits dari bot
git log --author="github-actions[bot]"

# Detailed commit info
git log -1 --stat
```

### Lihat File Changes
```bash
# Perubahan specific file
git log --follow covers/

# Diff between commits
git diff HEAD~1 HEAD
```

## 🔄 Update & Sync

### Update Local Repository
```bash
# Pull latest changes
git pull origin main

# Fetch + merge manually
git fetch origin
git merge origin/main
```

### Sync Fork (jika fork dari repo lain)
```bash
# Add upstream
git remote add upstream https://github.com/original/repo.git

# Fetch upstream
git fetch upstream

# Merge upstream to local
git merge upstream/main

# Push to your fork
git push origin main
```

## 🔧 Fix Common Issues

### Undo Last Commit (Not Pushed)
```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

### Remove File from Staging
```bash
# Remove specific file
git reset HEAD filename

# Remove all files
git reset HEAD
```

### Discard Local Changes
```bash
# Specific file
git checkout -- filename

# All files
git checkout -- .
```

### Fix Commit Message
```bash
# Last commit
git commit --amend -m "New message"

# Push force (if already pushed)
git push --force origin main
```

## 🔀 Branch Management

### Create Feature Branch
```bash
# Create and switch
git checkout -b feature/improve-workflow

# Make changes...
git add .
git commit -m "Improve workflow efficiency"

# Push branch
git push origin feature/improve-workflow
```

### Merge Branch
```bash
# Switch to main
git checkout main

# Merge feature
git merge feature/improve-workflow

# Push
git push origin main

# Delete branch (local)
git branch -d feature/improve-workflow

# Delete branch (remote)
git push origin --delete feature/improve-workflow
```

## 🏷️ Tagging

### Create Tag
```bash
# Lightweight tag
git tag v1.0.0

# Annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag
git push origin v1.0.0

# Push all tags
git push origin --tags
```

### List Tags
```bash
git tag

# With details
git tag -l -n
```

## 🔐 Remote Management

### Check Remotes
```bash
# List remotes
git remote -v

# Show remote info
git remote show origin
```

### Change Remote URL
```bash
# Update URL
git remote set-url origin https://github.com/username/new-repo.git

# Verify
git remote -v
```

## 📊 Statistics

### Repository Stats
```bash
# Commit count by author
git shortlog -sn

# Changes stats
git diff --stat

# File change frequency
git log --pretty=format: --name-only | sort | uniq -c | sort -rg | head -10
```

## 🎯 Useful Aliases

### Setup Git Aliases
```bash
# Status shortcut
git config --global alias.st status

# Log shortcut
git config --global alias.lg "log --oneline --graph --all"

# Commit shortcut
git config --global alias.cm "commit -m"

# Push shortcut
git config --global alias.ps push

# Usage:
git st
git lg
git cm "message"
git ps
```

## 🆘 Emergency Commands

### Recover Deleted File
```bash
# Find the file in history
git log --all --full-history -- "path/to/file"

# Restore from specific commit
git checkout <commit-hash> -- "path/to/file"
```

### Undo Git Push
```bash
# Revert last commit
git revert HEAD

# Push revert
git push origin main
```

### Clean Repository
```bash
# Remove untracked files (dry run)
git clean -n

# Remove untracked files
git clean -f

# Remove untracked files and directories
git clean -fd
```

## 📚 Quick Reference Table

| Command | Description |
|---------|-------------|
| `git status` | Show working tree status |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Commit with message |
| `git push` | Push to remote |
| `git pull` | Fetch + merge |
| `git log` | Show commit history |
| `git diff` | Show changes |
| `git reset` | Undo changes |
| `git checkout` | Switch branches |
| `git branch` | List/manage branches |

## 🔗 Useful Links

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Docs**: https://docs.github.com
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **Oh My Git Game**: https://ohmygit.org/ (Learn Git interactively)

---

**Note**: Replace `main` with `master` if your default branch is `master`.
