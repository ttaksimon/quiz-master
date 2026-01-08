import pytest
from fastapi import status
import json


@pytest.fixture
def sample_quiz_for_game(client, auth_headers):
    """Kvíz létrehozása játék teszteléséhez"""
    quiz_data = {
        "title": "Game Test Quiz",
        "description": "Quiz for game testing",
        "questions": [
            {
                "question_type": "single_choice",
                "question_text": "What is 5 + 5?",
                "options": ["8", "9", "10", "11"],
                "correct_answer": "2",
                "time_limit": 30,
                "points": 10,
                "speed_bonus": True
            }
        ]
    }
    response = client.post("/api/quizzes/", headers=auth_headers, json=quiz_data)
    return response.json()


class TestGameCreation:
    """Teszt játék létrehozása"""
    
    def test_create_game_success(self, client, auth_headers, sample_quiz_for_game):
        """Teszt sikeres játék létrehozása"""
        quiz_id = sample_quiz_for_game["id"]
        response = client.post(
            "/api/game/create",
            headers=auth_headers,
            json={"quiz_id": quiz_id}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "game_code" in data
        assert len(data["game_code"]) == 6
    
    def test_create_game_unauthenticated(self, client, sample_quiz_for_game):
        """Teszt játék létrehozása hitelesítés nélkül"""
        quiz_id = sample_quiz_for_game["id"]
        response = client.post(
            "/api/game/create",
            json={"quiz_id": quiz_id}
        )
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
    
    def test_create_game_invalid_quiz(self, client, auth_headers):
        """Teszt játék létrehozása nem létező kvízzel"""
        response = client.post(
            "/api/game/create",
            headers=auth_headers,
            json={"quiz_id": 99999}
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_create_game_not_owner(self, client, sample_quiz_for_game, test_db):
        """Teszt játék létrehozása nem tulajdonos által"""
        from models.user import User
        from utils.auth import hash_password
        
        other_user = User(
            username="gameuser",
            email="gameuser@example.com",
            password_hash=hash_password("password123"),
            is_admin=False,
            subscription_plan="basic"
        )
        test_db.add(other_user)
        test_db.commit()
        
        login_response = client.post(
            "/api/auth/login",
            json={"email": "gameuser@example.com", "password": "password123"}
        )
        other_token = login_response.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}
        
        quiz_id = sample_quiz_for_game["id"]
        response = client.post(
            "/api/game/create",
            headers=other_headers,
            json={"quiz_id": quiz_id}
        )
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]


class TestGameInfo:
    """Teszt játék információ lekérése"""
    
    def test_get_game_info_success(self, client, auth_headers, sample_quiz_for_game):
        """Teszt játék információ lekérése sikeresen"""
        quiz_id = sample_quiz_for_game["id"]
        create_response = client.post(
            "/api/game/create",
            headers=auth_headers,
            json={"quiz_id": quiz_id}
        )
        game_code = create_response.json()["game_code"]
        
        response = client.get(f"/api/game/session/{game_code}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["game_code"] == game_code
        assert data["status"] == "waiting"
        assert "player_count" in data
        assert "total_questions" in data
    
    def test_get_game_info_not_found(self, client, auth_headers):
        """Teszt játék információ lekérése nem létező játékhoz"""
        response = client.get("/api/game/session/NOTFOUND", headers=auth_headers)
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]


class TestCurrentQuestion:
    """Teszt aktuális kérdés lekérése"""
    
    def test_get_current_question_no_question(self, client, auth_headers, sample_quiz_for_game):
        """Teszt aktuális kérdés lekérése, amikor nincs aktív kérdés"""
        quiz_id = sample_quiz_for_game["id"]
        create_response = client.post(
            "/api/game/create",
            headers=auth_headers,
            json={"quiz_id": quiz_id}
        )
        game_code = create_response.json()["game_code"]
        
        response = client.get(f"/api/game/current-question/{game_code}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["question"] is None
        assert "message" in data
    
    def test_get_current_question_invalid_game(self, client):
        """Teszt aktuális kérdés lekérése nem létező játékhoz"""
        response = client.get("/api/game/current-question/INVALID")
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestLeaderboard:
    """Teszt ranglista lekérése"""
    
    def test_get_leaderboard_success(self, client, auth_headers, sample_quiz_for_game):
        """Teszt ranglista lekérése sikeresen"""
        quiz_id = sample_quiz_for_game["id"]
        create_response = client.post(
            "/api/game/create",
            headers=auth_headers,
            json={"quiz_id": quiz_id}
        )
        game_code = create_response.json()["game_code"]
        
        response = client.get(f"/api/game/leaderboard/{game_code}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "leaderboard" in data
        assert isinstance(data["leaderboard"], list)
    
    def test_get_leaderboard_not_found(self, client):
        """Teszt ranglista lekérése nem létező játékhoz"""
        response = client.get("/api/game/leaderboard/NOTFOUND")
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestStartQuestion:
    """Teszt kérdés indítása"""
    
    def test_start_question_success(self, client, auth_headers, sample_quiz_for_game):
        """Teszt sikeres kérdés indítása"""
        quiz_id = sample_quiz_for_game["id"]
        create_response = client.post(
            "/api/game/create",
            headers=auth_headers,
            json={"quiz_id": quiz_id}
        )
        game_code = create_response.json()["game_code"]
        
        response = client.post(
            "/api/game/start-question",
            headers=auth_headers,
            json={"game_code": game_code, "question_index": 0}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert data["question_index"] == 0
    
    def test_start_question_unauthorized(self, client, sample_quiz_for_game, auth_headers, test_db):
        """Teszt kérdés indítása nem házigazda által"""
        from models.user import User
        from utils.auth import hash_password
        
        quiz_id = sample_quiz_for_game["id"]
        create_response = client.post(
            "/api/game/create",
            headers=auth_headers,
            json={"quiz_id": quiz_id}
        )
        game_code = create_response.json()["game_code"]
        
        other_user = User(
            username="player",
            email="player@example.com",
            password_hash=hash_password("password123"),
            is_admin=False,
            subscription_plan="basic"
        )
        test_db.add(other_user)
        test_db.commit()
        
        login_response = client.post(
            "/api/auth/login",
            json={"email": "player@example.com", "password": "password123"}
        )
        other_token = login_response.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}
        
        response = client.post(
            "/api/game/start-question",
            headers=other_headers,
            json={"game_code": game_code, "question_index": 0}
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestFinishQuestion:
    """Teszt kérdés befejezése"""
    
    def test_finish_question_success(self, client, auth_headers, sample_quiz_for_game):
        """Teszt sikeres kérdés befejezése"""
        quiz_id = sample_quiz_for_game["id"]
        create_response = client.post(
            "/api/game/create",
            headers=auth_headers,
            json={"quiz_id": quiz_id}
        )
        game_code = create_response.json()["game_code"]
        
        client.post(
            "/api/game/start-question",
            headers=auth_headers,
            json={"game_code": game_code, "question_index": 0}
        )
        
        response = client.post(
            "/api/game/finish-question",
            headers=auth_headers,
            json={"game_code": game_code}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "results" in data
        assert "leaderboard" in data
    
    def test_finish_question_unauthorized(self, client, auth_headers, sample_quiz_for_game, test_db):
        """Teszt kérdés befejezése nem házigazda által"""
        from models.user import User
        from utils.auth import hash_password
        
        quiz_id = sample_quiz_for_game["id"]
        create_response = client.post(
            "/api/game/create",
            headers=auth_headers,
            json={"quiz_id": quiz_id}
        )
        game_code = create_response.json()["game_code"]
        
        client.post(
            "/api/game/start-question",
            headers=auth_headers,
            json={"game_code": game_code, "question_index": 0}
        )
        
        other_user = User(
            username="player2",
            email="player2@example.com",
            password_hash=hash_password("password123"),
            is_admin=False,
            subscription_plan="basic"
        )
        test_db.add(other_user)
        test_db.commit()
        
        login_response = client.post(
            "/api/auth/login",
            json={"email": "player2@example.com", "password": "password123"}
        )
        other_token = login_response.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}
        
        response = client.post(
            "/api/game/finish-question",
            headers=other_headers,
            json={"game_code": game_code}
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
