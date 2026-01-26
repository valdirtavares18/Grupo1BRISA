# 🔑 Credenciais de Teste - FLUXO PRESENTE

## 👑 SUPER ADMIN (Acesso Total)
- **Email**: `admin@teste.com`
- **Senha**: `admin123`

## 👤 ADMIN DA ORGANIZAÇÃO 1 - Tech Conference 2025
- **Email**: `admin@techconf.com`
- **Senha**: `org1admin123`
- **Organização**: Tech Conference 2025
- **Slug**: `tech-conf-2025`

## 👤 ADMIN DA ORGANIZAÇÃO 2 - Festival de Música
- **Email**: `admin@festival.com`
- **Senha**: `org2admin123`
- **Organização**: Festival de Música
- **Slug**: `festival-musica`

## 👥 USUÁRIOS FINAIS (Login com CPF)

### Usuário 1
- **CPF**: `12345678901`
- **Senha**: `user123`
- **Nome**: João Silva
- **Telefone**: (11) 98765-4321
- **Email**: joao@teste.com

### Usuário 2
- **CPF**: `98765432100`
- **Senha**: `user123`
- **Nome**: Maria Santos
- **Telefone**: (11) 97654-3210
- **Email**: maria@teste.com

### 📝 Como fazer login como usuário final

1. Acesse: `http://localhost:3000/login`
2. **IMPORTANTE**: No campo "Email", digite o **CPF** (sem pontos ou traços)
   - Exemplo: `12345678901` (não `123.456.789-01`)
3. Digite a senha: `user123`
4. Você será redirecionado para `/dashboard/user`

> ⚠️ **Nota**: O sistema aceita CPF no campo de email para login de usuários finais. O sistema identifica automaticamente se é um CPF ou email.

---

## 🚀 Como Testar o Admin de Organização

1. Acesse: `http://localhost:3000/login`
2. Use uma das credenciais acima:
   - `admin@techconf.com` / `org1admin123`
   - `admin@festival.com` / `org2admin123`
3. Você será redirecionado para `/dashboard/organization`
4. No dashboard você pode:
   - ✅ Criar novos eventos
   - ✅ Ver eventos existentes
   - ✅ Ver presenças de cada evento
   - ✅ Baixar QR Codes
   - ✅ Exportar relatórios CSV
   - ✅ Gerenciar feed da organização
   - ✅ Ver usuários finais

## 📋 Funcionalidades Disponíveis

### Dashboard da Organização
- **Eventos Ativos**: Eventos em andamento
- **Próximos Eventos**: Eventos futuros
- **Eventos Passados**: Histórico
- **Estatísticas**: Total de presenças, usuários, etc.

### Gestão de Eventos
- Criar evento com todos os dados (título, datas, localização, tipo)
- Editar evento existente
- Duplicar evento
- Encerrar evento manualmente
- Ver QR Code e baixar em PNG
- Ver lista de presenças em tempo real
- Exportar presenças em CSV

### Feed da Organização
- Criar posts para o feed público
- Editar posts existentes
- Publicar/despublicar posts

### Usuários Finais
- Ver lista de usuários que participaram dos eventos
- Estatísticas de completude de perfil

---

**Nota**: Se os dados de teste não existirem no banco, execute:
```bash
node seed-test-data.js
```

