# Comunicaetec

Plataforma para melhorar a comunicacao escolar entre alunos, professores e administracao. O projeto reune uma aplicacao web em React e um aplicativo mobile em Flutter, com Firebase como base para autenticacao e dados.

## Funcionalidades

- Cadastro, login e verificacao de usuarios.
- Area de usuario com dados e recursos da plataforma.
- Avisos/comunicados escolares.
- Calendario e informacoes academicas.
- Forum de duvidas e respostas.
- Solicitacoes internas.
- Pagina de download e politica de privacidade.
- Aplicativo mobile Flutter integrado ao Firebase.

## Tecnologias

| Area | Tecnologias |
| --- | --- |
| Web | React, Vite, React Router, Material UI, Firebase |
| Mobile | Flutter, Dart, Firebase Auth, Firestore, Realtime Database, Storage |
| Deploy web | Vercel |
| Design/UX | Componentes proprios e Material UI |

## Estrutura

```text
comunicaetec/
  frontend/                 # Aplicacao web React
  mobile/comunicaetec/      # Aplicativo Flutter
```

## Requisitos

- Node.js 18 ou superior
- NPM
- Flutter SDK 3.x
- Android Studio ou VS Code com suporte a Flutter
- Projeto Firebase configurado

## Rodando o frontend

```bash
cd frontend
cp .env.example .env   # preencha com os valores do console do Firebase
npm install
npm run dev
```

O Vite exibira a URL local, geralmente `http://localhost:5173`.

As credenciais do Firebase sao lidas de variaveis de ambiente (`VITE_FIREBASE_*`)
definidas no arquivo `frontend/.env`, que nao e versionado. Os valores estao em
Console do Firebase > Configuracoes do projeto > Seus apps.

## Rodando o mobile

```bash
cd mobile/comunicaetec
flutter pub get
flutter run
```

Para gerar APK:

```bash
flutter build apk
```

## Modelo de dados compartilhado

Web e mobile usam o mesmo esquema no Firebase:

| Caminho | Conteudo |
| --- | --- |
| `users/{uid}` | `displayName`, `email`, `imageUrl` (URL de download), `adm`, `curso/{cursoID}` |
| `users/{uid}/curso/{cursoID}` | `idEscola`, `schoolName`, `name`, `periodo`, `status` |
| `posts` | `content`, `imgURL`, `schoolID`, `schoolName`, `tag`, `userID`, `userName`, `userImage`, `adm`, `createdAt` |
| `avisos/{escolaID}` | avisos da escola, ordenados por `createdAt` |
| `solicitacoes/{uid}-{cursoID}` | solicitacoes de matricula por escola |

Imagens no Storage: perfil em `images/profile_image_{uid}.jpg` e posts em
`post_image/image_{timestamp}.jpg`. Qualquer mudanca de esquema deve ser
aplicada nas duas plataformas.

## Configuracao do Firebase

Revise os arquivos de configuracao Firebase do frontend e do app mobile antes de rodar em outro ambiente. O projeto usa autenticacao e servicos de banco/armazenamento do Firebase, entao as regras de acesso devem ser configuradas no console do Firebase conforme o ambiente.

### Regras de seguranca do Realtime Database

O arquivo `frontend/database.rules.json` versiona um ponto de partida para as
regras do Realtime Database (acesso negado por padrao; `users` gravavel pelo
dono; `avisos` gravaveis apenas pelo administrador da escola; indices para as
queries usadas pelo app).

**Atencao:** essas regras sao uma base e NAO sao aplicadas automaticamente.
Antes de publicar, teste no simulador do console do Firebase (Realtime
Database > Regras) com os fluxos reais do app, ajuste o que for necessario e
so entao publique. Regras erradas podem tanto expor dados quanto quebrar o
aplicativo em producao.

## Rotas principais do frontend

| Rota | Descricao |
| --- | --- |
| `/` | Home |
| `/registro` | Cadastro |
| `/login` | Login |
| `/verificacao` | Verificacao de conta |
| `/usuario` | Area do usuario |
| `/download` | Download do app |
| `/privacy` | Politica de privacidade |

## Participantes

- Gabriel
- Caio
- Breno

## Proximos passos sugeridos

- Adicionar imagens das telas principais.
- Adicionar testes basicos para fluxos de autenticacao e navegacao.
- Publicar as regras do Realtime Database apos validacao no simulador.
