def test_register_farmer(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Rajesh Kumar",
            "email": "rajesh@farm.com",
            "phone": "9876543210",
            "role": "farmer",
            "password": "securepassword",
            "address": "Andhra Pradesh, India",
            "latitude": 16.5,
            "longitude": 80.6,
            "farmer": {
                "farm_name": "Kumar Organic Farms",
                "farm_size": 4.5,
                "experience": 12,
                "certifications": "Organic Agri Board certified",
                "bank_details": "SBI Acc 123456789"
            }
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Rajesh Kumar"
    assert data["role"] == "farmer"
    assert data["farmer_profile"]["farm_name"] == "Kumar Organic Farms"

def test_register_buyer(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "SuperStore Hyderabad",
            "email": "buying@superstore.com",
            "phone": "8765432109",
            "role": "buyer",
            "password": "buyerpassword",
            "address": "Hyderabad, Telangana",
            "latitude": 17.3,
            "longitude": 78.4,
            "buyer": {
                "business_name": "FreshFoods Retail",
                "buyer_type": "supermarket"
            }
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "SuperStore Hyderabad"
    assert data["role"] == "buyer"
    assert data["buyer_profile"]["business_name"] == "FreshFoods Retail"

def test_login(client):
    # Register first
    client.post(
        "/api/auth/register",
        json={
            "name": "Rajesh Kumar",
            "email": "rajesh@farm.com",
            "phone": "9876543210",
            "role": "farmer",
            "password": "securepassword"
        }
    )
    
    # Login
    response = client.post(
        "/api/auth/login",
        data={
            "username": "rajesh@farm.com",
            "password": "securepassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
