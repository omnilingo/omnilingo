# Development Environment Setup

## Using poetry

1. [Install poetry](https://python-poetry.org/docs/#installation)
1. `poetry install`
1. `poetry shell`

## Optional: Using direnv and nix

If you're using nix and direnv we have the configuration ready to go minus the
.envrc file you need to kick the process off (you can use another if you prefer
a different layout as well).

The following is the recommend .envrc file:

```
use nix
watch_file nix/shell.nix
watch_file nix/default.nix
watch_file pyproject.toml
watch_file poetry.lock
```

## Use pre-commit

We use pre-commit to encode checks that are also part of our GitHub workflows
that are quick to run and provide some basic feedback on coding style.

To setup pre-commit in your cloned repository simply run the following after
ensuring pre-commit is installed in your environment (automatically handled if
using nix or direnv).

```
pre-commit install --install-hooks
```
