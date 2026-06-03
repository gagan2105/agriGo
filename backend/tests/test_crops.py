def test_crop_lifecycle(client):
    # 1. Register Farmer
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
    
    # Login Farmer
    login_resp = client.post(
        "/api/auth/login",
        data={"username": "rajesh@farm.com", "password": "securepassword"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create Crop
    crop_resp = client.post(
        "/api/crops/create",
        headers=headers,
        json={
            "crop_name": "Organic Tomatoes",
            "category": "Vegetables",
            "quantity": 500.0,
            "unit": "kg",
            "price_per_unit": 22.0,
            "image_url": "http://example.com/tomatoes.jpg"
        }
    )
    assert crop_resp.status_code == 201
    crop_id = crop_resp.json()["id"]
    
    # 3. Read Crops (Anonymous access permitted)
    list_resp = client.get("/api/crops")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1
    assert list_resp.json()[0]["crop_name"] == "Organic Tomatoes"
    
    # 4. Update Crop
    update_resp = client.put(
        f"/api/crops/update/{crop_id}",
        headers=headers,
        json={"price_per_unit": 25.0}
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["price_per_unit"] == 25.0
    
    # 5. Delete Crop
    delete_resp = client.delete(f"/api/crops/delete/{crop_id}", headers=headers)
    assert delete_resp.status_code == 200
    
    # Verify empty list
    final_resp = client.get("/api/crops")
    assert len(final_resp.json()) == 0

def test_buyer_cannot_create_crop(client):
    # Register Buyer
    client.post(
        "/api/auth/register",
        json={
            "name": "SuperStore Hyderabad",
            "email": "buying@superstore.com",
            "phone": "8765432109",
            "role": "buyer",
            "password": "buyerpassword"
        }
    )
    
    # Login Buyer
    login_resp = client.post(
        "/api/auth/login",
        data={"username": "buying@superstore.com", "password": "buyerpassword"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try to create crop - should be forbidden (RBAC)
    crop_resp = client.post(
        "/api/crops/create",
        headers=headers,
        json={
            "crop_name": "Organic Tomatoes",
            "category": "Vegetables",
            "quantity": 500.0,
            "unit": "kg",
            "price_per_unit": 22.0
        }
    )
    assert crop_resp.status_code == 403
