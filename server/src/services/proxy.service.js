const axios = require('axios');
const config = require('../config');

class ProxyService {
    async fetchPage(url) {
        try {
            const response = await axios.get(url, {
                headers: { 'User-Agent': config.USER_AGENT },
                responseType: 'text',
                timeout: config.TIMEOUT,
                validateStatus: (status) => status < 500
            });

            return {
                data: response.data,
                contentType: response.headers['content-type'],
                status: response.status
            };
        } catch (error) {
            throw this._normalizeError(error);
        }
    }

    injectScript(html, url, baseUrl) {
        let processedHtml = html;

        // Safety Shim (Patches History API & Console to prevent crashes/noise)
        // Injected implicitly inline to run BEFORE any external scripts
        const safetyShim = `
            <script>
                (function() {
                    try {
                        const noop = function() {};
                        // Prevent target site from messing with history or crashing
                        window.history.pushState = noop;
                        window.history.replaceState = noop;
                        
                        // Optional: Catch globally to prevent noise
                        window.onerror = function(msg, url, line) {
                            // console.log('Suppressed error:', msg);
                            return true; // Suppress default error handling
                        };
                    } catch(e) {}
                })();
            </script>
        `;

        // Inject Base Tag & Shim
        if (processedHtml.includes('<head>')) {
            processedHtml = processedHtml.replace('<head>', `<head><base href="${url}" />${safetyShim}`);
        } else {
            processedHtml = `<base href="${url}" />${safetyShim}` + processedHtml;
        }

        // Inject Inspection Script (At the end to ensure DOM is ready for inspector)
        const scriptUrl = `${baseUrl}/js/inspect-script.js`;
        const scriptTag = `<script src="${scriptUrl}"></script>`;
        if (processedHtml.includes('</body>')) {
            processedHtml = processedHtml.replace('</body>', `${scriptTag}</body>`);
        } else {
            processedHtml += scriptTag;
        }

        return processedHtml;
    }

    _normalizeError(error) {
        const err = new Error(error.message);
        if (error.code === 'ECONNABORTED') {
            err.statusCode = 504;
            err.message = "Request timed out. The target site is too slow.";
        } else if (error.response) {
            err.statusCode = error.response.status;
            err.message = `Target site returned error: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
            err.statusCode = 502;
            err.message = "Bad Gateway: No response from target site.";
        } else {
            err.statusCode = 500;
        }
        return err;
    }
}

module.exports = new ProxyService();
