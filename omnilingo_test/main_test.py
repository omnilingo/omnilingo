"""OmniLingo Main CLI Behaviour Tests."""

from click.testing import CliRunner

import omnilingo.main as sut


def test_main_help() -> None:
    """Test main --help."""
    runner = CliRunner()
    result = runner.invoke(sut.main, ["--help"])
    assert result.exit_code == 0


def test_cache_help() -> None:
    """Test main cache --help."""
    runner = CliRunner()
    result = runner.invoke(sut.main, ["cache", "--help"])
    assert result.exit_code == 0
