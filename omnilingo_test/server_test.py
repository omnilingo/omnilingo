"""OmniLingo Flask Server Tests."""

from typing import Generator

import flask.testing
import pytest

import omnilingo.server as sut


@pytest.fixture
def client() -> Generator[None, None, None]:
    """Generate pytest fixture for flask application client."""
    sut.APPLICATION.config["TESTING"] = True

    with sut.APPLICATION.test_client() as client:
        yield client


def test_request_index(client: flask.testing.FlaskClient) -> None:
    """Ensure that index.html is requestable."""
    response = client.get("/index.html")
    assert response.status_code == 200


def test_request_favicon(client: flask.testing.FlaskClient) -> None:
    """Ensure that favicon.ico is requestable."""
    response = client.get("/favicon.ico")
    assert response.status_code == 200
