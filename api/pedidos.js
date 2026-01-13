const { kv } = require('@vercel/kv');

// Calcula prioridade da etapa
function etapaPriority(etapa) {
  if (!etapa) return 999;
  const e = String(etapa).toLowerCase();
  if (e.includes('aguardando')) return 1;
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
  return horas > 0 ? `${horas}h ${minutos}min` : `${minutos}min`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET - Retorna todos os pedidos
    if (req.method === 'GET') {
      const pedidos = await kv.get('pedidos') || [];
      const agora = new Date();

      const lista = pedidos.map(p => {
        const dataRegistro = new Date(p.dataRegistro);
        const dataPedido = new Date(p.dataPedido);
        const ultimaAtualizacao = new Date(p.ultimaAtualizacao);

        let tempoDecorrido = '';
        const etapaStr = String(p.etapa || '').toLowerCase();
        if (etapaStr.includes('concluído') || etapaStr.includes('concluido')) {
          tempoDecorrido = formatarTempoDecorrido(dataRegistro, ultimaAtualizacao);
        } else {
          tempoDecorrido = formatarTempoDecorrido(dataRegistro, agora);
        }

        return {
          ...p,
          dataRegistro: dataRegistro.toLocaleString('pt-BR'),
          dataPedido: dataPedido.toLocaleDateString('pt-BR'),
          ultimaAtualizacao: ultimaAtualizacao.toLocaleString('pt-BR'),
          tempoDecorrido,
          _etapaPri: etapaPriority(p.etapa),
          _dataPedidoRaw: dataPedido.getTime(),
          _dataRegistroRaw: dataRegistro.getTime()
        };
      });

      lista.sort((a, b) => (a._etapaPri - b._etapaPri) || (a._dataPedidoRaw - b._dataPedidoRaw));
      return res.status(200).json(lista);
    }

    // POST - Cria novo pedido
    if (req.method === 'POST') {
      const { nomeVendedora, numeroPedido, dataPedidoStr } = req.body;
      if (!nomeVendedora || !numeroPedido) return res.status(400).json({ error: 'Dados incompletos' });

      const now = new Date();
      const pedidos = await kv.get('pedidos') || [];

      const novoPedido = {
        id: pedidos.length + 1,
        dataRegistro: now.toISOString(),
        dataPedido: dataPedidoStr ? new Date(dataPedidoStr).toISOString() : now.toISOString(),
        numeroPedido,
        vendedora: nomeVendedora,
        etapa: 'Aguardando separação',
        funcionario: '',
        ultimaAtualizacao: now.toISOString()
      };

      pedidos.push(novoPedido);
      await kv.set('pedidos', pedidos);

      return res.status(201).json({ message: 'Pedido registrado!', pedido: novoPedido });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
