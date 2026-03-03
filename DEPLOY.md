# Deploy na Vercel (produção)

O app usa **SQLite local** em desenvolvimento e **Turso** (SQLite na nuvem) em produção. Na Vercel você configura as variáveis do Turso e o build/run usam o banco remoto.

## 1. Banco Turso (gratuito)

1. Crie uma conta em [turso.tech](https://turso.tech).
2. Instale o CLI: `curl -sSfL https://get.turso.tech/install.sh | bash` (ou veja a doc deles).
3. Crie o banco e pegue a URL e o token:
   ```bash
   turso db create fluxo-presente
   turso db show fluxo-presente
   turso db tokens create fluxo-presente
   ```
4. Rode o schema no Turso (uma vez):
   ```bash
   turso db shell fluxo-presente < create_schema.sql
   ```
5. (Opcional) Tabela de tipos de evento:
   ```bash
   turso db shell fluxo-presente
   ```
   Dentro do shell:
   ```sql
   CREATE TABLE IF NOT EXISTS "event_types" (
     "id" TEXT NOT NULL PRIMARY KEY,
     "name" TEXT NOT NULL UNIQUE,
     "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   INSERT OR IGNORE INTO "event_types" (id, name) VALUES
     (lower(hex(randomblob(4))), 'Cultura'),
     (lower(hex(randomblob(4))), 'Esporte'),
     (lower(hex(randomblob(4))), 'Educação'),
     (lower(hex(randomblob(4))), 'Maturidade Ativa'),
     (lower(hex(randomblob(4))), 'Recreação');
   ```

Guarde:
- `TURSO_DATABASE_URL` (ex.: `libsql://fluxo-presente-xxx.turso.io`)
- `TURSO_AUTH_TOKEN` (o token que você gerou)

## 2. Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com), faça login e **Import** do repositório (ex.: `valdirtavares18/Grupo1BRISA`).
2. **Root Directory:** se o app Next.js estiver numa subpasta (ex.: `Grupo1BRISA`), defina como `Grupo1BRISA`.
3. Em **Environment Variables** adicione (use os mesmos valores que você usou no Turso e no `.env.local`):
   - `TURSO_DATABASE_URL` = URL do Turso (ex.: `libsql://seu-db.aws-us-east-1.turso.io`)
   - `TURSO_AUTH_TOKEN` = token do Turso
   - `JWT_SECRET` = uma string longa e aleatória (obrigatório em produção)
4. Deploy. O build usa `next build`; em runtime o app usa Turso quando essas variáveis estão definidas.

**Observação:** O Turso não suporta `ALTER TABLE ... ADD CONSTRAINT` (FK). O script `scripts/apply-turso-schema.js` aplica o schema sem essas linhas; a aplicação funciona normalmente.

## 3. Variáveis opcionais

- **Twilio (SMS):** se usar verificação por SMS, configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` e `TWILIO_VERIFY_SERVICE_SID` no projeto da Vercel.

## 4. Local vs produção

- **Local (sem Turso):** não defina `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`. O app usa o arquivo `presenca.db` e `better-sqlite3`.
- **Produção (Vercel):** defina as duas variáveis do Turso. O app usa `@libsql/client` e não escreve em disco.

O `.env.example` na raiz do app lista todas as variáveis; use-o como referência ao configurar o projeto na Vercel.
