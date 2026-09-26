<div align="center">

# Cutver Release Orchestrator

**Official GitHub Action to automate preflight validation, SemVer bumping, changelog updates, and release notes extraction.**

[![Release](https://img.shields.io/github/v/release/cutver/release?logo=github&color=blue)](https://github.com/cutver/release/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Engine: Node 24](https://img.shields.io/badge/engine-Node%2024-green)](https://nodejs.org)

---

</div>

`cutver/release` orchestrates the complete release lifecycle using the [Cutver](https://github.com/cutver/cutver) CLI. It eliminates manual versioning mistakes, automates Keep-a-Changelog updates, renders dynamic MiniJinja release notes, and commits and tags your releases with zero boilerplate.

## Features

- **Automated SemVer Deduction**: Automatically determines whether to cut a `patch`, `minor`, or `major` release by parsing Conventional Commits since the previous release tag.
- **Fail-Safe Diagnostics (`cutver doctor`)**: Verifies manifest version consistency and detects changelog/tag drift before mutating disk.
- **Dynamic MiniJinja Release Notes**: Renders rich release notes using custom MiniJinja templates (with authors, commit scopes, diff URLs, and categorizations).
- **Flexible Pipeline Modes**: Run the complete end-to-end `release` pipeline, or execute individual sub-steps (`doctor`, `bump`, or `changelog`).
- **Zero Heavy Dependencies**: Bundled with `@vercel/ncc` into a standalone Node 24 action.

---

## Prerequisites

`cutver/release` invokes the system `cutver` binary. Add **[`cutver/setup@v1`](https://github.com/cutver/setup)** before running this action:

```yaml
- name: Setup Cutver CLI
  uses: cutver/setup@v1
```

---

## Quick Start: Complete Release Pipeline

Here is an idiomatic GitHub Actions release workflow that bumps versions, tags the repository, and creates a GitHub Release:

```yaml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write
  id-token: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v7
        with:
          fetch-depth: 0 # Full history required for conventional commit parsing

      - name: Setup Git credentials
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"

      - name: Setup Cutver CLI
        uses: cutver/setup@v1

      - name: Run Cutver Release
        id: cutver
        uses: cutver/release@v1
        with:
          command: release
          bump: auto
          template: .github/templates/cutver/RELEASE.md
          notes-file: RELEASE_NOTES.md

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v3
        with:
          body_path: ${{ steps.cutver.outputs.notes-path }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Command Modes

Choose how `cutver/release` executes by setting the `command` input:

### 1. `command: release` (Default)
Sequentially runs:
1. **`doctor`**: Verifies manifest consistency and checks for tag/changelog drift.
2. **`bump`**: Evaluates commits, bumps manifests, updates changelog, commits, and tags.
3. **`changelog`**: Extracts the generated release notes and saves them to `notes-file` for downstream jobs.

### 2. `command: doctor`
Runs preflight integrity checks without modifying files or Git tags:
```yaml
- name: Run Release Health Check
  uses: cutver/release@v1
  with:
    command: doctor
    check-changelog: true
```

### 3. `command: bump`
Executes version bumping, manifest updates, and git commits/tags without extracting changelog notes:
```yaml
- name: Bump Version
  uses: cutver/release@v1
  with:
    command: bump
    bump: minor
```

### 4. `command: changelog`
Extracts or renders the latest release notes body without bumping versions:
```yaml
- name: Extract Release Notes
  id: notes
  uses: cutver/release@v1
  with:
    command: changelog
    template: .github/templates/cutver/RELEASE.md
```

---

## Action Specification

### Inputs

| Input | Type | Default | Description |
| :--- | :---: | :--- | :--- |
| `command` | `string` | `"release"` | Pipeline execution mode: `"release"`, `"bump"`, `"changelog"`, or `"doctor"`. |
| `bump` | `string` | `"auto"` | Bump strategy: `"auto"`, `"patch"`, `"minor"`, or `"major"`. |
| `config` | `string` | (discovered) | Path to `cutver.toml` or `release.toml`. Auto-discovered when omitted. |
| `dry-run` | `boolean` | `false` | Simulates the bump pipeline without mutating files or Git repository. |
| `skip-preflight` | `string` | (none) | Comma-separated list of preflight verification tasks to bypass. |
| `check-changelog`| `boolean` | `true` | When true, verifies all Git release tags exist in `CHANGELOG.md`. |
| `notes-file` | `string` | `"RELEASE_NOTES.md"` | Output filepath where rendered release notes are saved. |
| `template` | `string` | (standard) | Path to arbitrary MiniJinja template file to format release notes. |

### Outputs

| Output | Description | Example |
| :--- | :--- | :--- |
| `notes-path` | Absolute or relative path to the generated release notes file. | `RELEASE_NOTES.md` |
| `release-notes` | The raw markdown content of the latest generated release notes. | `## ✨ What's Changed...` |

---

## Tips & Best Practices

### Floating Tags in Actions Workflows
When releasing GitHub Actions that use floating major tags (such as `v1`), `cutver doctor` may report tag drift because `v1` is not a full SemVer release entry in `CHANGELOG.md`. To handle floating tags smoothly:
1. Set `check-changelog: "false"` in the release action step.
2. Prune local floating tags before bumping:
   ```bash
   git tag -l | grep -E '^v[0-9]+$' | xargs -r git tag -d
   ```
3. Update and force-push the floating tag after release.

---

## Documentation & Ecosystem

- **Core Engine**: [cutver/cutver](https://github.com/cutver/cutver) — Standalone format-preserving release engine.
- **Setup Action**: [cutver/setup](https://github.com/cutver/setup) — Install and cache Cutver CLI on GitHub Actions runners.
- **Organization Profile**: [cutver/.github](https://github.com/cutver/.github) — Community health and architecture.

---

## License

MIT © [Cutver Authors](https://github.com/cutver/cutver) & [Row0902](https://github.com/Row0902)
