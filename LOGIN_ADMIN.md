# 🔐 Como Fazer Login de Super Admin

## Super Admin

- **Email**: admin@teste.com
- **Senha**: admin123

Use o link **"Entrar"** na página inicial (não o "Cadastrar").

## Como Funciona os 3 Tipos de Login:

### 1. SUPER_ADMIN
- Acessa via `/login` com **email e senha**
- Credenciais: admin@teste.com / admin123
- Vai para: `/dashboard/admin`

### 2. ORG_ADMIN  
- Acessa via `/login` com **email e senha**
- Vinculado a uma organização
- Vai para: `/dashboard/organization`

### 3. END_USER
- Acessa via `/register` com **CPF e senha** (primeira vez)
- Ou via `/login` com CPF e senha (se já tem conta)
- Vai para: `/dashboard/user`

## Fluxo de Autenticação

Quando você faz login em `/login`:

1. Sistema busca usuário no banco (`platform_users`)
2. Verifica a senha
3. Gera JWT com o **role** do usuário
4. Redireciona para o dashboard correto:
   - `SUPER_ADMIN` → `/dashboard/admin`
   - `ORG_ADMIN` → `/dashboard/organization`
   - `END_USER` → `/dashboard/user` (se logar com CPF)

## Criar Super Admin

Execute:

```bash
docker exec -i presenca-postgres psql -U postgres -d presenca_eventos -c "INSERT INTO platform_users (id, email, passwordHash, role, isActive, createdAt) VALUES (gen_random_uuid()::text, 'seu@email.com', '\$2a\$10\$/.5LINBLFkIpkVmtC取证取证evl5.AlhgDNOuppCYLCszfvMF7hmAEKQBWFS', 'SUPER_ADMIN', true, CURRENT_TIMESTAMP) ON CONFLICT (email) DO NOTHING;"
```

Substitua `seu@email.com` pelo email desejado.
