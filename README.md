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
npm install
npm run dev
```

O Vite exibira a URL local, geralmente `http://localhost:5173`.

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

## Configuracao do Firebase

Revise os arquivos de configuracao Firebase do frontend e do app mobile antes de rodar em outro ambiente. O projeto usa autenticacao e servicos de banco/armazenamento do Firebase, entao as regras de acesso devem ser configuradas no console do Firebase conforme o ambiente.

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

- Documentar variaveis/configuracoes de ambiente.
- Adicionar imagens das telas principais.
- Criar guia de regras do Firebase para desenvolvimento.
- Adicionar testes basicos para fluxos de autenticacao e navegacao.
