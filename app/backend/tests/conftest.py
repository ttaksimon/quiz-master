import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database.database import Base, get_db
from models.user import User
from utils.auth import hash_password

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def test_db():
    """
    Egy új adatbázis létrehozása minden teszthez
    """
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    """
    TestClient létrehozása teszt adatbázissal
    """
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(test_db):
    """
    Teszt felhasználó létrehozása
    """
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash=hash_password("testpassword123"),
        is_admin=False,
        subscription_plan="basic"
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def test_admin(test_db):
    """
    Teszt admin felhasználó létrehozása
    """
    admin = User(
        username="admin",
        email="admin@example.com",
        password_hash=hash_password("adminpassword123"),
        is_admin=True,
        subscription_plan="admin"
    )
    test_db.add(admin)
    test_db.commit()
    test_db.refresh(admin)
    return admin


@pytest.fixture
def auth_headers(client, test_user):
    """
    Hitelesítési fejlécek lekérése teszt felhasználóhoz
    """
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "testpassword123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client, test_admin):
    """
    Hitelesítési fejlécek lekérése admin felhasználóhoz
    """
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
