import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const callerFile = Bun.file('./src/allowed/callers.txt'), texterFile = Bun.file('./src/allowed/texters.txt');

const allowed = {
    callers: (await callerFile.text()).split('\n'),
    texters: (await texterFile.text()).split('\n'),
};

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('message_create', async msg => {
    console.log(`${Date.now()}: Message by ${msg.from}: ${msg.body}`);

    if ((await msg.getChat()).isGroup || msg.fromMe) return;

    if (allowed.texters.includes(msg.from)) return;

    await msg.react('💬');
});

client.on('call', async call => {
    console.log(`${Date.now()}: Call by ${call.from}`);

    if (call.isGroup || !call.from) return;

    if (allowed.callers.includes(call.from)) return;

    await call.reject();

    await client.sendMessage(call.from, "❌☎️");
});

client.initialize().then(r => console.log('Client initialized!'));
