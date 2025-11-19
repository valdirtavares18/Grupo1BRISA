# 🎯 FLUXO PRESENTE - Sistema de Gestão de Presença

Plataforma SaaS white-label completa para gestão e registro de presença em eventos com conformidade LGPD.

## 🚀 Funcionalidades

### 👤 Para Participantes
- ✅ Registro de presença via QR Code
- ✅ Cadastro simplificado (CPF + senha)
- ✅ Edição de perfil pessoal
- ✅ Histórico de eventos participados
- ✅ Alteração de senha
- ✅ Exclusão de conta (LGPD)

### 🏢 Para Organizadores
- ✅ Criação e edição de eventos
- ✅ Geração automática de QR Codes
- ✅ Visualização de presenças em tempo real
- ✅ Exportação de relatórios (CSV)
- ✅ Dashboard com métricas e estatísticas
- ✅ Personalização de tema (cores, logo)

### 👑 Para Super Admin
- ✅ Gestão de múltiplas organizações
- ✅ Configuração white-label por cliente
- ✅ Visão geral da plataforma
- ✅ Controle de acesso e permissões

## 🛡️ Validações Implementadas

### Dados
- CPF com 11 dígitos válidos
- Email no formato correto
- Data do evento não pode ser passada
- Campos obrigatórios validados
- Slug único por organização

### Presença
- ✅ Registro **APENAS** durante o horário do evento
- ✅ Prevenção de presença duplicada
- ✅ Mensagens contextuais:
  - "Evento ainda não começou"
  - "Evento já encerrado"
  - "Você já está cadastrado neste evento"

### Segurança
- Senhas criptografadas (bcrypt)
- Tokens JWT em cookies HTTP-only
- Middleware de proteção de rotas
- Validação de permissões por role

## 🎨 Design

- **Mobile-first**: Responsivo desde 320px até 4K
- **Gradientes**: Cores suaves e modernas
- **Ícones**: Lucide React em todo o sistema
- **UX**: Loading states, hover effects, transições suaves
- **Atomic Design**: Atoms → Molecules → Organisms

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Criar banco de dados
node setup-sqlite.js

# Iniciar servidor
npm run dev
```

Acesse: http://localhost:3000

## 🔑 Credenciais Padrão

### Super Admin
- Email: `admin@teste.com`
- Senha: `admin123`

## 📂 Estrutura do Projeto

```
├── app/                          # Páginas Next.js
│   ├── (auth)/                   # Páginas públicas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── api/                      # Rotas de API
│   │   ├── auth/                 # Autenticação
│   │   ├── events/               # Eventos
│   │   ├── organizations/        # Organizações
│   │   ├── presence/             # Registro de presença
│   │   └── user/                 # Perfil do usuário
│   ├── dashboard/                # Dashboards protegidos
│   │   ├── admin/                # Super Admin
│   │   ├── organization/         # Admin da Organização
│   │   └── user/                 # Usuário Final
│   └── event/[token]/            # Página pública do evento
│
├── src/
│   ├── components/               # Componentes React
│   │   ├── atoms/                # Componentes básicos
│   │   ├── molecules/            # Componentes compostos
│   │   └── organisms/            # Componentes complexos
│   ├── lib/                      # Utilitários
│   │   ├── auth.ts               # JWT e autenticação
│   │   ├── db-sqlite.ts          # Conexão SQLite
│   │   └── utils.ts              # Validações
│   └── services/                 # Lógica de negócio
│       ├── auth.service.ts
│       ├── event.service.ts
│       ├── organization.service.ts
│       ├── presence.service.ts
│       ├── consent.service.ts
│       └── user.service.ts
│
├── prisma/
│   └── schema.prisma             # Schema do banco (referência)
│
├── presenca.db                   # Banco SQLite
└── setup-sqlite.js               # Script de setup
```

## 🔄 Fluxo de Uso

### 1. Participante Escaneando QR Code

1. Participante escaneia QR Code do evento
2. Sistema verifica se evento está ativo
3. Sistema registra presença anônima
4. Participante é direcionado para criar conta/login
5. Sistema vincula presença ao CPF

### 2. Organizador Criando Evento

1. Admin faz login
2. Acessa "Novo Evento"
3. Preenche dados (título, datas, descrição)
4. Sistema gera QR Code único
5. Admin baixa QR Code para impressão/divulgação

### 3. Visualizando Relatórios

1. Admin acessa evento
2. Clica em "Ver Presenças"
3. Visualiza lista completa (identificados + anônimos)
4. Exporta CSV com todos os dados

## 🔒 LGPD

- ✅ Consentimentos opt-in
- ✅ Dados opcionais
- ✅ Exclusão de dados
- ✅ Anonimização ao deletar conta
- ✅ Rastreabilidade de consentimentos

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (better-sqlite3)
- **Auth**: JWT (jsonwebtoken), bcryptjs
- **Icons**: Lucide React
- **QR Code**: react-qr-code

## 📊 Métricas e Relatórios

### Dashboard do Organizador
- Total de eventos
- Eventos ativos
- Próximos eventos
- Total de presenças
- Taxa de identificação (identificados vs anônimos)

### Relatórios Exportáveis
- CSV com:
  - Data/Hora de acesso
  - Nome completo
  - CPF
  - Email
  - Telefone
  - IP
  - Status (Identificado/Anônimo)

## 🎨 Temas White-Label

Cada organização pode personalizar:
- Cor primária
- Logo (URL)
- Background style
- Slug único para URL

## 📝 Validações em Tempo Real

### Ao Criar Evento
- ✅ Data não pode ser passada
- ✅ Título obrigatório
- ✅ Data fim > Data início

### Ao Registrar Presença
- ✅ Evento deve estar ativo
- ✅ Dentro do horário programado
- ✅ Sem duplicatas

### Ao Criar Conta
- ✅ CPF válido (11 dígitos)
- ✅ CPF único (não duplicado)
- ✅ Senha mínimo 6 caracteres

## 🔗 Links Úteis

### Documentação
- `VALIDACOES_IMPLEMENTADAS.md` - Checklist completo
- `RESUMO_IMPLEMENTACAO.md` - Funcionalidades
- `STATUS_VALIDACOES.md` - Status atual
- `COMO_USAR.md` - Guia rápido

### Para Desenvolvimento
```bash
# Reinstalar banco
node setup-sqlite.js

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## ✨ Diferenciais

- 🎨 Design moderno e responsivo
- 📱 Mobile-first (funciona em qualquer dispositivo)
- ⚡ Performance otimizada
- 🔒 Segurança em primeiro lugar
- 📊 Relatórios completos
- 🎯 White-label flexível
- ✅ 100% conforme LGPD

## 📞 Suporte

Sistema desenvolvido para gestão profissional de eventos com todas as validações e regras de negócio implementadas.

---

**Versão**: 1.0.0  
**Data**: Novembro 2025