# 💄 Sistema de Gerenciamento de Pedidos - O Boticário

Sistema completo para gerenciamento de pedidos de distribuidora de perfumes O Boticário, com três telas principais: **Recepção**, **Painel do Galpão** e **Operação**.

## 🚀 Funcionalidades

### 📝 Recepção (Registro de Pedidos)
- Cadastro de novos pedidos
- Campos: Nome da vendedora, Nº do pedido, Data do pedido (opcional)
- Validação automática de dados

### 📊 Painel do Galpão
- Visualização em tempo real de todos os pedidos
- Estatísticas por etapa (Aguardando, Separação, Faturamento, Concluído)
- **Notificação sonora** quando novos pedidos entram em "Aguardando separação"
- **Popup visual** destacando novos pedidos
- Atualização automática a cada 5 segundos
- Ordenação inteligente por prioridade e antiguidade

### ⚙️ Operação (Separação/Faturamento)
- Interface para funcionários atualizarem status dos pedidos
- Seleção de funcionário e pedido
- Atualização de etapas: Aguardando → Separação → Faturamento → Concluído
- Atualização automática das listas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js com Serverless Functions (Vercel)
- **Database**: JSON File Storage (fácil migração para Vercel KV/Postgres)
- **Hosting**: Vercel

## 📦 Instalação Local

```bash
# 1. Clone o repositório
git clone <seu-repo>
cd Oboticaro

# 2. Instale as dependências
npm install

# 3. Rode o servidor de desenvolvimento
npm run dev

# 4. Acesse no navegador
http://localhost:3000
```

## 🌐 Deploy no Vercel

### Opção 1: Via Vercel CLI

```bash
# 1. Instale o Vercel CLI globalmente
npm install -g vercel

# 2. Faça login na sua conta Vercel
vercel login

# 3. Deploy (primeira vez)
vercel

# 4. Deploy em produção
vercel --prod
```

### Opção 2: Via GitHub + Vercel Dashboard

1. Faça push do código para o GitHub:
```bash
git add .
git commit -m "Sistema O Boticário migrado para Vercel"
git push origin main
```

2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Importe seu repositório do GitHub
5. Clique em "Deploy"

## 📁 Estrutura do Projeto

```
Oboticaro/
├── api/                        # API Serverless
│   ├── pedidos.js             # GET/POST pedidos
│   ├── funcionarios.js        # GET funcionários
│   ├── atualizar-etapa.js     # PUT atualizar etapa
│   └── pedidos-disponiveis.js # GET pedidos não concluídos
├── public/                     # Frontend
│   ├── index.html             # Recepção
│   ├── painel.html            # Painel do Galpão
│   └── operacao.html          # Operação
├── data/                       # Banco de dados
│   └── db.json                # Armazenamento JSON
├── package.json
├── vercel.json                # Configuração Vercel
└── README.md
```

## 🔧 Configuração Inicial

### Adicionar Funcionários

Edite o arquivo `data/db.json` e adicione funcionários:

```json
{
  "pedidos": [],
  "funcionarios": [
    {
      "nome": "João Silva",
      "funcao": "Separação",
      "ativo": true
    },
    {
      "nome": "Maria Santos",
      "funcao": "Faturamento",
      "ativo": true
    }
  ]
}
```

### Para desativar um funcionário:
```json
{
  "nome": "João Silva",
  "funcao": "Separação",
  "ativo": false
}
```

## 📡 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/pedidos` | Lista todos os pedidos ordenados |
| POST | `/api/pedidos` | Cria um novo pedido |
| GET | `/api/funcionarios` | Lista funcionários ativos |
| GET | `/api/pedidos-disponiveis` | Lista pedidos não concluídos |
| POST | `/api/atualizar-etapa` | Atualiza etapa de um pedido |

## 🎨 Melhorias em Relação ao Apps Script

✅ **Design moderno e responsivo** com gradientes e animações  
✅ **Notificações em tempo real** com som e popup visual  
✅ **Estatísticas no painel** mostrando contadores por etapa  
✅ **Interface mais intuitiva** e fácil de usar  
✅ **Performance melhorada** com atualização assíncrona  
✅ **Independente do Google** - hospedagem própria  
✅ **Fácil de escalar** - preparado para migrar para DB real  

## 🔄 Migração Futura para Banco de Dados

O sistema está preparado para fácil migração para:
- **Vercel KV** (Redis)
- **Vercel Postgres**
- **MongoDB**
- **Firebase**

Basta alterar as funções em `api/*.js` para usar o novo banco.

## 📞 Suporte

Desenvolvido por **J.A SOFTWARE & SOLUTION**

---

**Versão**: 1.0.0  
**License**: MIT
