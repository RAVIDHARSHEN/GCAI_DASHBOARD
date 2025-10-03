# models.py
import sqlite3

DB_FILE = "gcaiphase1.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS news (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    headline TEXT,
                    source TEXT,
                    timestamp TEXT,
                    category TEXT,
                    bias TEXT
                )''')
    conn.commit()
    conn.close()
