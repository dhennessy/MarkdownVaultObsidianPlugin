# A collection of useful scripts to help with the development of the project.
# See https://github.com/casey/just for more information on how to use just.
# Install on a Mac with `brew install just`.

# If everything's installed correctly, run `just --list` to see the available
# commands (called 'recipes' by just).

current-branch := `git rev-parse --abbrev-ref HEAD`
marketing-version := `node -p 'require("./manifest.json").version'`

# Default target (prevent a recipe from being run by accident)
_default:
    @echo "Current plugin version: {{marketing-version}}\n"
    @just --list

# Update version of plugin (specify version as patch/minor/major or x.y.z)
update-version version='patch': _ensure-git-clean (_ensure-git-branch "main")
    npm version {{version}}
    @echo main branch updated to `node -p 'require("./manifest.json").version'`

# Make a release from current `main` branch
make-release: _ensure-git-clean (_ensure-git-branch "main")
    git tag -f -m "" {{marketing-version}}
    git push
    @echo "Release {{marketing-version}} is published."

# Update release from current `main` branch (and move tag)
update-release: _ensure-git-clean (_ensure-git-branch "main") && make-release
    git tag -d {{marketing-version}}
    git push origin --delete {{marketing-version}}

# Helper GIT targets

# Warn and exit if the current git branch is not the one specified (e.g. (ensure-git-branch "main"))
_ensure-git-branch branch:
    #!/usr/bin/env bash
    if [[ `git branch --show-current` != {{branch}} ]]; then
        echo "Warning: This command is intend to be run on the {{branch}} branch"
        exit 1
    fi

# Warn and exit if there are uncommitted git changes (NOTE: use `IGNORE_GIT=1` to skip this check)
_ensure-git-clean:
    #!/usr/bin/env bash
    if [[ `git status --porcelain` ]] && [[ "${IGNORE_GIT}" != "1" ]]; then
        echo "Warning: Project has uncommitted changes. Please commit all changes and try again."
        exit 1
    fi
