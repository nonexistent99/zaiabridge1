
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const MarchaPay = require('./marchaPay');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const marcha = new MarchaPay(
  process.env.MARCHA_PUBLIC_KEY,
  process.env.MARCHA_SECRET_KEY,
  process.env.MARCHA_ENVIRONMENT === 'sandbox'
);

app.post('/generate-pix', async (req, res) => {
  try {
    const { amount, customer, items, expiresInDays } = req.body;

    if (!amount || !customer || !items) {
      return res.status(400).json({ error: 'Dados insuficientes para gerar o PIX.' });
    }

    const pixData = {
      amount: MarchaPay.toCents(amount),
      customer,
      items,
      pix: {
        expiresInDays: expiresInDays || 1,
      },
    };

    const resultado = await marcha.createPixTransaction(pixData);

    res.json({
      qrCode: resultado.qrCode,
      copyAndPaste: resultado.copyAndPaste,
      transactionId: resultado.id,
    });
  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    res.status(500).json({ error: 'Não foi possível gerar o PIX.' });
  }
});

// Endpoint de health check
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
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.MARCHA_ENVIRONMENT || 'not-set'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de ponte rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.MARCHA_ENVIRONMENT || 'não configurado'}`);
  console.log(`Chave pública: ${process.env.MARCHA_PUBLIC_KEY ? 'configurada' : 'NÃO CONFIGURADA'}`);
  console.log(`Chave secreta: ${process.env.MARCHA_SECRET_KEY ? 'configurada' : 'NÃO CONFIGURADA'}`);
});
