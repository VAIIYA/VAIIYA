---
description: how to manage git and github operations
---

# GitHub Operations Workflow

This workflow provides guidance on how to manage your repository using the terminal or by asking me (Antigravity) to help you.

## Common Tasks

### 1. Syncing with Remote
To pull the latest changes from GitHub and push your local commits:
```bash
git pull origin main
git push origin main
```
Or just ask me: "Sync my latest changes to GitHub."

### 2. Creating a Feature Branch
To start a new feature:
```bash
git checkout -b feature/your-feature-name
```
Or just ask me: "Create a new branch for the user profile feature."

### 3. Creating a Pull Request
Once your changes are committed and pushed, you can create a PR using the GitHub CLI:
```bash
gh pr create --title "Your PR Title" --body "Description of changes"
```
Or just ask me: "Create a PR for my current changes."

### 4. Checking PR Status
To see the status of your PRs:
```bash
gh pr status
```

## Authentication
If you haven't authenticated yet, run:
```bash
gh auth login
```
Follow the prompts (select `GitHub.com`, `HTTPS`, and `Login with a web browser`).
