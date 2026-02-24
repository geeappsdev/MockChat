
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
    const app = express();
    const PORT = 3000;

    // Middleware
    app.use(cors());
    app.use(express.json());

    // In-Memory State for Gee Radio
    let sharedStation = {
        name: "Lofi Beats",
        url: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn", 
        isCustom: false,
        updatedAt: Date.now()
    };

    // --- LISTENER TRACKING ---
    const activeListeners = new Map();
    const HEARTBEAT_TIMEOUT_MS = 15000;

    const getRealListenerCount = () => {
        const now = Date.now();
        let count = 0;
        for (const [clientId, lastSeen] of activeListeners.entries()) {
            if (now - lastSeen > HEARTBEAT_TIMEOUT_MS) {
                activeListeners.delete(clientId);
            } else {
                count++;
            }
        }
        return count;
    };

    // --- API ROUTES ---
    app.get('/api/station', (req, res) => {
        const clientId = req.query.clientId;
        if (clientId) {
            activeListeners.set(clientId, Date.now());
        }
        res.json({
            ...sharedStation,
            listenerCount: getRealListenerCount()
        });
    });

    app.post('/api/station', (req, res) => {
        const { url, name, isCustom } = req.body;
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }
        sharedStation = {
            url,
            name: name || "Special Broadcast",
            isCustom: !!isCustom,
            updatedAt: Date.now()
        };
        res.json(sharedStation);
    });

    // --- VITE MIDDLEWARE (Development) ---
    if (process.env.NODE_ENV !== 'production') {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        // --- STATIC SERVING (Production) ---
        app.use(express.static(path.join(__dirname, 'dist')));
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}

startServer();
