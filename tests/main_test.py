from unittest.mock import patch

from starlette.testclient import TestClient

from config.settings import Settings
from src.main import app

client = TestClient(app=app)


def test_authorization():
    response = client.get("/docs")
    assert response.status_code == 200

    response = client.get("/", headers={"Authorization": ""})
    assert response.status_code == 401

    response = client.get(
        "/", headers={"Authorization": f"Bearer {Settings.AUTH_KEY.value}"}
    )
    assert response.status_code == 404
