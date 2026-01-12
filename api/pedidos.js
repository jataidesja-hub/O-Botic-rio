const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Garante que o arquivo existe
async function ensureDB() {
  try {
    await fs.ensureFile(DB_PATH);
    const content = await fs.readFile(DB_PATH, 'utf8');
    if (!content.trim()) {
      await fs.writeJson(DB_PATH, { pedidos: [], funcionarios: [] });
    }
  } catch (error) {
    await fs.writeJson(DB_PATH, { pedidos: [], funcionarios: [] });
  }
}

// Lê o banco de dados
async function readDB() {
  await ensureDB();
  return await fs.readJson(DB_PATH);
}

// Escreve no banco de dados
async function writeDB(data) {
  await fs.writeJson(DB_PATH, data, { spaces: 2 });
}

// Calcula prioridade da etapa
function etapaPriority(etapa) {
  if (!etapa) return 999;
  const e = String(etapa).toLowerCase();
  if (e.includes('aguardando separação') || e.includes('aguardando separacao')) return 1;
  if (e.includes('separação') || e.includes('separacao')) return 2;
  if (e.includes('faturamento')) return 3;
  if (e.includes('concluído') || e.includes('concluido')) return 4;
  return 999;
}

// Formata tempo decorrido
function formatarTempoDecorrido(inicio, fim) {
  const diffMs = fim.getTime() - inicio.getTime();
  if (diffMs < 0) return '';

  const minutosTotais = Math.floor(diffMs / 60000);
  const horas = Math.floor(minutosTotais / 60);
  const minutos = minutosTotais % 60;

  let texto = '';
  if (horas > 0) {
    texto += horas + 'h ';
  }
  texto += minutos + 'min';
  return texto;
}

// Formata data para exibição
function formatarData(date) {
  if (!date) return '';
  const d = new Date(date);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Formata data/hora para exibição
function formatarDataHora(date) {
  if (!date) return '';
  const d = new Date(date);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await readDB();

    // GET - Retorna todos os pedidos ordenados
    if (req.method === 'GET') {
      const agora = new Date();
      
      const lista = db.pedidos
        .filter(p => p.id && p.numeroPedido)
        .map(p => {
          const dataRegistro = new Date(p.dataRegistro);
          const dataPedido = new Date(p.dataPedido);
          const ultimaAtualizacao = new Date(p.ultimaAtualizacao);

          // Calcula tempo decorrido
          let tempoDecorrido = '';
          const etapaStr = String(p.etapa || '').toLowerCase();
          if (etapaStr.includes('concluído') || etapaStr.includes('concluido')) {
            tempoDecorrido = formatarTempoDecorrido(dataRegistro, ultimaAtualizacao);
          } else {
            tempoDecorrido = formatarTempoDecorrido(dataRegistro, agora);
          }

          return {
            id: p.id,
            dataRegistro: formatarDataHora(p.dataRegistro),
            dataPedido: formatarData(p.dataPedido),
            numeroPedido: p.numeroPedido,
            vendedora: p.vendedora,
            etapa: p.etapa,
            funcionario: p.funcionario || '',
            ultimaAtualizacao: formatarDataHora(p.ultimaAtualizacao),
            tempoDecorrido: tempoDecorrido,
            _etapaPri: etapaPriority(p.etapa),
            _dataPedidoRaw: dataPedido.getTime(),
            _dataRegistroRaw: dataRegistro.getTime()
          };
        });

      // Ordena por prioridade da etapa e data do pedido
      lista.sort((a, b) => {
        if (a._etapaPri !== b._etapaPri) {
          return a._etapaPri - b._etapaPri;
        }
        if (a._dataPedidoRaw !== b._dataPedidoRaw) {
          return a._dataPedidoRaw - b._dataPedidoRaw;
        }
        return a._dataRegistroRaw - b._dataRegistroRaw;
      });

      return res.status(200).json(lista);
    }

    // POST - Cria novo pedido
    if (req.method === 'POST') {
      const { nomeVendedora, numeroPedido, dataPedidoStr } = req.body;

      if (!nomeVendedora || !numeroPedido) {
        return res.status(400).json({ error: 'Informe o nome da vendedora e o número do pedido.' });
      }

      const now = new Date();
      const novoId = db.pedidos.length + 1;

      let dataPedido;
      if (dataPedidoStr) {
        dataPedido = new Date(dataPedidoStr);
      } else {
        dataPedido = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }

      const novoPedido = {
        id: novoId,
        dataRegistro: now.toISOString(),
        dataPedido: dataPedido.toISOString(),
        numeroPedido: numeroPedido,
        vendedora: nomeVendedora,
        etapa: 'Aguardando separação',
        funcionario: '',
        ultimaAtualizacao: now.toISOString()
      };

      db.pedidos.push(novoPedido);
      await writeDB(db);

      return res.status(201).json({ message: 'Pedido registrado com sucesso!', pedido: novoPedido });
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('Erro na API pedidos:', error);
    return res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
};
