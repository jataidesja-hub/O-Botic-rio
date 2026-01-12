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

async function writeDB(data) {
    await fs.writeJson(DB_PATH, data, { spaces: 2 });
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,PUT,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST' || req.method === 'PUT') {
        try {
            const { numeroPedido, etapa, nomeFuncionario } = req.body;

            if (!numeroPedido || !etapa || !nomeFuncionario) {
                return res.status(400).json({
                    error: 'Preencha número do pedido, etapa e nome do funcionário.'
                });
            }

            const etapasValidas = ['Aguardando separação', 'Separação', 'Faturamento', 'Concluído'];
            if (!etapasValidas.includes(etapa)) {
                return res.status(400).json({ error: 'Etapa inválida.' });
            }

            const db = await readDB();

            if (db.pedidos.length === 0) {
                return res.status(404).json({ error: 'Nenhum pedido cadastrado.' });
            }

            // Procura o pedido (de trás pra frente, pega o mais recente)
            let pedidoEncontrado = null;
            for (let i = db.pedidos.length - 1; i >= 0; i--) {
                if (String(db.pedidos[i].numeroPedido).trim() === String(numeroPedido).trim()) {
                    pedidoEncontrado = db.pedidos[i];
                    break;
                }
            }

            if (!pedidoEncontrado) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            // Atualiza o pedido
            const now = new Date();
            pedidoEncontrado.etapa = etapa;
            pedidoEncontrado.funcionario = nomeFuncionario;
            pedidoEncontrado.ultimaAtualizacao = now.toISOString();

            await writeDB(db);

            return res.status(200).json({
                message: 'Etapa atualizada com sucesso!',
                pedido: pedidoEncontrado
            });

        } catch (error) {
            console.error('Erro ao atualizar etapa:', error);
            return res.status(500).json({ error: error.message || 'Erro ao atualizar etapa' });
        }
    }

    return res.status(405).json({ error: 'Método não permitido' });
};
