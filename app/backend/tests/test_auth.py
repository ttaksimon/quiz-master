import pytest
from fastapi import status


class TestRegistration:
    """Teszt regisztráció"""
    
    def test_register_success(self, client):
        """Sikeres felhasználó regisztráció tesztelése"""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "password123",
                "password_confirm": "password123"
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert "password" not in data
    
    def test_register_password_mismatch(self, client):
        """Teszt regisztráció eltérő jelszavakkal"""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "password123",
                "password_confirm": "different123"
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "jelszavak nem egyeznek" in response.json()["detail"].lower()
    
    def test_register_password_too_short(self, client):
        """Teszt regisztráció rövidebb, mint 8 karakteres jelszóval"""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "short",
                "password_confirm": "short"
            }
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_register_duplicate_email(self, client, test_user):
        """Teszt regisztráció már létező email címmel"""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "anotheruser",
                "email": "test@example.com",  # Already exists
                "password": "password123",
                "password_confirm": "password123"
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.json()["detail"].lower() and "regisztrálva" in response.json()["detail"].lower()
    
    def test_register_duplicate_username(self, client, test_user):
        """Teszt regisztráció már létező felhasználónévvel"""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "testuser",  # Already exists
                "email": "another@example.com",
                "password": "password123",
                "password_confirm": "password123"
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "felhasználónév" in response.json()["detail"].lower() and "foglalt" in response.json()["detail"].lower()
    
    def test_register_invalid_email(self, client):
        """Teszt regisztráció érvénytelen email formátummal"""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "not-an-email",
                "password": "password123",
                "password_confirm": "password123"
            }
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestLogin:
    """Teszt felhasználói bejelentkezés"""
    
    def test_login_success(self, client, test_user):
        """Sikeres bejelentkezés tesztelése"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpassword123"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_email(self, client):
        """Teszt bejelentkezés nem létező email címmel"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert ("helytelen" in response.json()["detail"].lower() or "hibás" in response.json()["detail"].lower()) and "email" in response.json()["detail"].lower()
    
    def test_login_invalid_password(self, client, test_user):
        """Teszt bejelentkezés helytelen jelszóval"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert ("helytelen" in response.json()["detail"].lower() or "hibás" in response.json()["detail"].lower()) and ("jelszó" in response.json()["detail"].lower() or "password" in response.json()["detail"].lower())


class TestMe:
    """Teszt aktuális felhasználó végpont"""
    
    def test_me_authenticated(self, client, auth_headers, test_user):
        """Teszt aktuális felhasználó adatainak lekérése hitelesítve"""
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["is_admin"] is False
    
    def test_me_unauthenticated(self, client):
        """Teszt aktuális felhasználó adatainak lekérése hitelesítés nélkül"""
        response = client.get("/api/auth/me")
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]


class TestChangePassword:
    """Teszt jelszóváltoztatás funkció"""
    
    def test_change_password_success(self, client, auth_headers):
        """Sikeres jelszóváltoztatás tesztelése"""
        response = client.put(
            "/api/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "testpassword123",
                "new_password": "newpassword123",
                "confirm_password": "newpassword123"
            }
        )
        assert response.status_code == status.HTTP_200_OK

        response_data = response.json()
        assert "username" in response_data
        assert response_data["username"] == "testuser"
        
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "newpassword123"
            }
        )
        assert login_response.status_code == status.HTTP_200_OK
    
    def test_change_password_wrong_current(self, client, auth_headers):
        """Teszt jelszóváltoztatás helytelen jelenlegi jelszóval"""
        response = client.put(
            "/api/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "wrongpassword",
                "new_password": "newpassword123",
                "confirm_password": "newpassword123"
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "helytelen" in response.json()["detail"].lower() and "jelenlegi" in response.json()["detail"].lower()
    
    def test_change_password_mismatch(self, client, auth_headers):
        """Teszt jelszóváltoztatás eltérő új jelszavakkal"""
        response = client.put(
            "/api/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "testpassword123",
                "new_password": "newpassword123",
                "confirm_password": "differentpassword123"
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "nem egyeznek" in response.json()["detail"].lower()
    
    def test_change_password_too_short(self, client, auth_headers):
        """Teszt jelszóváltoztatás 8 karakternél rövidebb jelszóval"""
        response = client.put(
            "/api/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "testpassword123",
                "new_password": "short",
                "confirm_password": "short"
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "8 karakter" in response.json()["detail"]
    
    def test_change_password_unauthenticated(self, client):
        """Teszt jelszóváltoztatás hitelesítés nélkül"""
        response = client.put(
            "/api/auth/change-password",
            json={
                "current_password": "testpassword123",
                "new_password": "newpassword123",
                "confirm_password": "newpassword123"
            }
        )
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
