# cicd-pipeline

DevSecOps + compliance-check CI pipeline demo. A React + Vite app is built and deployed to GitHub Pages, gated by CodeQL (SAST) and SonarQube Cloud (SCA + quality).

## Repository setup

1. **Actions secrets** — Settings → Secrets and variables → Actions → Repository secrets:
   - `SONAR_TOKEN` — SonarQube Cloud project token: https://sonarcloud.io/project/information?id=Mcc-Mak_cicd-pipeline
2. **Pages source** — Settings → Pages → Source → **GitHub Actions**.
3. **github-pages environment** — Settings → Environments → `github-pages` → Add deployment branch or tag rule → Name pattern: `main` → Add rule.
4. **Branch protection on `main`** — Settings → Branches → Add rule for `main` → require PR + passing `Security & Quality Gate` before merge. Do NOT require approvals (the `promote` job auto-merges without human review).
5. *(Optional)* **Email notifications** — Settings → Email notifications → Address + Approved header + Active → Setup notifications.

## Git control flow (automated)

On any push to `dev-001`, the pipeline bumps the semantic version using conventional commits (`feat`→minor, `fix`/`chore`→patch, `BREAKING CHANGE`/`!`→major; default patch), prepends a `## X.X.X (date)` section to `CHANGELOG.md`, creates a conventional commit (`chore(release): X.X.X` + entry body), and pushes `dev-001` to remote using the built-in `GITHUB_TOKEN`. Its own release commit is loop-guarded so it does not re-trigger.

## Pipeline

- Promotion flow: `dev-001` → `dev` → `main` (via PRs).
- Push to `dev-001` → `security_checks` (CodeQL JS/TS + SonarQube Cloud + Sonar Quality Gate) → `promote` (auto-creates & merges PRs dev-001→dev and dev→main, then triggers deploy). No deploy directly from dev-001.
- `promote` job creates a PR, waits for its `security_checks` to pass (`gh pr checks --watch`), then merges. Skips if no commits ahead. Reuses existing open PR.
- After merging dev→main, triggers `deploy_pages` via `gh workflow run` (workflow_dispatch) because GITHUB_TOKEN pushes don't trigger workflows.
- PR to `dev` or `main` → `security_checks` only (gate before each promotion).
- Push to `main` or `workflow_dispatch` → `deploy_pages` deploys `dist/` to GitHub Pages (React + Vite, `base: /cicd-pipeline/`).
- The git-control release commit (CHANGELOG-only) is skipped by this workflow via `paths-ignore`.
- Branch protection on `main`: require PR + passing `Security & Quality Gate`. Do NOT require approvals (automated promotion).
