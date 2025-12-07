const proxyService = require('../services/proxy.service');

class ProxyController {
    async getProxy(req, res, next) {
        const { url } = req.query;
        if (!url) {
            return res.status(400).send('Missing URL parameter');
        }

        try {
            const { data, contentType } = await proxyService.fetchPage(url);

            if (contentType && !contentType.includes('text/html')) {
                return res.status(415).send(`Unsupported content type: ${contentType}. Please provide a URL to a web page.`);
            }

            const injectedHtml = proxyService.injectScript(data, url);
            res.send(injectedHtml);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProxyController();
