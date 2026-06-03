def test_order_placement_and_inventory_reduction(client):
    # 1. Register and login Farmer
    client.post(
        "/api/auth/register",
        json={"name": "Farmer Rajesh", "email": "rajesh@farm.com", "phone": "9876543210", "role": "farmer", "password": "password123"}
    )
    farmer_login = client.post("/api/auth/login", data={"username": "rajesh@farm.com", "password": "password123"})
    farmer_token = farmer_login.json()["access_token"]
    
    # Farmer creates a crop (500 kg available)
    crop_resp = client.post(
        "/api/crops/create",
        headers={"Authorization": f"Bearer {farmer_token}"},
        json={
            "crop_name": "Alphonso Mangoes",
            "category": "Fruits",
            "quantity": 500.0,
            "unit": "kg",
            "price_per_unit": 120.0
        }
    )
    crop_id = crop_resp.json()["id"]

    # 2. Register and login Buyer
    client.post(
        "/api/auth/register",
        json={"name": "Buyer Ramesh", "email": "ramesh@buy.com", "phone": "8765432109", "role": "buyer", "password": "buyerpassword"}
    )
    buyer_login = client.post("/api/auth/login", data={"username": "ramesh@buy.com", "password": "buyerpassword"})
    buyer_token = buyer_login.json()["access_token"]
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    # 3. Place order for 200 kg
    order_resp = client.post(
        "/api/orders/create",
        headers=buyer_headers,
        json={
            "items": [{"crop_id": crop_id, "quantity": 200.0}],
            "method": "upi"
        }
    )
    assert order_resp.status_code == 201
    order_data = order_resp.json()
    assert order_data["total_amount"] == 200 * 120.0
    assert order_data["payment_status"] == "paid"
    
    # 4. Check crop inventory reduction
    crop_check = client.get(f"/api/crops/{crop_id}")
    assert crop_check.json()["quantity"] == 300.0  # 500 - 200 = 300

    # 5. Placing order exceeding remaining inventory (300 kg) should fail
    exceed_resp = client.post(
        "/api/orders/create",
        headers=buyer_headers,
        json={
            "items": [{"crop_id": crop_id, "quantity": 400.0}],
            "method": "upi"
        }
    )
    assert exceed_resp.status_code == 400
    assert "Insufficient inventory" in exceed_resp.json()["detail"]
