# Documento não enviado para os participantes, apenas detalhando o funcionamento das ferramentas utilizadas nos testes.

# Instruções de Execução: SonarQube e Snyk

Guia prático de configuração, inicialização e execução das esteiras de inspeção estática de código (SonarQube) e de segurança defensiva (Snyk) utilizadas no projeto de pesquisa do TC II.

---

## 1. SonarQube (Qualidade, Complexidade e Manutenibilidade)

O SonarQube mensula métricas de engenharia de software, incluindo Linhas de Código (LOC), Débito Técnico, Code Smells e Complexidade Ciclomática e Cognitiva.

### 1.1 Pré-requisitos

- **Java**: Requer **JDK 21** configurado nas variáveis de ambiente do sistema (`JAVA_HOME` e `PATH`)

### 1.2 Iniciar o Servidor Local

1. Abra um terminal (Prompt de Comando ou PowerShell)
2. Navegue até o diretório de executáveis:
   ```cmd
   cd C:\sonarqube\bin\windows-x86-64
   ```

3. Execute o script de inicialização manual:
   ```cmd
   StartSonar.bat
   ```
   > ⚠️ **Nota**: Não execute `SonarService.bat`, pois este serve apenas para registrar serviços do Windows

4. Aguarde 1 a 2 minutos até que apareça no console:
   ```
   SonarQube is operational
   ```

5. Mantenha a janela do terminal aberta (ou minimizada) enquanto estiver realizando análises

### 1.3 Acesso Web e Gerenciamento de Tokens

- **Endereço do Painel**: http://localhost:9000
- **Credenciais padrão**: 
  - Usuário: `admin`
  - Senha: `admin`
  - *(Exige alteração no primeiro login)*

#### Gerar um novo Token:

1. Clique no avatar do usuário no canto superior direito
2. Acesse **My Account**
3. Vá para a aba **Security**
4. No campo "Generate Token", informe um nome (ex.: `tc2-token`)
5. Selecione o tipo **User Token**
6. Clique em **Generate**
7. Copie o token exibido imediatamente

### 1.4 Configuração do Projeto

Certifique-se de que o arquivo `sonar-project.properties` está localizado na **raiz do projeto**:

```properties
sonar.projectKey=tc2-experiment-server
sonar.projectName=TC II Experiment Server
sonar.projectVersion=1.0
sonar.sources=src
sonar.sourceEncoding=UTF-8
sonar.exclusions=**/node_modules/**,**/results/**,scripts/**
sonar.language=js
sonar.javascript.environments=nodejs
sonar.host.url=http://localhost:9000
```

### 1.5 Executar a Análise

Na raiz do repositório, execute:

```bash
npx sonar-scanner -Dsonar.token=SEU_TOKEN_AQUI
```

> **Nota**: Se usar nomenclatura legada, substitua por `-Dsonar.login=SEU_TOKEN_AQUI`

### 1.6 Onde Consultar as Métricas

- **Visão Geral**: http://localhost:9000/dashboard?id=tc2-experiment-server
- **Todas as Issues/Débito Técnico**: Alterne o filtro de "New Code" para "Overall Code" (ou aba Issues)
- **Complexidade do Desafio 2**: Menu `Measures` > `Complexity` > selecione `src/routes/challenge2.js` para acompanhar a redução da complexidade cognitiva

---

## 2. Snyk (Auditoria de Vulnerabilidades SAST e Dependências)

O Snyk identifica vulnerabilidades de cibersegurança no código-fonte (Snyk Code) e em pacotes declarados no `package.json` (Snyk Open Source).

### 2.1 Autenticação Inicial da CLI

Se ainda não vinculou o terminal à sua conta:

```bash
snyk auth
```

Uma página será aberta no navegador para confirmar a autenticação gratuita.

### 2.2 Ativação do Snyk Code (Se erro SNYK-CODE-0005)

O Snyk Code (SAST) precisa estar habilitado na organização web:

1. Acesse https://app.snyk.io
2. Vá em **Settings** (ícone de engrenagem) > **Snyk Code**
3. Marque a opção **Enable Snyk Code** como "Enabled"
4. Clique em **Save changes**

### 2.3 Executar Análise de Código-Fonte (SAST)

Realiza a varredura do código JavaScript atrás de credenciais expostas, chaves JWT fixas e poluição de protótipos:

```bash
snyk code test
```

### 2.4 Executar Análise de Dependências (SCA)

Varre o manifesto `package.json` para identificar bibliotecas de terceiros vulneráveis (CVEs):

```bash
snyk test
```

---

## 3. Linha de Base Inicial (Baseline do Projeto)

Valores de referência obtidos na versão padrão da API antes das intervenções com agentes de IA:

| Ferramenta | Métrica / Indicador | Valor Observado | Arquivo Principal |
|---|---|---|---|
| SonarQube | Total de Issues | 29 issues | Geral |
| SonarQube | Débito Técnico Estimado | 6h 30min | Geral |
| SonarQube | Complexidade Cognitiva Máxima | 211 (limite recomendado: 15) | `src/routes/challenge2.js` |
| Snyk Code | Vulnerabilidades Altas (HIGH) | 2 (Hardcoded JWT Secrets) | `src/routes/challenge1.js` |
| Snyk Code | Vulnerabilidades Médias (MEDIUM) | 5 (Senhas em texto puro, Prototype Pollution) | `src/routes/challenge1.js`, `challenge2.js`, `server.js` |

---

## 4. Scripts Auxiliares do Repositório

### Validação Rápida das APIs (sem Postman)

```bash
node scripts/validate-apis.js
```

Verifica os fluxos de registro, login, checkout e transferência na API local.

### Iniciar o Servidor da API

```bash
npm start
```

---

## Resumo de Comandos Principais

```bash
# SonarQube - Executar análise
npx sonar-scanner -Dsonar.token=SEU_TOKEN_AQUI

# Snyk - Autenticar
snyk auth

# Snyk - Análise de código-fonte (SAST)
snyk code test

# Snyk - Análise de dependências (SCA)
snyk test

# Validar APIs
node scripts/validate-apis.js

# Iniciar servidor
npm start
```

