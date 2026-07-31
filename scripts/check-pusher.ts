import fs from 'fs';
import path from 'path';
import Pusher from 'pusher';

// Load .env manually
try {
  const envPath = path.resolve(process.cwd(), '.env');
  const envFile = fs.readFileSync(envPath, 'utf-8');
  // Handle both \r\n (Windows) and \n (Unix) line endings
  envFile.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  });
} catch(e) { console.error('Could not load .env:', e); }

(async () => {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

  console.log('=================================');
  console.log('🔍 Pusher Status Check');
  console.log('=================================');
  console.log('  App ID  :', appId || 'MISSING');
  console.log('  Key     :', key || 'MISSING');
  console.log('  Cluster :', cluster);
  console.log('  Secret  :', secret ? '***hidden***' : 'MISSING');
  console.log('');

  if (!appId || !key || !secret) {
    console.error('❌ Missing Pusher credentials in .env');
    process.exit(1);
  }

  console.log('📡 Sending test trigger...');

  try {
    const pusher = new Pusher({ appId, key, secret, cluster, useTLS: true });
    const res: any = await Promise.race([
      pusher.trigger('test-channel', 'test-event', { msg: 'ping', ts: new Date().toISOString() }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 8 seconds')), 8000))
    ]);
    console.log('✅ Pusher SUCCESS! HTTP Status:', res?.status);
  } catch(e: any) {
    console.error('❌ Pusher FAILED:', e.message);
  }

  process.exit(0);
})();
