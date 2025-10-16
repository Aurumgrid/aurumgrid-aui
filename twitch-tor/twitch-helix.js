// twitch-helix.js
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
const agent = new SocksProxyAgent('socks5://tor:9050');

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || 'your_public_client_id'; // no secret needed

const helix = axios.create({
  baseURL: 'https://api.twitch.tv/helix',
  headers: { 'Client-Id': TWITCH_CLIENT_ID },
  httpsAgent: agent
});

async function getStream(login) {
  const { data } = await helix.get('/streams', { params: { user_login: login } });
  return data.data[0]; // live stream object
}

module.exports = { getStream };
