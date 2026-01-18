import os
import sys
from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import User
from auth import get_password_hash

def create_initial_admin(email: str = "admin@example.com", password: str = "admin123"):
    # Ensure tables and columns exist
    create_db_and_tables()
    
    with Session(engine) as session:
        # Check if any user exists
        existing_user = session.exec(select(User)).first()
        if existing_user:
            print("Users already exist in the database. Skipping admin creation.")
            return

        print(f"Creating initial admin user: {email}")
        hashed_password = get_password_hash(password)
        admin_user = User(
            email=email,
            password=hashed_password,
            name=email.split("@")[0],
            fullName="Administrator"
        )
        session.add(admin_user)
        session.commit()
        print("Admin user created successfully.")

if __name__ == "__main__":
    # Get email/password from args if provided
    email = sys.argv[1] if len(sys.argv) > 1 else "admin@example.com"
    password = sys.argv[2] if len(sys.argv) > 2 else "admin123"
    
    create_initial_admin(email, password)
