
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
    console.log('📥 Requisição recebida:', JSON.stringify(req.body, null, 2));
    
    let { amount, customer, items } = req.body;

    // Validações básicas
    if (!amount || amount <= 0) {
      console.log('❌ Erro: Amount inválido');
      return res.status(400).json({ error: 'Amount é obrigatório e deve ser maior que 0' });
    }

    if (!customer || !customer.name) {
      console.log('❌ Erro: Dados do cliente inválidos');
      return res.status(400).json({ error: 'Dados do cliente são obrigatórios (name)' });
    }

    if (!items || items.length === 0) {
      console.log('❌ Erro: Items vazio');
      return res.status(400).json({ error: 'Ao menos um item é obrigatório' });
    }

    // Normaliza o documento - pode vir como string ou objeto
    let document = customer.document;
    // Se já é um objeto, mantém; se é string, converte
    if (typeof document === 'string') {
      document = {
        number: document,
        type: '50958347824' // CPF
      };
    }

    // Normaliza os items - aceita tanto 'price'/'unitPrice' quanto 'name'/'title'
    const normalizedItems = items.map(item => ({
      title: item.title || item.name || 'Item',
      unitPrice: item.unitPrice || item.price || 0,
      quantity: item.quantity || 1,
      tangible: item.tangible !== undefined ? item.tangible : false
    }));

    console.log('✅ Dados validados');
    console.log('📊 Amount:', amount);
    console.log('👤 Customer:', customer.name);
    console.log('📦 Items:', normalizedItems);

    const pixData = {
      amount: MarchaPay.toCents(amount),
      customer: {
        name: customer.name,
        email: customer.email,
        document: document,
        phone: customer.phone
      },
      items: normalizedItems,
      pix: {
        expiresInDays: 1
      }
    };

    console.log('🚀 Enviando para Marcha Pay:', JSON.stringify(pixData, null, 2));

    const resultado = await marcha.createPixTransaction(pixData);

    console.log('✅ PIX criado com sucesso!');
    console.log('Transaction ID:', resultado.id);

    res.json({
      qrCode: resultado.qrCode,
      copyAndPaste: resultado.copyAndPaste,
      transactionId: resultado.id,
    });
  } catch (error) {
    console.error('❌ Erro ao gerar PIX:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Não foi possível gerar o PIX.',
      details: error.message 
    });
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
