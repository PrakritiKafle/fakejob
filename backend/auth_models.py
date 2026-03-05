from database import get_db_connection

def create_user(name, email, password):
    try:
        conn = get_db_connection()
        # Consistently lowercase the email before saving
        clean_email = email.lower().strip()
        
        conn.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            (name, clean_email, password)
        )
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ DB Signup Error: {e}")
        return False

def authenticate_user(email, password):
    conn = get_db_connection()
    # Consistently lowercase the email before searching
    clean_email = email.lower().strip()
    
    user = conn.execute(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        (clean_email, password)
    ).fetchone()
    conn.close()
    return user