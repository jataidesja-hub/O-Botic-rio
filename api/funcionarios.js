const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'GET') {
        try {
            // Se não houver funcionários no KV, retorna uma lista padrão inicial
            let funcionarios = await kv.get('funcionarios');

            if (!funcionarios) {
                funcionarios = [
                    { nome: "João Silva", ativo: true },
                    { nome: "Maria Santos", ativo: true }
                ];
                await kv.set('funcionarios', funcionarios);
            }

            const ativos = funcionarios
                .filter(f => f.ativo !== false)
                .map(f => f.nome)
                .sort();

            return res.status(200).json(ativos);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};
