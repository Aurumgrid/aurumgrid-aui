// collector.js
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

// Buffer local (pode ser substituído por DB)
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

app.use(bodyParser.json());

app.post("/collect", (req, res) => {
  const log = req.body;
  const filename = path.join(logsDir, `${Date.now()}-${log.eventType}.json`);

  fs.writeFileSync(filename, JSON.stringify(log, null, 2));
  console.log("Evento recebido:", log);

  // Aqui você pode chamar a API do Arweave:
  // await arweave.transactions.post(tx)

  res.status(200).send({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Collector rodando em http://localhost:${PORT}`);
});
