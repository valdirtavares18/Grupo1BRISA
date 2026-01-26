# 📱 Configuração de SMS com Twilio

Para que os códigos SMS cheguem no celular de verdade, você precisa configurar o Twilio.

## Passo 1: Criar conta no Twilio

1. Acesse: https://www.twilio.com/
2. Crie uma conta gratuita (trial)
3. Você receberá créditos para testar

## Passo 2: Obter credenciais

1. Acesse o Console: https://www.twilio.com/console
2. Anote:
   - **Account SID** (ex: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
   - **Auth Token** (ex: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
   - **Phone Number** (número que você recebeu, ex: +1234567890)

## Passo 3: Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
TWILIO_ACCOUNT_SID=seu_account_sid_aqui
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_PHONE_NUMBER=+1234567890
```

**⚠️ IMPORTANTE:** 
- O arquivo `.env.local` não deve ser commitado no Git
- Adicione `.env.local` ao `.gitignore`

## Passo 4: Reiniciar o servidor

Após configurar as variáveis, reinicie o servidor:

```bash
npm run dev
```

## Como funciona

- **Com Twilio configurado:** SMS será enviado para o celular real
- **Sem Twilio configurado:** Em desenvolvimento, mostra código na tela (mock)

## Teste

Após configurar, teste o registro/login:
1. Informe CPF e telefone
2. Clique em "Enviar código SMS"
3. O código chegará no seu celular via SMS

## Notas

- O Twilio trial tem limitações (apenas números verificados)
- Para produção, você precisará verificar seu número ou usar um número Twilio pago
- O formato do telefone será automaticamente convertido para +55 (Brasil)


