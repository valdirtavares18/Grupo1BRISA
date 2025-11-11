# Sistema White-Label de Gestão de Presença em Eventos

Sistema SaaS white-label para captação de dados de público em eventos com conformidade LGPD.

## 🚀 Tecnologias

- **Next.js 14+** com App Router
- **TypeScript**
- **Prisma ORM** com PostgreSQL
- **Tailwind CSS**
- **Lucide React** para ícones
- **JWT** para autenticação

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/presenca_eventos"
JWT_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Configure o banco de dados:
```bash
npm run db:push
npm run db:generate
npm run db:seed
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🏗️ Arquitetura

### Estrutura de Pastas

```
/
├── app/                          # App Router (rotas e páginas)
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   ├── dashboard/                # Dashboards por nível de acesso
│   ├── event/[token]/            # Páginas públicas de eventos
│   └── api/                      # API Routes
├── src/
│   ├── components/               # Componentes UI (Atomic Design)
│   │   ├── atoms/                # Componentes base
│   │   ├── molecules/            # Componentes compostos
│   │   └── organisms/            # Componentes complexos
│   ├── lib/                      # Utilitários e configs
│   ├── services/                 # Lógica de negócio
│   └── types/                    # TypeScript types
└── prisma/
    ├── schema.prisma             # Schema do banco de dados
    └── seed.ts                   # Seed do banco
```

### Design System

Seguindo a metodologia **Atomic Design**:
- **Atoms**: Componentes base (Button, Input, Card, etc.)
- **Molecules**: Componentes compostos (FormField, etc.)
- **Organisms**: Componentes complexos (LoginForm, etc.)

## 🎯 Funcionalidades

### Super Admin (Gerente da Plataforma)
- CRUD completo de organizações
- CRUD de personalização (themes)
- Gerenciar contas de admin das organizações
- Dashboard global da plataforma

### Org Admin (Admin da Organização)
- CRUD de eventos
- Geração e download de QR Code por evento
- Visualizar dashboards e relatórios de público
- Exportar dados de presença
- Gerenciar participantes

### End User (Público Final)
- Escanear QR Code → registro automático de presença
- Criar conta com CPF + senha
- Adicionar dados opcionais (nome, telefone, email, foto)
- Visualizar eventos futuros e passados
- Dashboard pública da organização
- Gerenciar consentimentos LGPD

## 🔐 Autenticação

O sistema utiliza JWT customizado com cookies HTTP-only:
- Tokens têm validade de 7 dias
- Refresh automático implementado
- Rotas protegidas via middleware

## 📊 Banco de Dados

### Modelos Principais

- **Organization** - Organizações white-label
- **OrganizationTheme** - Personalização visual
- **PlatformUser** - Administradores (Super Admin + Org Admin)
- **EndUser** - Público final
- **Event** - Eventos
- **PresenceLog** - Logs de presença
- **UserConsent** - Consentimentos LGPD

## 🎨 Design

Paleta de cores principal:
- Azul Marinho: `#001F3F`
- Branco: `#FFFFFF`
- Gradientes sutis em backgrounds

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run db:push` - Aplica mudanças no schema
- `npm run db:generate` - Gera Prisma Client
- `npm run db:seed` - Executa seed do banco
- `npm run db:studio` - Abre Prisma Studio

## 🔒 LGPD Compliance

O sistema foi desenvolvido com foco em conformidade LGPD:
- Consentimento explícito (opt-in) para dados opcionais
- Registro de todos os consentimentos
- Políticas de privacidade claras
- Capacidade de revogação de consentimentos

## 📄 Licença

Este projeto é privado e propriedade do Grupo BRISA.
