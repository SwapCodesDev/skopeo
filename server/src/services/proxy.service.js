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

    injectScript(html, url) {
        let processedHtml = html;

        // Inject Base Tag
        const origin = new URL(url).origin;
        if (processedHtml.includes('<head>')) {
            processedHtml = processedHtml.replace('<head>', `<head><base href="${url}" />`);
        } else {
            processedHtml = `<base href="${url}" />` + processedHtml;
        }

        // Inject Inspection Script
        const scriptTag = `<script src="${config.SCRIPT_URL}"></script>`;
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
