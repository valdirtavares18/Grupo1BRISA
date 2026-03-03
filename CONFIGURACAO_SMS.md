# 📱 Configuração de SMS e WhatsApp (Twilio Verify)

O app usa **Twilio Verify** para enviar códigos de verificação por **SMS** e **WhatsApp**. Em produção (Vercel), configure as variáveis abaixo.

## Variáveis necessárias

| Variável | Onde achar |
|----------|------------|
| `TWILIO_ACCOUNT_SID` | Console Twilio → Account Info |
| `TWILIO_AUTH_TOKEN` | Console Twilio → Account Info |
| `TWILIO_VERIFY_SERVICE_SID` | Console Twilio → Verify → Services |

---

## Passo 1: Conta Twilio

1. Acesse [twilio.com](https://www.twilio.com/) e crie uma conta (trial é suficiente para começar).
2. No [Console](https://console.twilio.com/), anote:
   - **Account SID** (começa com `AC...`)
   - **Auth Token** (clique em "Show" para ver).

---

## Passo 2: Criar um Verify Service

1. No Console Twilio: **Explore Products** → **Verify** → **Services** (ou [link direto](https://console.twilio.com/us1/develop/verify/services)).
2. Clique em **Create new**.
3. Dê um nome (ex: "Fluxo Presente").
4. Em **Channel configuration**:
   - **SMS**: já vem habilitado.
   - **WhatsApp**: opcional; para trial use o [Sandbox do WhatsApp](https://console.twilio.com/us1/develop/sms/sandbox/whatsapp) e siga as instruções para ativar.
5. Salve e copie o **Service SID** (começa com `VA...`). Esse valor é o `TWILIO_VERIFY_SERVICE_SID`.

---

## Passo 3: Configurar na Vercel (produção)

1. Abra o projeto na [Vercel](https://vercel.com) → **Settings** → **Environment Variables**.
2. Adicione (e marque o ambiente **Production**):

   - **Name:** `TWILIO_ACCOUNT_SID`  
     **Value:** seu Account SID (ex: `ACxxxxxxxx...`)

   - **Name:** `TWILIO_AUTH_TOKEN`  
     **Value:** seu Auth Token

   - **Name:** `TWILIO_VERIFY_SERVICE_SID`  
     **Value:** o SID do Verify Service (ex: `VAxxxxxxxx...`)

3. Salve e faça um **Redeploy** do projeto para as variáveis valerem.

---

## Passo 4: Local (opcional)

Para testar com Twilio no seu PC, crie `.env.local` na raiz do app (não commitar) com:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxx...
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxx...
```

Reinicie o servidor (`npm run dev`).

---

## Limitações do trial Twilio

- **SMS:** só envia para números que você adicionar em [Verified Caller IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified).
- **WhatsApp:** use o Sandbox; você envia uma mensagem com o código que o Twilio mostra para ativar o número de teste.

Para produção com qualquer número:
- Ative a conta Twilio (adicione créditos ou pague).
- Para WhatsApp em produção, use o [WhatsApp Business API](https://www.twilio.com/docs/whatsapp) do Twilio (aprovação necessária).

---

## Resumo

1. Conta Twilio → Account SID + Auth Token.  
2. Verify → Create Service → copiar Service SID.  
3. Na Vercel: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`.  
4. Redeploy. Depois disso, login e registro passam a enviar SMS (e WhatsApp se configurado no Verify).
