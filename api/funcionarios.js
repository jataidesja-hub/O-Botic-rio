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

            // Retorna apenas funcionários ativos
            const funcionariosAtivos = db.funcionarios
                .filter(f => f.nome && f.ativo !== false)
                .map(f => f.nome)
                .sort();

            // Remove duplicatas
            const funcionariosUnicos = [...new Set(funcionariosAtivos)];

            return res.status(200).json(funcionariosUnicos);

        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
            return res.status(500).json({ error: error.message || 'Erro ao buscar funcionários' });
        }
    }

    return res.status(405).json({ error: 'Método não permitido' });
};
