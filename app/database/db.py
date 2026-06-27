from urllib.parse import quote_plus
import os

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import declarative_base, sessionmaker

from app.utils.config import (
    DATABASE_URL,
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_PORT,
    MYSQL_USER,
)


def ensure_database_exists() -> None:
    admin_url = (
        f"mysql+pymysql://{MYSQL_USER}:{quote_plus(MYSQL_PASSWORD)}@{MYSQL_HOST}:"
        f"{MYSQL_PORT}/"
    )
    admin_engine = create_engine(
        admin_url,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False,
    )
    with admin_engine.connect() as connection:
        connection.execute(
            text(
                f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DATABASE}` "
                f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        )
        connection.commit()
    admin_engine.dispose()


def run_schema_migrations(db_engine) -> None:
    try:
        inspector = inspect(db_engine)
        
        # 1. Migrate exams table
        if "exams" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("exams")]
            with db_engine.begin() as conn:
                if "positive_marks" not in columns:
                    conn.execute(text("ALTER TABLE exams ADD COLUMN positive_marks FLOAT DEFAULT 4.0;"))
                if "negative_marks" not in columns:
                    conn.execute(text("ALTER TABLE exams ADD COLUMN negative_marks FLOAT DEFAULT -1.0;"))
                    
        # 2. Migrate questions table
        if "questions" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("questions")]
            with db_engine.begin() as conn:
                if "difficulty" not in columns:
                    conn.execute(text("ALTER TABLE questions ADD COLUMN difficulty VARCHAR(50) DEFAULT 'Medium';"))
                if "marks" not in columns:
                    conn.execute(text("ALTER TABLE questions ADD COLUMN marks FLOAT DEFAULT 4.0;"))
                if "negative_marks" not in columns:
                    conn.execute(text("ALTER TABLE questions ADD COLUMN negative_marks FLOAT DEFAULT -1.0;"))
                if "time" not in columns:
                    conn.execute(text("ALTER TABLE questions ADD COLUMN time INTEGER DEFAULT 60;"))
                if "topic" not in columns:
                    conn.execute(text("ALTER TABLE questions ADD COLUMN topic VARCHAR(200);"))

        # 3. Seed default admin user if table is empty
        # 3. Seed default admin user if not exists
        if "users" in inspector.get_table_names():
            from app.utils.password_hash import hash_password
            hashed = hash_password("yash1234")
            with db_engine.connect() as conn:
                res = conn.execute(text("SELECT id FROM users WHERE email='yash12@gmail.com'")).fetchone()
                if not res:
                    conn.execute(
                        text("INSERT INTO users (name, email, password, role) VALUES ('Yash', 'yash12@gmail.com', :pwd, 'admin')"),
                        {"pwd": hashed}
                    )
                    conn.commit()
    except Exception as e:
        print(f"Schema migration error: {e}")

if MYSQL_HOST in ("localhost", "127.0.0.1"):
    ensure_database_exists()

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)

run_schema_migrations(engine)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()