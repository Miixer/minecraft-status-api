const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const server = process.env.MC_HOST || 'KitekMC.aternos.me';
const minecraftPort = Number(process.env.MC_PORT || 50615);

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

function buildOfflineResponse(error = 'Server is offline') {
    return {
        online: false,
        status: 'OFFLINE',
        host: server,
        port: minecraftPort,
        version: 'Niedostepna',
        players: {
            online: 0,
            max: 0
        },
        motd: error,
        checkedAt: new Date().toISOString()
    };
}

async function getServerStatus() {
    try {
        const address = `${server}:${minecraftPort}`;
        const url = `https://api.mcstatus.io/v2/status/java/${address}?query=true&timeout=5`;

        const response = await fetch(url, {
            headers: {
                accept: 'application/json'
            }
        });

        if (!response.ok) {
            return buildOfflineResponse(`mcstatus.io error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.online) {
            return buildOfflineResponse();
        }

        const version = data.version?.name_clean || data.version?.name_raw || 'Nieznana';
        const playersOnline = Number(data.players?.online || 0);
        const playersMax = Number(data.players?.max || 0);
        const motd = String(data.motd?.clean || '').trim();

        return {
            online: true,
            status: 'ONLINE',
            host: data.host || server,
            port: data.port || minecraftPort,
            version,
            players: {
                online: playersOnline,
                max: playersMax
            },
            motd,
            checkedAt: new Date().toISOString()
        };
    } catch (error) {
        return buildOfflineResponse(error.message);
    }
}

app.get('/', async (req, res) => {
    res.json(await getServerStatus());
});

app.get('/status', async (req, res) => {
    res.json(await getServerStatus());
});

app.get('/health', (req, res) => {
    res.json({
        ok: true,
        checkedAt: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`API dziala na porcie ${PORT}`);
});
