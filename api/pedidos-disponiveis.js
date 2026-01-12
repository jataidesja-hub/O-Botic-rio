const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

async function readDB() {
    try {
        return await fs.readJson(DB_PATH);
    } catch (error) {
        return { pedidos: [], funcionarios: [] };
    }
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            const db = await readDB();

            // Retorna apenas pedidos NÃO concluídos
            const numerosSet = new Set();

            db.pedidos.forEach(p => {
                if (!p.numeroPedido) return;

                const etapaStr = String(p.etapa || '').toLowerCase();
                // Se concluído, não adiciona
                if (etapaStr.includes('concluído') || etapaStr.includes('concluido')) {
                    return;
                }

                numerosSet.add(String(p.numeroPedido));
            });

            const numeros = Array.from(numerosSet).sort();

            return res.status(200).json(numeros);

        } catch (error) {
            console.error('Erro ao buscar pedidos disponíveis:', error);
            return res.status(500).json({ error: error.message || 'Erro ao buscar pedidos' });
        }
    }

    return res.status(405).json({ error: 'Método não permitido' });
};
