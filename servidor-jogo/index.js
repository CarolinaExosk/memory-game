const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/*const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: {
        rejectUnauthorized: false
    }
});
*/

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.post('/pontuar', async (req, res) => {
    const { jogador, pontos, modo_jogo, dificuldade_jogo, pontos_maquina, tempo_final } = req.body;

    if (!jogador || pontos === undefined || !modo_jogo || !dificuldade_jogo || pontos_maquina === undefined || tempo_final === undefined) {
        return res.status(400).json({ error: 'Dados incompletos para salvar a pontuação.' });
    }

    try {
        const query = `
            INSERT INTO pontuacoes (jogador, pontos, modo_jogo, dificuldade_jogo, pontos_maquina, tempo_final)
            VALUES ($1, $2, $3, $4, $5, $6)

                RETURNING *;
`;

        const values = [jogador, pontos, modo_jogo, dificuldade_jogo, pontos_maquina, tempo_final];
        const result = await pool.query(query, values);

        res.status(201).json({ message: 'Pontuação salva com sucesso!', data: result.rows[0] });
    } catch (err) {
        console.error('Erro ao salvar pontuação:', err);
        res.status(500).json({ error: err.message });
    }

});

app.get('/ranking', async (req, res) => {

    try {
        const result = await pool.query(
            `SELECT jogador, pontos, modo_jogo, dificuldade_jogo, pontos_maquina, tempo_final, data
             FROM pontuacoes
             ORDER BY pontos DESC, data ASC

                 LIMIT 10;`

        );

        res.json(result.rows);

    } catch (err) {
        console.error('Erro ao obter ranking:', err);
        res.status(500).json({ error: err.message });
    }

});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);

});