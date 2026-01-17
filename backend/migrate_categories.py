"""Database migration to add availableCategories column to SiteConfig"""
from sqlmodel import Session, text
from database import engine

def migrate():
    with Session(engine) as session:
        # Check if column exists
        try:
            session.exec(text("SELECT availableCategories FROM siteconfig LIMIT 1"))
            print("Column already exists")
        except:
            # Add the column with default value
            session.exec(text("""
                ALTER TABLE siteconfig 
                ADD COLUMN "availableCategories" TEXT DEFAULT '["Tech", "Design", "Life"]'
            """))
            session.commit()
            print("Added availableCategories column")

if __name__ == "__main__":
    migrate()
