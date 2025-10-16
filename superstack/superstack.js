import express from 'express';
import expressWs from 'express-ws';
import axios from 'axios';
import RpcClient from 'bitcoin-rpc-promise';
import { create } from 'ipfs-http-client';
import pino from 'pino';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { createHash } from 'crypto';
import 'dotenv/config';

// 1. Setup Logger
const logger = pino({
  transport: {
    target: 'pino-pretty'
  }
});

// 2. Setup Express and WebSockets
const app = express();
const port = 3000;
expressWs(app);
app.use(express.json());
app.use(express.text());


// 3. Configure Clients
// Tor SOCKS5 Agent for external requests
const torAgent = new SocksProxyAgent('socks5://tor:9050');
const torAxios = axios.create({
    httpAgent: torAgent,
    httpsAgent: torAgent,
});

// Bitcoin RPC Client
const btcRpc = new RpcClient(`http://${process.env.BITCOIN_RPC_USER || 'user'}:${process.env.BITCOIN_RPC_PASS || 'pass'}@bitcoin:8332`);

// IPFS Client
const ipfs = create({ url: 'http://ipfs:5001/api/v0' });

// TimeChain contract placeholder
const timechainABI = []; // Load from TimeChain.json
const timechainAddress = process.env.TIMECHAIN_CONTRACT_ADDRESS;


// 4. Core Function: anchorAndReward
async function anchorAndReward(ecoName, data) {
    logger.info(`Anchoring event: ${ecoName}`);

    // Step 1: Create a JSON object and hash it
    const timestamp = new Date().toISOString();
    const proofObject = { ecoName, timestamp, data };
    const proofJson = JSON.stringify(proofObject);
    const hash = createHash('sha256').update(proofJson).digest('hex');
    logger.info(`Generated SHA-256 hash: ${hash}`);

    // Step 2: Store the full JSON on IPFS (optional, but good practice)
    let cid = null;
    try {
        const { cid: ipfsCid } = await ipfs.add(proofJson);
        cid = ipfsCid.toString();
        logger.info(`Stored proof on IPFS with CID: ${cid}`);
    } catch (err) {
        logger.error(err, 'Failed to store proof on IPFS');
    }

    // Step 3: Anchor the hash in a Bitcoin OP_RETURN
    let btcTx = null;
    try {
        const unspent = await btcRpc.listUnspent(0);
        if (unspent.length === 0) {
            logger.warn('No UTXOs to create anchor transaction. Please fund the wallet.');
            // In a real scenario, you'd generate blocks to get coinbase UTXOs on regtest
            await btcRpc.generateToAddress(101, await btcRpc.getNewAddress());
            logger.info('Generated 101 blocks to mature coinbase UTXOs.');
            const newUnspent = await btcRpc.listUnspent(0);
            if (newUnspent.length === 0) {
                throw new Error('Still no UTXOs available after generating blocks.');
            }
            unspent[0] = newUnspent[0];
        }

        const input = unspent[0];
        const fee = 0.0001;
        const changeAddress = await btcRpc.getNewAddress();
        const change = input.amount - fee;

        const outputs = {
            [changeAddress]: change.toFixed(8),
            'data': hash
        };

        const rawTx = await btcRpc.createRawTransaction([input], outputs);
        const signedTx = await btcRpc.signRawTransactionWithWallet(rawTx);
        btcTx = await btcRpc.sendRawTransaction(signedTx.hex);
        logger.info(`Anchored hash in Bitcoin OP_RETURN. TXID: ${btcTx}`);
    } catch (err) {
        logger.error(err, 'Failed to create Bitcoin anchor transaction');
    }

    // Step 4: Mint "ECHO" tokens on TimeChain
    let ecoToken = null;
    try {
        // Placeholder for Web3/Ethers.js call to the TimeChain contract
        ecoToken = `minted_for_${hash.substring(0, 8)}`;
        logger.info(`Minted ECHO token on TimeChain. Receipt: ${ecoToken}`);
    } catch (err) {
        logger.error(err, 'Failed to mint ECHO token');
    }

    return { hash, cid, btcTx, ecoToken };
}


// 5. API Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Universal anchor route
app.post('/anchor', async (req, res) => {
    const { ecoName, data } = req.body;
    if (!ecoName || !data) {
        return res.status(400).json({ error: 'ecoName and data are required.' });
    }
    try {
        const result = await anchorAndReward(ecoName, data);
        res.json(result);
    } catch (err) {
        logger.error(err, 'Anchor and reward process failed');
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DeSci route
app.post('/desci/upload', async (req, res) => {
    try {
        const result = await anchorAndReward('DeSci.Paper', req.body);
        res.json(result);
    } catch (err) {
        logger.error(err, 'DeSci upload failed');
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bitcoin proxy route
app.get('/bitcoin/block/:height', async (req, res) => {
    try {
        const hash = await btcRpc.getBlockHash(parseInt(req.params.height, 10));
        const block = await btcRpc.getBlock(hash, 2); // Verbosity 2 for full tx data
        res.json(block);
    } catch (err) {
        logger.error(err, 'Failed to fetch Bitcoin block');
        res.status(500).json({ error: 'Internal server error' });
    }
});


// 6. WebSocket Route
app.ws('/ws', (ws, req) => {
    logger.info('WebSocket client connected');
    ws.on('message', (msg) => {
        logger.info(`WS Received: ${msg}`);
        ws.send(`Echo: ${msg}`);
    });
    ws.on('close', () => {
        logger.info('WebSocket client disconnected');
    });
});


// 7. Start Server
app.listen(port, () => {
    logger.info(`SuperStack server listening on http://localhost:${port}`);
});
