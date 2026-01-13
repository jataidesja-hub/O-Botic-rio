const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,PUT,OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { numeroPedido, etapa, nomeFuncionario } = req.body;
        const pedidos = await kv.get('pedidos') || [];

        const index = pedidos.findIndex(p => String(p.numeroPedido) === String(numeroPedido));
        if (index === -1) return res.status(404).json({ error: 'Pedido não encontrado' });

        pedidos[index].etapa = etapa;
        pedidos[index].funcionario = nomeFuncionario;
        pedidos[index].ultimaAtualizacao = new Date().toISOString();

        await kv.set('pedidos', pedidos);
        return res.status(200).json({ message: 'Etapa atualizada!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
