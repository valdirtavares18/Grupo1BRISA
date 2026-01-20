# Guia de Introdução ao GitHub para Novos Desenvolvedores

Este guia foi criado para orientar os novos integrantes da equipe no uso do Git e GitHub. Siga estes passos para configurar seu ambiente, baixar o projeto e enviar suas contribuições.

> [!IMPORTANT]
> Este projeto utiliza o **GitHub**. Você precisará de uma conta no GitHub e permissão de acesso ao repositório.

## Passo 1: Preparando o Ambiente (Apenas na primeira vez)

Antes de começar, você precisa ter o **Git** instalado no seu computador.
1.  Baixe e instale o Git: [git-scm.com](https://git-scm.com/downloads)
2.  (Recomendado) Instale o VS Code: [code.visualstudio.com](https://code.visualstudio.com/)

## Passo 2: Baixando o Projeto (Clonar)

Para baixar os arquivos do projeto para o seu computador (chamamos isso de "clonar"):

1.  Crie uma pasta em seu computador onde você quer guardar o projeto.
2.  Clique com o botão direito nessa pasta e selecione **"Git Bash Here"** (ou abra o terminal do VS Code).
3.  Digite o seguinte comando e aperte Enter:

```bash
git clone https://github.com/valdirtavares18/Grupo1BRISA.git
```

4.  Entre na pasta que foi criada:

```bash
cd Grupo1BRISA
```

## Passo 3: Entrando na Sua Branch

Cada desenvolvedor tem uma "branch" (ramificação) própria para trabalhar sem atrapalhar os outros. **Nunca trabalhe direto na branch `main`.**

Para mudar para a sua branch (substitua `nome-da-sua-branch` pelo nome que criaram para você no GitHub):

```bash
git checkout nome-da-sua-branch
```

> [!TIP]
> Para confirmar em qual branch você está, digite `git status`. Deve aparecer "On branch nome-da-sua-branch".

## Passo 4: Trabalhando e Salvando Alterações

Agora você pode criar novos arquivos ou editar os existentes usando o VS Code ou seu editor preferido.

Quando terminar uma tarefa e quiser salvar no histórico do Git:

1.  **Adicionar os arquivos à lista de envio:**
    ```bash
    git add .
    ```
    *(O ponto `.` significa "todos os arquivos modificados")*

2.  **Criar o "Commit" (Pacote de alterações):**
    Escreva uma mensagem curta explicando o que você fez.
    ```bash
    git commit -m "Adiciona nova funcionalidade de login"
    ```

## Passo 5: Enviando para o GitHub

Até agora, tudo está salvo apenas no seu computador. Para enviar para o site do GitHub (nuvem), use o comando:

```bash
git push origin nome-da-sua-branch
```

Se for a primeira vez, pode pedir seu usuário e senha do GitHub.

---

## Resumo Rápido (Cheat Sheet)

Sempre que for começar a trabalhar no dia:

1.  `git checkout nome-da-sua-branch` (Garante que está na sua área)
2.  `git pull origin main` (Traz atualizações da equipe para sua máquina - opcional, mas recomendado para não ficar desatualizado)

Ao terminar o trabalho:

1.  `git add .`
2.  `git commit -m "Descrição do que fiz"`
3.  `git push origin nome-da-sua-branch`

## Dúvidas?

Se aparecer algum erro vermelho ou estranho, pare e chame o responsável técnico. Não execute comandos que você não conhece se estiver em dúvida!
