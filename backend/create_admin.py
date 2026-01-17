from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import User
from auth import get_password_hash

def create_admin_user():
    # Ensure tables exist
    create_db_and_tables()
    
    with Session(engine) as session:
        # Check if admin already exists
        statement = select(User).where(User.email == "admin@example.com")
        existing_user = session.exec(statement).first()
        
        if existing_user:
            print("Admin user already exists.")
            return

        # Create new admin user
        hashed_pwd = get_password_hash("admin123")
        admin_user = User(
            email="admin@example.com",
            password=hashed_pwd,
            name="Admin User"
        )
        session.add(admin_user)
        session.commit()
        print("Admin user created successfully!")
        print("Email: admin@example.com")
        print("Password: admin123")

if __name__ == "__main__":
    create_admin_user()
