from app import create_app

app = create_app()

if __name__ == "__main__":
    # A porta 5000 casa com o API_URL definido em frontend/js/api.js
    app.run(host="0.0.0.0", port=5000, debug=True)
