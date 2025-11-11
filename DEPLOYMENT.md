# Guia de Deploy - Sistema de Presença em Eventos

Este documento fornece instruções para fazer deploy do sistema em diferentes plataformas.

## Pré-requisitos

- Conta na plataforma de hosting (Vercel, Railway, etc.)
- Banco de dados PostgreSQL
- Variáveis de ambiente configuradas

## Variáveis de Ambiente

Configure as seguintes variáveis no seu ambiente:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="seu-secret-key-aleatorio-aqui"
NEXTAUTH_URL="https://seu-dominio.com"
```

### Gerando JWT_SECRET

```bash
openssl rand -base64 32
```

## Deploy na Vercel

### Passo a Passo

1. **Instale a Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login na Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Configure as variáveis de ambiente:**
   - Acesse o dashboard da Vercel
   - Vá em Settings > Environment Variables
   - Adicione todas as variáveis necessárias

5. **Execute as migrations:**
```bash
vercel env pull
npm run db:push
```

### Configuração no Vercel

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Deploy no Railway

### Passo a Passo

1. **Instale a Railway CLI:**
```bash
npm i -g @railway/cli
```

2. **Login:**
```bash
railway login
```

3. **Crie um projeto:**
```bash
railway init
```

4. **Adicione PostgreSQL:**
```bash
railway add postgresql
```

5. **Configure variáveis de ambiente:**
```bash
railway variables set JWT_SECRET="seu-secret-key"
railway variables set NEXTAUTH_URL="https://seu-app.railway.app"
```

6. **Deploy:**
```bash
railway up
```

## Setup do Banco de Dados

Após o deploy, execute as migrations e o seed:

```bash
npm run db:push
npm run db:generate
npm run db:seed
```

## Criando o Primeiro Super Admin

Após o deploy, acesse o banco de dados e crie o primeiro Super Admin manualmente ou execute o seed:

```typescript
// Email padrão do seed: admin@plataforma.com
// Senha padrão: admin123
```

**IMPORTANTE**: Altere a senha padrão após o primeiro login!

## Domínios e SSL

- A Vercel e Railway fornecem SSL automático
- Configure seu domínio customizado nas configurações da plataforma

## Monitoramento

### Logs

Visualize logs em tempo real:

```bash
# Vercel
vercel logs

# Railway
railway logs
```

### Banco de Dados

Use o Prisma Studio para gerenciar dados:

```bash
npm run db:studio
```

## Troubleshooting

### Erro de Conexão com o Banco

Verifique se:
- DATABASE_URL está correto
- O banco permite conexões externas
- Firewall está configurado corretamente

### Erro de Autenticação

Verifique se:
- JWT_SECRET está configurado
- Cookies estão habilitados no navegador
- NEXTAUTH_URL está correto

### Build Fails

Verifique se:
- Todas as dependências estão no package.json
- TypeScript não tem erros
- Variáveis de ambiente estão configuradas
