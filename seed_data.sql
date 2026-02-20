-- Seed data: Criar Super Admin
INSERT INTO "platform_users" (id, email, "passwordHash", role, "isActive", "createdAt")
VALUES (
    gen_random_uuid()::text,
    'admin@plataforma.com',
    '$2a$10$rK7vUo8Y8R8q0o0o0o0oOuHbA5XQ1qYYYoYnqYYYQqYYQYYYQYYYQ',
    'SUPER_ADMIN',
    true,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
