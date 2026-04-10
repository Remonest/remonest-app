# Git Workflow & Commit Guidelines

Complete guide for committing, branching, and pushing code to the Remonest repository.

---

## 📋 Table of Contents

1. [Branch Naming Convention](#branch-naming-convention)
2. [Commit Message Format](#commit-message-format)
3. [Commit Examples](#commit-examples)
4. [Commit Workflow](#commit-workflow)
5. [Push & Pull Request Guidelines](#push--pull-request-guidelines)
6. [Code Review Checklist](#code-review-checklist)
7. [Common Git Commands](#common-git-commands)
8. [Best Practices](#best-practices)

---

## 🌿 Branch Naming Convention

### Format

```
<type>/<short-description>
```

### Branch Types

| Type | Purpose | Example |
|------|---------|---------|
| `feature/` | New features or enhancements | `feature/admin-activity-log` |
| `fix/` | Bug fixes | `fix/rls-recursion-error` |
| `docs/` | Documentation updates | `docs/update-rls-guide` |
| `refactor/` | Code refactoring (no behavior change) | `refactor/job-card-types` |
| `style/` | Code style changes (formatting, no logic change) | `style/footer-layout` |
| `test/` | Adding or updating tests | `test/job-actions` |
| `chore/` | Maintenance tasks, dependencies | `chore/update-dependencies` |
| `hotfix/` | Urgent production fixes | `hotfix/auth-crash` |

### Examples

```bash
# Good branch names
feature/admin-activity-log
fix/rls-recursion-error
docs/update-social-icons-guide
refactor/job-card-type-safety
style/footer-responsive-layout
test/admin-actions
chore/upgrade-nextjs
hotfix/login-crash

# Bad branch names (don't do this)
patch-1                  # ❌ Not descriptive
fix-bug                  # ❌ Too vague
my-feature               # ❌ Not specific
update-docs              # ❌ What docs?
```

### Creating Branches

```bash
# Always start from main
git checkout main
git pull origin main

# Create and switch to new branch
git checkout -b feature/admin-activity-log

# Or with descriptive name
git checkout -b fix/rls-recursion-error
```

---

## 📝 Commit Message Format

### Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(admin): add activity log page` |
| `fix` | Bug fix | `fix(jobs): resolve RLS recursion error` |
| `docs` | Documentation only | `docs(rls): add troubleshooting guide` |
| `style` | Code style (formatting, semicolons, etc.) | `style(footer): format social icons` |
| `refactor` | Code refactoring | `refactor(jobs): unify JobData interfaces` |
| `perf` | Performance improvements | `perf(jobs): add index to status column` |
| `test` | Adding/updating tests | `test(admin): add activity log tests` |
| `chore` | Build process, dependencies | `chore: upgrade nextjs to 16.2.2` |

### Scope (Optional but Recommended)

The scope indicates what part of the codebase is affected:

- `admin` - Admin panel features
- `auth` - Authentication system
- `dashboard` - Dashboard pages
- `jobs` - Job board features
- `learning` - Learning modules
- `db` - Database/migrations
- `ui` - UI components
- `docs` - Documentation

### Subject Rules

1. **Use imperative mood**: "add" not "added" or "adds"
2. **Don't capitalize first letter**: "fix bug" not "Fix bug"
3. **No period at the end**: "resolve issue" not "resolve issue."
4. **Keep it short**: Max 72 characters
5. **Be specific**: What changed and why

---

## 💡 Commit Examples

### Good Commits

```bash
# Feature addition
feat(admin): add activity log page with stats dashboard

Create /admin/activity-log page showing all admin actions with:
- Statistics cards (total, approvals, rejections, content changes)
- Activity feed with color-coded badges
- Relative timestamps in Indonesian locale
- Loading skeleton and empty states

Closes #123

# Bug fix
fix(jobs): resolve RLS recursion error in user_profiles

Replace recursive policy queries with SECURITY DEFINER functions:
- Add is_admin(), is_client(), get_user_role() helpers
- Update all 8 tables to use helper functions
- Prevents infinite loop while maintaining security

Fixes infinite recursion detected in policy for relation "user_profiles"

# Documentation
docs(rls): add complete RLS policies guide

- Document all 35+ RLS policies across 8 tables
- Include policy patterns and examples
- Add troubleshooting section for 5 common issues
- Provide security checklist for developers

# Refactoring
refactor(jobs): unify JobData interfaces across components

- Make job_type nullable in all JobData interfaces
- Update DashboardJobCard, EditJobForm, JobCard types
- Add null coalescing for all nullable fields
- Fixes 15+ TypeScript type errors

# Style fix
style(footer): replace generic icons with social media SVGs

- Add custom Twitter bird, LinkedIn "in", Instagram camera icons
- Use currentColor for consistent theming
- Remove X, Link, Camera placeholder icons

# Chore
chore: upgrade nextjs to 16.2.2 and update dependencies
```

### Bad Commits (Don't Do This)

```bash
# ❌ Too vague
git commit -m "fix bug"
git commit -m "update code"
git commit -m "changes"

# ❌ Not imperative
git commit -m "fixed the RLS issue"
git commit -m "added new feature"

# ❌ Too long subject
git commit -m "This commit fixes the issue where the admin activity log page was not loading correctly because of some type errors in the server actions"

# ❌ Mixed concerns
git commit -m "fix RLS error and update docs and add new feature"

# ❌ No context
git commit -m "wip"
git commit -m "asdf"
git commit -m "..."
```

---

## 🔄 Commit Workflow

### Step 1: Check Status

```bash
# See what changed
git status

# Review all changes
git diff HEAD
```

### Step 2: Stage Files

```bash
# Stage specific files
git add src/app/admin/activity-log/page.tsx
git add src/features/admin/actions/activity-log.ts

# Stage all changes in a folder
git add src/app/admin/

# Stage all changes
git add .
```

### Step 3: Review Staged Changes

```bash
# See what you're about to commit
git diff --staged

# Review recent commits for style
git log -n 3
```

### Step 4: Commit

```bash
# Commit with message
git commit -m "feat(admin): add activity log page with stats dashboard"

# Or commit with full message (opens editor)
git commit
```

### Step 5: Push

```bash
# Push to remote (first time needs -u flag)
git push -u origin feature/admin-activity-log

# Subsequent pushes
git push
```

### Step 6: Create Pull Request

1. Go to repository on GitHub/GitLab
2. Click "Compare & pull request"
3. Fill in PR description
4. Request reviews
5. Merge after approval

---

## 📤 Push & Pull Request Guidelines

### Before Pushing

- [ ] All tests pass (`pnpm test` or `pnpm build`)
- [ ] No TypeScript errors
- [ ] Code is formatted (`pnpm lint`)
- [ ] Commits follow message format
- [ ] No secrets or sensitive data committed

### Pull Request Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change)
- [ ] ✨ New feature (non-breaking change)
- [ ] 💥 Breaking change (fix or feature with breaking behavior)
- [ ] 📚 Documentation update

## What Changed
- Added activity log page at /admin/activity-log
- Created server actions for fetching admin actions
- Updated admin sidebar with Activity Log link
- Added comprehensive documentation

## Testing
- [ ] Manual testing completed
- [ ] Build passes (`pnpm build`)
- [ ] No TypeScript errors
- [ ] Tested on different screen sizes

## Screenshots (if UI change)
[Add screenshots here]

## Related Issues
Closes #123
```

### PR Naming Convention

```
<type>(<scope>): <short description>

Examples:
feat(admin): add activity logging system
fix(jobs): resolve RLS recursion error
docs(rls): add complete RLS policies guide
```

---

## 📋 Code Review Checklist

### For Reviewers

#### Code Quality
- [ ] Code follows project conventions
- [ ] Commit messages are clear and descriptive
- [ ] No unnecessary changes
- [ ] Error handling is appropriate
- [ ] Edge cases considered

#### TypeScript
- [ ] Proper type definitions
- [ ] No `any` types (use proper interfaces)
- [ ] Null/undefined handled correctly
- [ ] Interfaces consistent across components

#### Security
- [ ] No secrets or API keys committed
- [ ] RLS policies enforce correct access
- [ ] Input validated server-side
- [ ] SQL injection not possible

#### Performance
- [ ] No N+1 queries
- [ ] Database indexes used
- [ ] Components memoized where needed
- [ ] No unnecessary re-renders

#### Documentation
- [ ] Code commented where complex
- [ ] README/docs updated if needed
- [ ] CHANGELOG updated
- [ ] JSDoc for complex functions

---

## 🛠️ Common Git Commands

### Daily Workflow

```bash
# Start of day - get latest
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/my-feature

# Work, commit, repeat
git add .
git commit -m "feat(scope): add feature"

# Push to remote
git push -u origin feature/my-feature
```

### Undo Changes

```bash
# Unstage file (keep changes)
git reset HEAD <file>

# Discard changes in file (careful!)
git checkout -- <file>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes - DANGEROUS)
git reset --hard HEAD~1

# Amend last commit message
git commit --amend -m "new message"
```

### View History

```bash
# See last 10 commits
git log -n 10 --oneline

# See commit graph
git log --oneline --graph --all

# See changes in specific file
git log --follow <file>

# See who changed what
git blame <file>
```

### Merge Conflicts

```bash
# When merge conflict occurs:
# 1. See conflicted files
git status

# 2. Open files and resolve conflicts (search for <<<<<<<)
# 3. Mark as resolved
git add <resolved-file>

# 4. Complete merge
git commit
```

---

## ✨ Best Practices

### Do's

✅ **Commit often, push when logical unit complete**
```bash
# Good: Small, focused commits
git commit -m "feat(admin): add activity log page"
git commit -m "feat(admin): add server actions"
git commit -m "docs(admin): add activity logging guide"
```

✅ **One logical change per commit**
```bash
# ✅ Good: Related changes together
git add src/app/admin/activity-log/page.tsx
git add src/features/admin/actions/activity-log.ts
git commit -m "feat(admin): add activity log feature"
```

✅ **Test before committing**
```bash
# Always verify build passes
pnpm build
# Then commit
git add .
git commit -m "fix(jobs): resolve type errors"
```

✅ **Use `.gitignore` properly**
```bash
# Never commit:
# - node_modules/
# - .env files
# - .next/
# - *.log
```

### Don'ts

❌ **Don't commit broken code**
```bash
# Build must pass before committing
pnpm build  # Must succeed
```

❌ **Don't commit secrets**
```bash
# Never commit:
# - .env.local
# - API keys
# - Passwords
# - Supabase service role keys
```

❌ **Don't force push to shared branches**
```bash
# Avoid this on main or shared branches
git push --force origin main  # ❌ DANGEROUS
```

❌ **Don't mix unrelated changes**
```bash
# ❌ Bad: Different concerns
git commit -m "fix RLS error and update footer icons and add docs"

# ✅ Good: Separate commits
git commit -m "fix(db): resolve RLS recursion error"
git commit -m "style(footer): replace icons with SVGs"
git commit -m "docs: add social media icons guide"
```

---

## 🚨 Emergency Procedures

### Accidentally Committed Secrets

```bash
# 1. Remove file from git history (requires git-filter-repo or BFG)
# 2. Rotate the exposed secret immediately
# 3. Force push (only if necessary)
git push --force-with-lease
```

### Revert Bad Commit

```bash
# Create revert commit (safest)
git revert <commit-hash>

# Or reset to specific commit (if not pushed)
git reset --hard <commit-hash>
```

### Recover Lost Commits

```bash
# Find lost commits
git reflog

# Recover specific commit
git cherry-pick <commit-hash>
```

---

## 📚 Related Resources

- **[Conventional Commits](https://www.conventionalcommits.org/)** - Commit message standard
- **[Git Documentation](https://git-scm.com/doc)** - Official Git docs
- **[GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)** - Branching workflow

---

**Last Updated:** April 10, 2026  
**Maintained By:** Development Team
