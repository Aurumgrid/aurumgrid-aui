// server.js
const express = require('express');
const { getStream } = require('./twitch-helix.js');
const { spawn } = require('child_process');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/twitch/stream', express.text(), async (req, res) => {
  try {
    const stream = await getStream(req.body);
    res.json(stream);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching stream data');
  }
});

app.get('/twitch/chat/:channel', (req, res) => {
  const { channel } = req.params;
  const chatProcess = spawn('node', ['twitch-chat.js', channel]);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  chatProcess.stdout.on('data', (data) => {
    res.write(`data: ${data.toString()}\n\n`);
  });

  chatProcess.stderr.on('data', (data) => {
    console.error(`Chat[${channel}] Error: ${data}`);
    res.write(`data: ERROR: ${data.toString()}\n\n`);
  });

  req.on('close', () => {
    chatProcess.kill();
  });
});

app.get('/twitch/hls/:channel/:quality', (req, res) => {
  const { channel, quality } = req.params;
  const hlsProcess = spawn('./twitch-hls.sh', [channel, quality]);

  hlsProcess.stdout.pipe(res);

  hlsProcess.stderr.on('data', (data) => {
    console.error(`HLS[${channel}] Error: ${data}`);
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
