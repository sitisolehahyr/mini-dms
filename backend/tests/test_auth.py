def test_register_and_login(client):
    register_payload = {
        "email": "user1@example.com",
        "full_name": "User One",
        "password": "Password123!",
    }
    register_response = client.post("/api/v1/auth/register", json=register_payload)
    assert register_response.status_code == 200
    data = register_response.json()["data"]
    assert data["access_token"]
    assert data["user"]["email"] == register_payload["email"]
    assert "hashed_password" not in data["user"]

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )
    assert login_response.status_code == 200
    login_data = login_response.json()["data"]
    assert login_data["access_token"]

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {login_data['access_token']}"},
    )
    assert me_response.status_code == 200
    me_data = me_response.json()["data"]
    assert me_data["email"] == register_payload["email"]
