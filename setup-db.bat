@echo off
REM Script para configurar o banco de dados PostgreSQL via Docker no Windows

echo 🚀 Configurando banco de dados PostgreSQL...

REM Verifica se o container já existe
docker ps -a | findstr presenca-postgres >nul
if %errorlevel% == 0 (
    echo ⚠️  Container já existe. Removendo...
    docker stop presenca-postgres
    docker rm presenca-postgres
)

REM Cria o container
echo 📦 Criando container PostgreSQL...
docker run --name presenca-postgres ^
  -e POSTGRES_PASSWORD=postgres ^
  -e POSTGRES_DB=presenca_eventos ^
  -p 5432:5432 ^
  -d postgres:15

REM Aguarda o PostgreSQL iniciar
echo ⏳ Aguardando PostgreSQL iniciar...
timeout /t 3 /nobreak >nul

REM Verifica se está rodando
docker ps | findstr presenca-postgres >nul
if %errorlevel% == 0 (
    echo ✅ Banco de dados criado com sucesso!
    echo.
    echo 📝 Credenciais:
    echo    Host: localhost
    echo    Porta: 5432
    echo    Database: presenca_eventos
    echo    Usuário: postgres
    echo    Senha: postgres
    echo.
    echo Próximos passos:
    echo 1. npm run db:push
    echo 2. npm run db:seed
    echo 3. npm run dev
) else (
    echo ❌ Erro ao criar o container
    echo.
    echo ⚠️  Verifique se o Docker Desktop está rodando!
)

pause
