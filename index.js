const express = require('express');
const { status } = require('minecraft-server-util');

const app = express();
const PORT = process.env.PORT || 3000;

const server = process.env.MC_HOST || 'KitekMC.aternos.me';
const minecraftPort = Number(process.env.MC_PORT || 50615);

async function getServerStatus() {
    try {
        const response = await status(server, minecraftPort);

        return {
            online: true,
            host: server,
            port: minecraftPort,
            version: response.version.name,
            players: {
                online: response.players.online,
                max: response.players.max
            },
            motd: response.motd.clean
        };
    } catch (error) {
        return {
            online: false,
            host: server,
            port: minecraftPort,
            error: error.message
        };
    }
}

app.get('/', async (req, res) => {
    res.json(await getServerStatus());
});

app.get('/status', async (req, res) => {
    res.json(await getServerStatus());
});

app.get('/health', (req, res) => {
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`API dziala na porcie ${PORT}`);
});
