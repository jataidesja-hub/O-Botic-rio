const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'GET') {
        try {
            const pedidos = await kv.get('pedidos') || [];
            const disponiveis = pedidos
                .filter(p => {
                    const e = String(p.etapa || '').toLowerCase();
                    return !e.includes('concluido') && !e.includes('concluído');
                })
                .map(p => String(p.numeroPedido));

            return res.status(200).json([...new Set(disponiveis)].sort());
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};
