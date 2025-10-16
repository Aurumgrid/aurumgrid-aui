// twitch-chat.js
const WebSocket = require('ws');
const { SocksProxyAgent } = require('socks-proxy-agent');
const agent = new SocksProxyAgent('socks5://tor:9050');

const channel = process.argv[2];
if (!channel) {
  console.error('Error: Channel name must be provided as an argument.');
  process.exit(1);
}

const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443', {
  agent
});

ws.on('open', () => {
  ws.send(`PASS oauth:${process.env.TWITCH_OAUTH_TOKEN || 'YOUR_TWITCH_OAUTH_TOKEN'}`);
  ws.send('NICK your_nick');
  ws.send(`JOIN #${channel}`);
  console.log(`Joined channel: #${channel}`);
});

function parseIRC(message) {
  const text = message.toString().trim();

  // Twitch IRC servers send PING messages to check if the connection is still alive.
  // We must respond with a PONG message to avoid being disconnected.
  if (text.startsWith('PING')) {
    ws.send('PONG :tmi.twitch.tv');
    console.log('Responded to PING.');
    return null; // No user message to parse
  }

  // A real implementation would parse the full IRC message format.
  // This is a simplified parser for demonstration.
  const match = text.match(/:([^!]+)!.* PRIVMSG #[^ ]+ :(.*)/);
  if (match) {
    return { user: match[1], text: match[2] };
  }

  // Log other system messages for debugging
  return { user: 'system', text: text };
}

ws.on('message', (m) => {
  const parsed = parseIRC(m);
  if (parsed) {
    const { user, text } = parsed;
    // We output the message to stdout, which will be captured by the server
    // and can be streamed to the client.
    console.log(`${user}: ${text}`);
  }
});

ws.on('close', (code, reason) => {
  console.log(`Disconnected from Twitch IRC: ${code} - ${reason}`);
});

ws.on('error', (err) => {
  console.error('Error with Twitch IRC connection:', err);
});
