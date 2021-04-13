"""OmniLingo Cache Management."""

import gzip
import shutil
from pathlib import Path

import requests
from xdg import xdg_cache_home

__all__ = ("DEFAULT_PATH", "clean", "update")


def _default_path() -> Path:
    p = xdg_cache_home() / "omnilingo"
    p.mkdir(parents=True, exist_ok=True)
    return p


DEFAULT_PATH = _default_path()


def clean(path: Path = DEFAULT_PATH) -> None:
    """Clean the cached language files."""
    for p in path.glob("*"):
        shutil.rmtree(p)


def update(path: Path = DEFAULT_PATH, force: bool = False) -> None:
    """Update the cached language files."""
    if not force and path.is_dir() and len(list(path.glob("*"))):
        return

    dict_path = path / "lib" / "data" / "dict"
    dict_path.mkdir(parents=True, exist_ok=True)

    response = requests.get("https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz")
    with open(dict_path / "zh", "wb") as fh:
        # TODO chunked handling for streaming purposes?
        fh.write(gzip.decompress(response.content))
