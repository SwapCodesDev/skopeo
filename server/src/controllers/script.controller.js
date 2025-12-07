const path = require('path');
const fs = require('fs');

class ScriptController {
    getInspectScript(req, res) {
        const scriptPath = path.join(__dirname, '../../public/js/inspect-script.js');
        // try standard path first (for local), then fallback for Vercel structure if needed
        if (fs.existsSync(scriptPath)) {
            res.setHeader('Content-Type', 'application/javascript');
            return res.sendFile(scriptPath);
        }

        // Backup path check for different deployment structures
        const altPath = path.join(process.cwd(), 'server/public/js/inspect-script.js');
        if (fs.existsSync(altPath)) {
            res.setHeader('Content-Type', 'application/javascript');
            return res.sendFile(altPath);
        }

        console.error(`Script not found at ${scriptPath} or ${altPath}`);
        res.status(404).send('Script not found');
    }
}

module.exports = new ScriptController();
