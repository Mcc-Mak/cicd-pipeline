# cicd-pipeline

DevSecOps + compliance-check CI pipeline demo. A React + Vite app is built and deployed to GitHub Pages, gated by CodeQL (SAST) and SonarQube Cloud (SCA + quality).

## Repository setup

1. **Actions secrets** — Settings → Secrets and variables → Actions → Repository secrets:
   - `GIT_PUSH_TOKEN` — GitHub classic PAT (Account → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (classic)) with scopes: `repo`, `workflow`, `admin:org`, `user`, `project`. Used by the git-control automation to push to `dev-001`.
   - `SONAR_TOKEN` — SonarQube Cloud project token: https://sonarcloud.io/project/information?id=Mcc-Mak_cicd-pipeline
2. **Pages source** — Settings → Pages → Source → **GitHub Actions**.
3. **github-pages environment** — Settings → Environments → `github-pages` → Add deployment branch or tag rule → Name pattern: `main` → Add rule.
4. **Branch protection on `main`** — Settings → Branches → Add rule for `main` → require PR + passing `Security & Quality Gate` before merge (the deploy runs on main push with no in-workflow gate, so the PR-time gate enforces it).
5. *(Optional)* **Email notifications** — Settings → Email notifications → Address + Approved header + Active → Setup notifications.

## Git control flow (automated)

On any push to `dev-001`, the pipeline bumps the semantic version using conventional commits (`feat`→minor, `fix`/`chore`→patch, `BREAKING CHANGE`/`!`→major; default patch), prepends a `## X.X.X (date)` section to `CHANGELOG.md`, creates a conventional commit (`chore(release): X.X.X` + entry body), and pushes `dev-001` to remote using `GIT_PUSH_TOKEN`. Its own release commit is loop-guarded so it does not re-trigger.

## Pipeline

- Promotion flow: `dev-001` → `dev` → `main` (via PRs).
- Push to `dev-001` → Security & Quality Gate (CodeQL JS/TS + SonarQube Cloud + Sonar Quality Gate). No deploy.
- PR to `dev` or `main` → security job (the gate before each promotion).
- Push to `main` → deploy `dist/` to GitHub Pages (React + Vite, `base: /cicd-pipeline/`).
- The git-control release commit (CHANGELOG-only) is skipped by this workflow via `paths-ignore`.
