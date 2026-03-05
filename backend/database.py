import sqlite3
import os

DB_NAME = "users.db"

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    # This ensures the DB is created in the same folder as this script
    conn = sqlite3.connect(DB_NAME)
    # This allows us to access data like user['email'] instead of user[2]
    conn.row_factory = sqlite3.Row  
    return conn

def init_db():
    """Creates the users table if it doesn't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Simple table structure: ID, Name, Email, and Plain-text Password
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database & Users table initialized.")

if __name__ == "__main__":
    # Running 'python database.py' directly will reset/initialize the table
    init_db()