import net from 'net';
import {hexToBin, decodeAdsbMessage} from './asbd-decoder';

const client = new net.Socket();
const HOST = '172.17.0.1';
const PORT = 30002; // default data port of dump1090

client.connect(PORT, HOST, () => {
  console.log(`✅ Verbonden met dump1090 op ${HOST}:${PORT}`);
});

client.on('data', (data) => {
  if (hexToBin(data).length !== 112) {
    return; // ignore messages that are not 112 bits
  }
  console.log(`✈️  Ontvangen: ${data}`);
  console.log(decodeAdsbMessage(data));
});

client.on('error', (err) => {
  console.error(`❌ Fout: ${err.message}`);
});

client.on('close', () => {
  console.log('🔌 Verbinding gesloten');
});
