const express = require('express');
const app = express();
const MarchaPay = require('./marchaPay');

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Endpoint raiz
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Servidor de ponte Zaia IA - Marcha Pay está rodando',
        endpoints: {
            health: 'GET /',
            generatePix: 'POST /generate-pix'
        }
    });
});

// Endpoint de health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Endpoint para gerar PIX
app.post('/generate-pix', async (req, res) => {
    try {
        // ------------------------------------------------------------------
        // CORREÇÃO APLICADA AQUI:
        // Removido o terceiro parâmetro 'true' para que o modo de produção
        // seja usado por padrão, conforme definido em marchaPay.js.
        // ------------------------------------------------------------------
        const marchaPay = new MarchaPay(
            process.env.PUBLIC_KEY,
            process.env.SECRET_KEY
        );

        const pixData = req.body;
        const pixTransaction = await marchaPay.createPixTransaction(pixData);

        res.json(pixTransaction);
    } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        res.status(500).json({ error: 'Erro interno ao processar a transação PIX.' });
    }
// ...
app.listen(PORT, () => {
    console.log(`Servidor de ponte rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.MARCHA_ENVIRONMENT || 'Não Definido'}`);
    console.log(`Chave pública: ${process.env.MARCHA_PUBLIC_KEY ? 'configurada' : 'NÃO CONFIGURADA'}`);
    console.log(`Chave secreta: ${process.env.MARCHA_SECRET_KEY ? 'configurada' : 'NÃO CONFIGURADA'}`);
});

