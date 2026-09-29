# Changelog

All notable changes to this project are documented here. Versions follow semver.

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

