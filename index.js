import net from 'net';

// Maak verbinding met dump1090 op poort 30001
const client = new net.Socket();
const HOST = 'host.docker.internal'; // of gebruik '127.0.0.1' als je geen Docker gebruikt
const PORT = 30001;

client.connect(PORT, HOST, () => {
  console.log(`✅ Verbonden met dump1090 op ${HOST}:${PORT}`);
});

// Elke keer als er data binnenkomt van dump1090
client.on('data', (data) => {
  console.log(`✈️  Ontvangen: ${data.toString('hex')}`);
  // Hier kun je evt. verder parsen/analyseren
});

// Foutafhandeling
client.on('error', (err) => {
  console.error(`❌ Fout: ${err.message}`);
});

// Verbinding gesloten
client.on('close', () => {
  console.log('🔌 Verbinding gesloten');
});
