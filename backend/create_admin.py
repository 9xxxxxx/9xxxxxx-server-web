from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import User
from auth import get_password_hash

def create_admin_user():
    # Ensure tables exist
    create_db_and_tables()
    
    with Session(engine) as session:
        # Check if admin already exists
        statement = select(User).where(User.email == "huangqiannb@gmail.com")
        existing_user = session.exec(statement).first()
        
        if existing_user:
            print("Admin user already exists.")
            return

        # Create new admin user
        hashed_pwd = get_password_hash("wdnmdadmin")
        admin_user = User(
            email="huangqiannb@gmail.com",
            password=hashed_pwd,
            name="Admin User"
        )
        session.add(admin_user)
        session.commit()
        print("Admin user created successfully!")
        print("Email: huangqiannb@gmail.com")
        print("Password: wdnmdadmin")

if __name__ == "__main__":
    create_admin_user()
