# 👥 Credenciais de Teste - Usuários Finais

## 🔑 Credenciais Disponíveis

### Usuário 1 - João Silva
- **CPF**: `12345678901`
- **Senha**: `user123`
- **Nome Completo**: João Silva
- **Telefone**: (11) 98765-4321
- **Email**: joao@teste.com
- **CEP**: 01310-100

### Usuário 2 - Maria Santos
- **CPF**: `98765432100`
- **Senha**: `user123`
- **Nome Completo**: Maria Santos
- **Telefone**: (11) 97654-3210
- **Email**: maria@teste.com
- **CEP**: 20040-020

---

## 🚀 Como Fazer Login

### Opção 1: Página de Login

1. Acesse: `http://localhost:3000/login`
2. No campo **"Email"**, digite o **CPF** (sem pontos ou traços):
   - ✅ Correto: `12345678901`
   - ❌ Errado: `123.456.789-01`
3. Digite a senha: `user123`
4. Clique em "Entrar"
5. Você será redirecionado para `/dashboard/user`

### Opção 2: Escanear QR Code

1. Escaneie o QR Code de um evento ativo
2. Se você não estiver logado, será direcionado para criar conta/login
3. Use o CPF e senha acima para fazer login
4. Sua presença será automaticamente vinculada à sua conta

---

## 📋 Funcionalidades Disponíveis para Usuários Finais

### Dashboard do Usuário (`/dashboard/user`)
- ✅ Ver eventos que você participou
- ✅ Histórico de presenças
- ✅ Buscar novos eventos

### Perfil (`/dashboard/user/profile`)
- ✅ Editar informações pessoais
- ✅ Atualizar foto de perfil
- ✅ Adicionar biografia
- ✅ Atualizar endereço (com ViaCEP)

### Histórico (`/dashboard/user/history`)
- ✅ Ver todos os eventos em que participou
- ✅ Detalhes de cada presença registrada

### Alterar Senha (`/dashboard/user/password`)
- ✅ Trocar senha atual

### Buscar Eventos (`/events/search`)
- ✅ Buscar eventos por localização (CEP, cidade, estado)
- ✅ Buscar por proximidade (usando GPS)
- ✅ Buscar por tipo de evento
- ✅ Filtrar por data

### Escanear QR Code (`/scan`)
- ✅ Usar câmera do dispositivo para escanear QR Code
- ✅ Registrar presença automaticamente

---

## 🎯 Dados de Teste

Os usuários acima já possuem presenças registradas em alguns eventos:
- **João Silva**: Participou do "Workshop de React" (event-1)
- **Maria Santos**: Participou do "Workshop de React" (event-1)

---

## ⚠️ Observações Importantes

1. **Login com CPF**: O sistema aceita CPF no campo "Email" durante o login. Isso funciona porque o sistema tenta primeiro fazer login como platform user (email), e se falhar, tenta como end user (CPF).

2. **CPF Formatado**: O sistema remove automaticamente pontos e traços do CPF, então você pode digitar `12345678901` ou `123.456.789-01` - ambos funcionam.

3. **Se as credenciais não funcionarem**: Execute o script de seed para criar os usuários:
   ```bash
   node seed-test-data.js
   ```

---

## 🔗 Links Úteis

- Login: `http://localhost:3000/login`
- Dashboard Usuário: `http://localhost:3000/dashboard/user`
- Buscar Eventos: `http://localhost:3000/events/search`
- Escanear QR: `http://localhost:3000/scan`

---

**Última atualização**: Documento criado durante os testes do sistema







