# Changelog

All notable changes to this project are documented here. Versions follow semver.

## 2.0.2 (2026-09-29)

### Other
- one-time Sonar main branch analysis workflow

## 2.0.1 (2026-09-29)

### Other
- docs: add SonarCloud quality gate badge to README

## 2.0.0 (2026-09-29)

### Breaking
- Breaking change introduced in this release

### Other
- refactor: merge auto-merge.yml + git-control.yml into single ci-cd.yml

## 1.1.5 (2026-09-29)

### Fixed
- use PROMOTE_TOKEN (PAT) for promote job — GITHUB_TOKEN PRs don't trigger workflows

## 1.1.4 (2026-09-29)

### Fixed
- wait for 'Security & Quality Gate' check specifically before gh pr checks --watch

## 1.1.3 (2026-09-29)

### Fixed
- gh pr create on runner doesn't support --json flag, use gh pr list instead

## 1.1.2 (2026-09-29)

### Fixed
- make Sonar scan PR-only (free plan doesn't cover dev-001 branch analysis)

## 1.1.1 (2026-09-29)

### Fixed
- update deprecated actions (CodeQL v3→v4, SonarQube scan v5→v6)

## 1.1.0 (2026-09-29)

### Added
- add auto-promote job (dev-001 → dev → main via auto-merged PRs)

## 1.0.0 (2026-09-29)

### Breaking
- Breaking change introduced in this release

### Added
- scaffold React+Vite app to satisfy CI contracts
- add DevSecOps CI workflows and project docs

### Fixed
- replace GIT_PUSH_TOKEN with default GITHUB_TOKEN
- actionable error message for unconfigured quality gate
- quality gate check with fallback to projectKey and error diagnostics
- custom Sonar quality gate check with organization parameter
- add SONAR_HOST_URL to scan and quality gate steps
- use sonarqube-quality-gate-action@v1 (v2 does not exist)

### Other
- add sonar.host.url to sonar-project.properties
- note auto commit/push convention in AGENTS.md
- Initial commit

