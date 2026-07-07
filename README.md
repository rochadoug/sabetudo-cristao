# 🪔 SabeTudo Cristão

O **SabeTudo Cristão** é um jogo mobile/web casual de perguntas e respostas bíblicas projetado para testar e aprofundar o conhecimento das Escrituras de forma dinâmica e competitiva. O projeto conta com mecânicas de gamificação baseadas em elementos bíblicos (como acender as lâmpadas da Menorá e acumular azeite e ouro) e um ranking global competitivo.

---

## 🚀 Funcionalidades Principais

* **Fluxo de Jogador Convidado (Sandbox):** Os usuários podem experimentar o jogo instantaneamente sem necessidade de cadastro. Todos os dados, progresso e recursos são salvos localmente de forma isolada, evitando sobrecarga e registros "fantasmas" no banco de dados.
* **Criptografia de Dados Locais:** Os dados do modo convidado armazenados no navegador são codificados em Base64, impedindo alterações fáceis ou trapaças casuais via console do desenvolvedor.
* **Gerenciamento de Estado Avançado:** Uso estratégico de React Context API (`AuthContext` e `UserContext`) para alternar de forma transparente o fluxo de salvamento de dados (LocalStorage para convidados e Firestore para contas permanentes).
* **Ranking Global Otimizado:** Sistema de desempate complexo baseado em 4 critérios de ordenação simultâneos (Menorás acesas > Azeite > Ouro > Total de acertos). O consumo de leitura do banco é protegido por paginação e limites rígidos de consultas (Top 50).
* **Banco de Dados Resiliente:** Arquitetura com Firebase Firestore utilizando regras de segurança granulares, índices compostos e salvamento otimizado (*debounce* de escrita a cada 7 segundos sem mudanças) para economizar requisições.

---

## 🛠️ Tecnologias Utilizadas

* **Front-end:** React, TypeScript, Vite
* **Estilização:** CSS3 (Componentização e Layouts Responsivos)
* **Back-end & Infraestrutura:** Firebase Auth, Firestore (NoSQL)
* **Controle de Versão:** Git & GitHub

---

## 🧠 Desafios Técnicos Solucionados

1.  **Otimização de Custos e Infraestrutura:** Inicialmente, o modo convidado gerava centenas de contas anônimas no Firebase. Refatorei a arquitetura para isolar o convidado no armazenamento local, zerando o custo de infraestrutura para usuários casuais.
2.  **Performance em Consultas NoSQL:** Criação e estruturação de índices compostos customizados no Firestore para permitir consultas de ordenação em múltiplos campos com paginação e performance em tempo real.
3.  **Segurança e Consistência:** Implementação de funções de codificação e decodificação de dados para mitigar brechas de segurança no lado do cliente (Client-Side) durante o modo sandbox.

---

## 🔧 Como Rodar o Projeto Localmente

1. Clone o repositório:
   ```bash
   git clone [https://github.com/rochadoug/sabetudo-cristao.git](https://github.com/rochadoug/sabetudo-cristao.git)