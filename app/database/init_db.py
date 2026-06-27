"""Initialize MySQL database and tables. Run: python -m app.database.init_db"""

from app.database.db import MYSQL_DATABASE, ensure_database_exists


def main():
    print(f"Connecting to MySQL and setting up database '{MYSQL_DATABASE}'...")
    ensure_database_exists()
    print(f"Success! Database '{MYSQL_DATABASE}' is ready.")


if __name__ == "__main__":
    main()
