from app.core.enums import UserRole
from app.core.security import get_password_hash
from app.models.user import User


def register_user(client, email: str, full_name: str = "User", password: str = "Password123!") -> str:
    response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": full_name, "password": password},
    )
    assert response.status_code == 200
    return response.json()["data"]["access_token"]


def create_admin_user(db_session):
    admin = User(
        email="admin@example.com",
        full_name="Admin User",
        hashed_password=get_password_hash("Admin123!"),
        role=UserRole.ADMIN,
    )
    db_session.add(admin)
    db_session.commit()


def login_admin(client) -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "Admin123!"},
    )
    assert response.status_code == 200
    return response.json()["data"]["access_token"]


def upload_document(client, token: str) -> int:
    response = client.post(
        "/api/v1/documents/upload",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "title": "Policy",
            "description": "Internal policy",
            "document_type": "POLICY",
        },
        files={"file": ("policy.txt", b"v1", "text/plain")},
    )
    assert response.status_code == 200
    return response.json()["data"]["id"]


def test_replace_and_delete_review_flow(client, db_session):
    create_admin_user(db_session)
    admin_token = login_admin(client)
    user_token = register_user(client, "user2@example.com", full_name="User Two")

    doc_id = upload_document(client, user_token)

    replace_response = client.post(
        f"/api/v1/documents/{doc_id}/replace-request",
        headers={"Authorization": f"Bearer {user_token}"},
        data={"expected_version": "1", "note": "Please replace with v2"},
        files={"file": ("policy_v2.txt", b"v2", "text/plain")},
    )
    assert replace_response.status_code == 200
    replace_request_id = replace_response.json()["data"]["request"]["id"]

    pending_response = client.get(
        "/api/v1/permission-requests?status=PENDING",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert pending_response.status_code == 200
    assert any(item["id"] == replace_request_id for item in pending_response.json()["data"]["items"])

    approve_replace = client.post(
        f"/api/v1/permission-requests/{replace_request_id}/review",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"decision": "APPROVE", "note": "Looks good"},
    )
    assert approve_replace.status_code == 200

    document_after_replace = client.get(
        f"/api/v1/documents/{doc_id}",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert document_after_replace.status_code == 200
    replaced = document_after_replace.json()["data"]
    assert replaced["version"] == 2
    assert replaced["status"] == "ACTIVE"

    delete_response = client.post(
        f"/api/v1/documents/{doc_id}/delete-request",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"expected_version": 2, "note": "No longer needed"},
    )
    assert delete_response.status_code == 200
    delete_request_id = delete_response.json()["data"]["request"]["id"]

    reject_delete = client.post(
        f"/api/v1/permission-requests/{delete_request_id}/review",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"decision": "REJECT", "note": "Keep it"},
    )
    assert reject_delete.status_code == 200

    document_after_reject = client.get(
        f"/api/v1/documents/{doc_id}",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert document_after_reject.status_code == 200
    assert document_after_reject.json()["data"]["status"] == "ACTIVE"

    delete_response_2 = client.post(
        f"/api/v1/documents/{doc_id}/delete-request",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"expected_version": 2, "note": "Delete now"},
    )
    assert delete_response_2.status_code == 200
    delete_request_id_2 = delete_response_2.json()["data"]["request"]["id"]

    approve_delete = client.post(
        f"/api/v1/permission-requests/{delete_request_id_2}/review",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"decision": "APPROVE", "note": "Approved"},
    )
    assert approve_delete.status_code == 200

    missing_doc_response = client.get(
        f"/api/v1/documents/{doc_id}",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert missing_doc_response.status_code == 404
