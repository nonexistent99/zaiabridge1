const express = require('express');
const app = express();
const MarchaPay = require('./marchaPay');

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

// Endpoint raiz
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Servidor de ponte Zaia IA - Marcha Pay está rodando',
        endpoints: {
            health: 'GET /health',
            generatePix: 'POST /generate-pix'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ sta
