from sqlmodel import SQLModel, create_engine, Session
import os
from sqlalchemy import text

# SQLite database file
SQLITE_FILE_NAME = "database.db"
# Allow overriding DB path via env var (for persistence on server)
SQLITE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{SQLITE_FILE_NAME}")

connect_args = {"check_same_thread": False}
engine = create_engine(SQLITE_URL, echo=True, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    
    # 数据库迁移: 为现有的 Post 和 Project 表添加 visibility 列
    with Session(engine) as session:
        try:
            # 检查是否需要添加 visibility 列到 post 表
            session.exec(text("ALTER TABLE post ADD COLUMN visibility TEXT DEFAULT 'public'"))
            session.commit()
            print("[Migration] Added visibility column to post table")
        except Exception as e:
            session.rollback()
            # 列可能已存在,忽略错误
            if "duplicate column name" not in str(e).lower():
                print(f"[Migration] post visibility: {e}")
        
        try:
            # 检查是否需要添加 visibility 列到 project 表
            session.exec(text("ALTER TABLE project ADD COLUMN visibility TEXT DEFAULT 'public'"))
            session.commit()
            print("[Migration] Added visibility column to project table")
        except Exception as e:
            session.rollback()
            if "duplicate column name" not in str(e).lower():
                print(f"[Migration] project visibility: {e}")
        
        # 用户表迁移: 添加 fullName 和 avatar 列
        try:
            session.exec(text("ALTER TABLE user ADD COLUMN fullName TEXT"))
            session.commit()
            print("[Migration] Added fullName column to user table")
        except Exception as e:
            session.rollback()
            if "duplicate column name" not in str(e).lower():
                print(f"[Migration] user fullName error: {e}")
        
        try:
            session.exec(text("ALTER TABLE user ADD COLUMN avatar TEXT"))
            session.commit()
            print("[Migration] Added avatar column to user table")
        except Exception as e:
            session.rollback()
            if "duplicate column name" not in str(e).lower():
                print(f"[Migration] user avatar error: {e}")
        
        # 这种方式是为了防止 SQLModel 在某些环境下没有自动创建表
        session.commit()

def get_session():
    with Session(engine) as session:
        yield session
