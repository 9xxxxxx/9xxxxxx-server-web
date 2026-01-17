from passlib.context import CryptContext

try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    print("Context created")
    hash = pwd_context.hash("admin123")
    print(f"Hash created: {hash}")
    verify = pwd_context.verify("admin123", hash)
    print(f"Verify result: {verify}")
except Exception as e:
    import traceback
    traceback.print_exc()
