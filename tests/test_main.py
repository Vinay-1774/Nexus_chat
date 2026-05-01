from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

payload = {
    "username": "vinay",
    "hashed_password": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "email": "vinaypratap@gmail.com",
    "address": "lukwasa,madhyapradesh",
    "mobile_no": "9857642300",
}


def test_register_user():
    response = client.post("/register", json=payload)
    assert response.status_code == 200
    assert response.json() == {"registered": "successfully"}    