# 🚀 Como Usar o Sistema

## 1️⃣ Iniciar o Banco de Dados

```bash
docker run --name presenca-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=presenca_eventos \
  -p 5433:5432 \
  -d postgres:15
```

## 2️⃣ Criar as Tabelas

```bash
cat create_schema.sql | docker exec -i presenca-postgres psql -U postgres -d presenca_eventos
```

## 3️⃣ Criar Usuário Admin

```bash
docker exec -i presenca-postgres psql -U postgres -d presenca_eventos -c "INSERT INTO platform_users (id, email, passwordHash, role, isActive, createdAt) VALUES (gen_random_uuid()::text, 'admin@teste.com', '\$2a\$10\$/.5LINBLFkIpkVmtCevl5.AlhgDNOuppCYLCszfvMF7hmAEKQBWFS', 'SUPER_ADMIN', true, CURRENT_TIMESTAMP);"
```

## 4️⃣ Configurar .env

Crie arquivo `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/presenca_eventos"
JWT_SECRET="minha-chave-secreta-muito-longa-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

## 5️⃣ Iniciar Sistema

```bash
npm run dev
```

Acesse: http://localhost:3000

Login: admin@teste.com / admin123

---

## 📊 Para Ver o Banco

### Opção A: SQL direto

```bash
docker exec -it presenca-postgres psql -U postgres -d presenca_eventos
```

Dentro do psql:
```sql
\dt          -- ver tabelas
SELECT * FROM platform_users;
\q           -- sair
```

### Opção B: DBeaver

Não funciona por problema do Docker no Windows. Use a Opção A.

---

## ❌ Se Der Erro

```bash
# Ver container
docker ps | grep presenca

# Se não estiver rodando, iniciar:
docker start presenca-postgres

# Ver logs
docker logs presenca-postgres
```
