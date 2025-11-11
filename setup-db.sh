#!/bin/bash
# Script para configurar o banco de dados PostgreSQL via Docker

echo "🚀 Configurando banco de dados PostgreSQL..."

# Verifica se o container já existe
if docker ps -a | grep -q presenca-postgres; then
    echo "⚠️  Container já existe. Removendo..."
    docker stop presenca-postgres
    docker rm presenca-postgres
fi

# Cria o container
echo "📦 Criando container PostgreSQL..."
docker run --name presenca-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=presenca_eventos \
  -p 5432:5432 \
  -d postgres:15

# Aguarda o PostgreSQL iniciar
echo "⏳ Aguardando PostgreSQL iniciar..."
sleep 3

# Verifica se está rodando
if docker ps | grep -q presenca-postgres; then
    echo "✅ Midatabase criado com sucesso!"
    echo ""
    echo "📝 Credenciais:"
    echo "   Host: localhost"
    echo "   Porta: 5432"
    echo "   Database: presenca_eventos"
    echo "   Usuário: postgres"
    echo "   Senha: postgres"
    echo ""
    echo "Próximos passos:"
    echo "1. npm run db:push"
    echo "2. npm run db:seed"
    echo "3. npm run dev"
else
    echo "❌ Erro ao criar o container"
fi
