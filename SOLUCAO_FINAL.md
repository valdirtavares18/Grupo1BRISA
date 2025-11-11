# 🚨 SOLUÇÃO DEFINITIVA - DOCKER PARADO

## Problema Identificado

O Docker Desktop NÃO está rodando. Por isso o Prisma não consegue conectar ao banco.

## ✅ SOLUÇÃO EM 3 PASSOS:

### 1. Abrir Docker Desktop

- Clique no ícone do Docker Desktop na barra de tarefas do Windows
- OU abra o aplicativo Docker Desktop
- Aguarde o Docker iniciar completamente (ícone para de girar)

### 2. Verificar se está rodando

Execute no terminal:

```bash
docker ps
```

Se retornar containers, está OK ✅

### 3. Iniciar o container PostgreSQL

```bash
docker start presenca-postgres
```

Se der erro dizendo que não existe, crie novamente:

```bash
docker run --name presenca-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=presenca_eventos \
  -e POSTGRES_HOST_AUTH_METHOD=md5 \
  -p 5433:5432 \
  -d postgres:15

sleep 5

cat create_schema.sql | docker exec -i presenca-postgres psql -U postgres -d presenca_eventos

docker exec -i presenca-postgres psql -U postgres -d presenca_eventos -c "INSERT INTO platform_users (id, email, passwordHash, role, \"isActive\", \"createdAt\") VALUES (gen_random_uuid()::text, 'admin@teste.com', '\$2a\$10\$/.5LINBLFkIpkVmtCevl5.AlhgDNOuppCYLCszfvMF7hmAEKQBWFS', 'SUPER_ADMIN', true, CURRENT_TIMESTAMP) ON CONFLICT (email) DO NOTHING;"
```

### 4. Reiniciar o servidor Next.js

```bash
npm run dev
```

## ✅ DEPOIS DISSO DEVE FUNCIONAR!

- Acesse: http://localhost:3000
- Login: admin@teste.com / admin123

## ⚠️ IMPORTANTE

**SEMPRE mantenha o Docker Desktop aberto e rodando** quando estiver desenvolvendo.
