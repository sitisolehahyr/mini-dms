def register_user(client, email: str, full_name: str = "User", password: str = "Password123!") -> str:
    response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": full_name, "password": password},
    )
    assert response.status_code == 200
    return response.json()["data"]["access_token"]


def test_document_list_pagination_and_search(client):
    token = register_user(client, "uploader@example.com", full_name="Uploader")
    headers = {"Authorization": f"Bearer {token}"}

    for idx in range(1, 6):
        response = client.post(
            "/api/v1/documents/upload",
            headers=headers,
            data={
                "title": f"Quarter Report {idx}",
                "description": f"Financial summary for quarter {idx}",
                "document_type": "REPORT" if idx % 2 == 0 else "MEMO",
            },
            files={"file": (f"report_{idx}.txt", b"sample content", "text/plain")},
        )
        assert response.status_code == 200

    list_response = client.get(
        "/api/v1/documents?page=1&page_size=2",
        headers=headers,
    )
    assert list_response.status_code == 200
    data = list_response.json()["data"]
    assert len(data["items"]) == 2
    assert data["meta"]["total"] == 5
    assert data["meta"]["total_pages"] == 3

    search_response = client.get(
        "/api/v1/documents?page=1&page_size=10&search=Quarter%20Report%203",
        headers=headers,
    )
    assert search_response.status_code == 200
    search_items = search_response.json()["data"]["items"]
    assert len(search_items) == 1
    assert search_items[0]["title"] == "Quarter Report 3"

    filter_response = client.get(
        "/api/v1/documents?page=1&page_size=10&document_type=REPORT",
        headers=headers,
    )
    assert filter_response.status_code == 200
    filter_items = filter_response.json()["data"]["items"]
    assert len(filter_items) == 2
