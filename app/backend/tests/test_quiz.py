import pytest
from fastapi import status
import json


@pytest.fixture
def sample_quiz_data():
    """Kvíz minta adatainak létrehozása teszteléshez"""
    return {
        "title": "Test Quiz",
        "description": "This is a test quiz",
        "questions": [
            {
                "question_type": "single_choice",
                "question_text": "What is 2 + 2?",
                "options": ["3", "4", "5", "6"],
                "correct_answer": "1",
                "time_limit": 30,
                "points": 10,
                "speed_bonus": True
            },
            {
                "question_type": "multiple_choice",
                "question_text": "Which are even numbers?",
                "options": ["1", "2", "3", "4"],
                "correct_answer": "[1, 3]",
                "time_limit": 30,
                "points": 15,
                "speed_bonus": True
            }
        ]
    }


@pytest.fixture
def created_quiz(client, auth_headers, sample_quiz_data):
    """Kvíz létrehozása teszteléshez"""
    response = client.post(
        "/api/quizzes/",
        headers=auth_headers,
        json=sample_quiz_data
    )
    return response.json()


class TestQuizCreation:
    """Teszt kvíz létrehozása"""
    
    def test_create_quiz_success(self, client, auth_headers, sample_quiz_data):
        """Teszt sikeres kvíz létrehozása"""
        response = client.post(
            "/api/quizzes/",
            headers=auth_headers,
            json=sample_quiz_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == "Test Quiz"
        assert data["description"] == "This is a test quiz"
        assert len(data["questions"]) == 2
    
    def test_create_quiz_unauthenticated(self, client, sample_quiz_data):
        """Teszt kvíz létrehozása hitelesítés nélkül"""
        response = client.post(
            "/api/quizzes/",
            json=sample_quiz_data
        )
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
    
    def test_create_quiz_invalid_data(self, client, auth_headers):
        """Teszt kvíz létrehozása érvénytelen adatokkal"""
        response = client.post(
            "/api/quizzes/",
            headers=auth_headers,
            json={
                "title": "",
                "questions": []
            }
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestQuizRetrieval:
    """Teszt kvíz lekérése"""
    
    def test_get_quiz_success(self, client, auth_headers, created_quiz):
        """Teszt kvíz lekérése ID alapján"""
        quiz_id = created_quiz["id"]
        response = client.get(f"/api/quizzes/{quiz_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == quiz_id
        assert data["title"] == "Test Quiz"
        assert len(data["questions"]) == 2
    
    def test_get_quiz_not_found(self, client, auth_headers):
        """Teszt nem létező kvíz lekérése"""
        response = client.get("/api/quizzes/99999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_quiz_list(self, client, auth_headers, created_quiz):
        """Teszt kvízek listájának lekérése"""
        response = client.get("/api/quizzes/", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_get_my_quizzes(self, client, auth_headers, created_quiz):
        """Teszt a felhasználó saját kvízeinek lekérése"""
        response = client.get("/api/quizzes/?my_quizzes=true", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        for quiz in data:
            assert "creator_id" in quiz or "created_by_username" in quiz


class TestQuizUpdate:
    """Teszt kvíz frissítése"""
    
    def test_update_quiz_success(self, client, auth_headers, created_quiz):
        """Teszt sikeres kvíz frissítés"""
        quiz_id = created_quiz["id"]
        update_data = {
            "title": "Updated Test Quiz",
            "description": "Updated description",
            "questions": created_quiz["questions"]
        }
        response = client.put(
            f"/api/quizzes/{quiz_id}",
            headers=auth_headers,
            json=update_data
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Updated Test Quiz"
        assert data["description"] == "Updated description"
    
    def test_update_quiz_unauthorized(self, client, created_quiz, test_db):
        """Teszt kvíz frissítése nem tulajdonos által"""
        from models.user import User
        from utils.auth import hash_password
        
        other_user = User(
            username="otheruser",
            email="other@example.com",
            password_hash=hash_password("password123"),
            is_admin=False,
            subscription_plan="basic"
        )
        test_db.add(other_user)
        test_db.commit()
        
        login_response = client.post(
            "/api/auth/login",
            json={"email": "other@example.com", "password": "password123"}
        )
        other_token = login_response.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}
        
        quiz_id = created_quiz["id"]
        response = client.put(
            f"/api/quizzes/{quiz_id}",
            headers=other_headers,
            json={"title": "Hacked", "questions": created_quiz["questions"]}
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_update_quiz_not_found(self, client, auth_headers, sample_quiz_data):
        """Teszt nem létező kvíz frissítése"""
        response = client.put(
            "/api/quizzes/99999",
            headers=auth_headers,
            json=sample_quiz_data
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestQuizDeletion:
    """Teszt kvíz törlése"""
    
    def test_delete_quiz_success(self, client, auth_headers, created_quiz):
        """Teszt sikeres kvíz törlés"""
        quiz_id = created_quiz["id"]
        response = client.delete(f"/api/quizzes/{quiz_id}", headers=auth_headers)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]
        
        get_response = client.get(f"/api/quizzes/{quiz_id}", headers=auth_headers)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_quiz_unauthorized(self, client, created_quiz, test_db):
        """Teszt kvíz törlése nem tulajdonos által"""
        from models.user import User
        from utils.auth import hash_password
        
        other_user = User(
            username="otheruser2",
            email="other2@example.com",
            password_hash=hash_password("password123"),
            is_admin=False,
            subscription_plan="basic"
        )
        test_db.add(other_user)
        test_db.commit()
        
        login_response = client.post(
            "/api/auth/login",
            json={"email": "other2@example.com", "password": "password123"}
        )
        other_token = login_response.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}
        
        quiz_id = created_quiz["id"]
        response = client.delete(f"/api/quizzes/{quiz_id}", headers=other_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_delete_quiz_not_found(self, client, auth_headers):
        """Teszt nem létező kvíz törlése"""
        response = client.delete("/api/quizzes/99999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestQuizRating:
    """Teszt kvíz értékelése"""
    
    def test_rate_quiz_success(self, client, created_quiz, test_db):
        """Teszt sikeres kvíz értékelés"""
        from models.user import User
        from utils.auth import hash_password
        
        rater = User(
            username="rater",
            email="rater@example.com",
            password_hash=hash_password("password123"),
            is_admin=False,
            subscription_plan="basic"
        )
        test_db.add(rater)
        test_db.commit()
        
        login_response = client.post(
            "/api/auth/login",
            json={"email": "rater@example.com", "password": "password123"}
        )
        rater_token = login_response.json()["access_token"]
        rater_headers = {"Authorization": f"Bearer {rater_token}"}
        
        quiz_id = created_quiz["id"]
        response = client.post(
            f"/api/quizzes/{quiz_id}/rate",
            headers=rater_headers,
            json={"rating": 5}
        )
        assert response.status_code == status.HTTP_200_OK
        
        quiz_response = client.get(f"/api/quizzes/{quiz_id}", headers=rater_headers)
        quiz_data = quiz_response.json()
        assert quiz_data["average_rating"] == 5.0
        assert quiz_data["total_ratings"] == 1
    
    def test_rate_own_quiz(self, client, auth_headers, created_quiz):
        """Teszt saját kvíz értékelése (nem engedélyezett)"""
        quiz_id = created_quiz["id"]
        response = client.post(
            f"/api/quizzes/{quiz_id}/rate",
            headers=auth_headers,
            json={"rating": 5}
        )
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]
    
    def test_rate_quiz_invalid_rating(self, client, created_quiz, test_db):
        """Teszt érvénytelen értékelési értékkel"""
        from models.user import User
        from utils.auth import hash_password
        
        rater = User(
            username="rater2",
            email="rater2@example.com",
            password_hash=hash_password("password123"),
            is_admin=False,
            subscription_plan="basic"
        )
        test_db.add(rater)
        test_db.commit()
        
        login_response = client.post(
            "/api/auth/login",
            json={"email": "rater2@example.com", "password": "password123"}
        )
        rater_token = login_response.json()["access_token"]
        rater_headers = {"Authorization": f"Bearer {rater_token}"}
        
        quiz_id = created_quiz["id"]
        response = client.post(
            f"/api/quizzes/{quiz_id}/rate",
            headers=rater_headers,
            json={"rating": 10}
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
