-- 创建管理员用户
-- 邮箱: admin@example.com
-- 密码: admin123

INSERT INTO "User" (id, email, password, name, "createdAt", "updatedAt")
VALUES (
  'cm5admin001',
  'admin@example.com',
  '$2b$10$MTyZk4jFC5xHKEye8bPGL.dXfbL4gLt8YL/6mXrinpo5tQPFHhM0O',
  'Admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  "updatedAt" = NOW();
