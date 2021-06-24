"""OmniLingo CLI Interface."""

from pathlib import Path

import click

import omnilingo.cache as _cache
import omnilingo.server as server


@click.group()
@click.option(
    "--cache-path",
    type=lambda x: Path(click.Path(exists=True, file_okay=False, writable=True)(x)),
    default=_cache.DEFAULT_PATH,
    help="Path to cache directory.",
)
@click.pass_context
def main(ctx: click.Context, cache_path: Path) -> None:
    """Omnilingo Control Commands."""
    ctx.obj = cache_path


@main.command()
@click.option(
    "--port",
    type=click.IntRange(0, 65535),
    default=5002,
    help="Port for web server to listen on.",
    envvar="FLASK_PORT",
)
@click.option("--host", default="127.0.0.1", help="IP Aaddress for web server to listen on.")
@click.pass_obj
def serve(cache_path: Path, port: int, host: str) -> None:
    """Start Web Server."""
    languages = [p.name for p in Path("cache/").glob("*") if ".voc" not in p.name]
    click.echo(f"[languages] {languages}")
    _cache.update(path=cache_path)
    server.APPLICATION.run(port=port, host=host)


@main.command()
@click.option("--update/--no-update", "-u", is_flag=True, default=False, help="Update the cache if outdated.")
@click.option("--force/--no-force", "-f", is_flag=True, default=False, help="Force the action even if not needed.")
@click.option("--clean/--no-clean", is_flag=True, default=False, help="Clean up the cache directory leaving it empty.")
@click.pass_obj
def cache(cache_path: Path, update: bool, force: bool, clean: bool) -> None:
    """Control Language Cache Files."""
    if update:
        _cache.update(path=cache_path, force=force)
    if clean:
        _cache.clean(path=cache_path)
