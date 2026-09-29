# AGENTS.md

Greenfield repo: the DevSecOps CI config, `sonar-project.properties`, and the React + Vite app are scaffolded. See the contracts below for app requirements.

## Workflow convention
Commit and push to `dev-001` automatically whenever changes are made — do not wait to be asked. Use conventional commit subjects (`feat:`, `fix:`, `chore:`, `BREAKING CHANGE`/`!`) so git-control bumps the version correctly.

## App contract enforced by CI (`.github/workflows/auto-merge.yml`)
The `deploy_pages` job runs `npm ci` → `npm run build` on Node 20 and uploads `./dist` to GitHub Pages. Any scaffold must satisfy:
- `npm run build` produces a `dist/` directory (Vite default).
- App source lives under `src/` — Sonar scans `sonar.sources=src`.
- Vite `base` MUST be `'/cicd-pipeline/'`. Pages serves at `https://mcc-mak.github.io/cicd-pipeline/`, not the domain root; the Vite default `base: '/'` silently 404s all assets.
- Test files must match `*.test.ts` / `*.test.tsx` / `*.test.js` to stay excluded from Sonar (`sonar.exclusions`). Use this naming when co-locating tests.
- For future coverage: configure Vitest to emit `coverage/lcov.info` (path is already referenced, commented, in `sonar-project.properties`).
- Use Node 20 locally to match CI.

## Branch / pipeline flow
- Promotion flow: `dev-001` → `dev` → `main` (via PRs). Active work lands on `dev-001`; `main` is the release trunk.
- Push to `dev-001` → `security_checks` (CodeQL JS/TS + SonarQube Cloud + Sonar Quality Gate) → `promote` job (auto-creates & merges PRs). No deploy here.
- `promote` job: after security gate passes, creates a PR `dev-001`→`dev`, waits for the PR's `security_checks` to pass (via `gh pr checks --watch`), merges it (`--merge`), then creates a PR `dev`→`main`, waits for check, merges. Skips promotion if the head branch has no commits ahead of the base. Reuses existing open PR if one already exists. After merging dev→main, triggers `deploy_pages` via `gh workflow run auto-merge.yml --ref main` (workflow_dispatch) because GITHUB_TOKEN pushes don't trigger workflows.
- PR targeting `dev` or `main` → `security_checks` only (this is the gate before each promotion).
- `deploy_pages` runs on main push or `workflow_dispatch` (triggered by `promote`). Builds with `npm ci` → `npm run build`, uploads `dist/` to GitHub Pages.
- Branch protection on `main` → require PR + passing `Security & Quality Gate` (job name shown to GitHub as the check name) before merge. Do NOT require approvals — the `promote` job auto-merges without human review.
- Sonar Quality Gate failure halts the pipeline (the `promote` job's `gh pr checks --watch` will fail and block merge).
- `auto-merge.yml` has concurrency group `auto-merge-${{ github.ref }}` — serializes runs on the same ref. `cancel-in-progress` is true for PR events (new push supersedes old PR run) and false for push/dispatch (don't interrupt a running promotion).
- `auto-merge.yml` and `git-control.yml` both trigger on push to `dev-001` but don't conflict: `git-control` does release automation, `auto-merge` does security + promotion. They run in parallel (separate concurrency groups).
- `auto-merge.yml` push trigger uses `paths-ignore: ['CHANGELOG.md']`, so the git-control release commit (CHANGELOG-only) does NOT re-trigger a redundant scan, and a CHANGELOG-only promotion to main won't redeploy (no app change).

## Git control automation
`.github/workflows/git-control.yml` runs on every push to `dev-001` (and `workflow_dispatch`), using the default `GITHUB_TOKEN` (with `permissions: contents: write`). It bumps the semantic version via conventional commits (`feat`→minor, `fix`/`chore`→patch, `BREAKING CHANGE` or `type!`→major; default patch), prepends a `## X.X.X (date)` section to `CHANGELOG.md`, then commits (`chore(release): X.X.X` + body of entries) and pushes to `dev-001`.
- Current version = topmost `## X.X.X` heading in `CHANGELOG.md`; commit range is bounded by the last `chore(release):` commit.
- Loop guard: exits early when HEAD's subject matches `chore(release): X.X.X`, so its own push does not re-trigger a release. No path filter — runs on any change.
- Concurrency group `git-control-dev-001` serializes runs (no cancel-in-progress).
- Pushes by `GITHUB_TOKEN` do not trigger subsequent workflow runs, so the release commit won't re-trigger `auto-merge.yml`. This is the desired behavior — `auto-merge.yml` also has `paths-ignore: ['CHANGELOG.md']` as a double guard.

## Required secrets & repo settings
`README.md` is the user-facing setup guide — keep it in sync with these. Configure via Repository → Settings:
- `SONAR_TOKEN` (Actions secret) — SonarQube Cloud token; both the scan and quality-gate jobs fail without it.
- Pages → Source = "GitHub Actions" (not a branch).
- Environments → `github-pages` → deployment branch rule = `main` (deploys trigger from `main`).
- Branch protection on `main` → require PR + passing `Security & Quality Gate` before merge. Do NOT require approvals — the `promote` job auto-merges without human review.
- *(Optional)* Email notifications → address + "Approved header" + Active.
- `sonar-project.properties` pins `sonar.projectKey=Mcc-Mak_cicd-pipeline` and `sonar.organization=mcc-mak`. Renaming the repo or transferring org requires updating these and the Sonar project.
