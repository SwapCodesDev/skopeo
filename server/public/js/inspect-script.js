(function () {
    // console.log("Antigravity Inspector Loaded");

    let inspectMode = true;
    let hoveredElement = null;

    // Add styles for highlighting
    const style = document.createElement('style');
    style.innerHTML = `
    .ag-highlight {
      outline: 2px solid #3b82f6 !important;
      background-color: rgba(59, 130, 246, 0.1) !important;
      cursor: crosshair !important;
    }
    .ag-selected {
      outline: 2px solid #dc2626 !important;
    }
    .ag-highlight-tree {
      outline: 2px dashed #f59e0b !important; /* Orange dashed for tree hover */
      background-color: rgba(245, 158, 11, 0.1) !important;
    }
  `;
    document.head.appendChild(style);

    // Helper to generate unique selector
    function getSelector(el) {
        if (el.id) return '#' + el.id;
        if (el.className && typeof el.className === 'string' && el.className.trim()) {
            return '.' + el.className.trim().split(/\s+/).join('.');
        }
        let tagName = el.tagName.toLowerCase();
        let parent = el.parentElement;
        if (parent) {
            let siblings = Array.from(parent.children);
            let index = siblings.indexOf(el) + 1;
            return `${tagName}:nth-child(${index})`;
        }
        return tagName;
    }

    function getFullSelector(el) {
        const path = [];
        while (el.nodeType === Node.ELEMENT_NODE) {
            let selector = el.tagName.toLowerCase();
            if (el.id) {
                selector += '#' + el.id;
                path.unshift(selector);
                break;
            }
            else {
                let sib = el, nth = 1;
                while (sib = sib.previousElementSibling) {
                    if (sib.tagName.toLowerCase() == selector) nth++;
                }
                if (nth != 1) selector += ":nth-of-type(" + nth + ")";
            }
            path.unshift(selector);
            el = el.parentNode;
        }
        return path.join(" > ");
    }

    document.addEventListener('mouseover', function (e) {
        if (!inspectMode) return;
        if (hoveredElement && hoveredElement !== e.target) {
            hoveredElement.classList.remove('ag-highlight');
        }
        hoveredElement = e.target;
        // Don't highlight html/body if possible, usually annoying
        if (hoveredElement.tagName === 'HTML' || hoveredElement.tagName === 'BODY') return;

        hoveredElement.classList.add('ag-highlight');
    }, true);

    document.addEventListener('mouseout', function (e) {
        if (e.target.classList.contains('ag-highlight')) {
            e.target.classList.remove('ag-highlight');
        }
    }, true);


    let currentSelection = null;

    function buildTree(el, depth = 0, maxDepth = 10, path = []) {
        if (depth > maxDepth) return null;
        return {
            tagName: el.tagName.toLowerCase(),
            id: el.id,
            className: typeof el.className === 'string' ? el.className : '',
            path: path,
            children: Array.from(el.children).map((c, i) => buildTree(c, depth + 1, maxDepth, [...path, i])).filter(Boolean)
        };
    }

    function sendElementData(el) {
        currentSelection = el;
        const data = {
            tagName: el.tagName.toLowerCase(),
            id: el.id,
            className: typeof el.className === 'string' ? el.className : '',
            innerText: el.innerText,
            innerHTML: el.innerHTML.substring(0, 500),
            attributes: Array.from(el.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
            }, {}),
            selector: getFullSelector(el),
            rect: el.getBoundingClientRect(),
            hasParent: !!el.parentElement,
            children: Array.from(el.children).map(c => ({
                tagName: c.tagName.toLowerCase(),
                id: c.id,
                className: typeof c.className === 'string' ? c.className : ''
            })),
            tree: buildTree(el)
        };
        console.log("Selected:", data);
        window.parent.postMessage({ type: 'ELEMENT_SELECTED', payload: data }, '*');
    }

    document.addEventListener('click', function (e) {
        if (!inspectMode) return;
        if (e.target.tagName === 'HTML' || e.target.tagName === 'BODY') return;

        e.preventDefault();
        e.stopPropagation();

        sendElementData(e.target);
    }, true);

    // Listen for messages from parent
    window.addEventListener('message', (event) => {
        if (event.data.type === 'TOGGLE_INSPECT') {
            inspectMode = event.data.value;
        }
        if (event.data.type === 'SELECT_PARENT') {
            if (currentSelection && currentSelection.parentElement) {
                sendElementData(currentSelection.parentElement);
            }
        }
        if (event.data.type === 'SELECT_CHILD') {
            const index = event.data.index;
            if (currentSelection && currentSelection.children[index]) {
                sendElementData(currentSelection.children[index]);
            }
        }
        if (event.data.type === 'SELECT_XPATH') {
            const xpath = event.data.xpath;
            try {
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                const node = result.singleNodeValue;
                if (node && node.nodeType === Node.ELEMENT_NODE) {
                    sendElementData(node);
                    // Scroll to view
                    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight temporarily
                    node.classList.add('ag-highlight');
                    setTimeout(() => node.classList.remove('ag-highlight'), 2000);
                } else {
                    console.warn(`Element not found for xpath: ${xpath}`);
                    window.parent.postMessage({ type: 'XPATH_STATUS', status: 'not-found', xpath: xpath }, '*');
                }
            } catch (e) {
                console.error("Invalid XPath:", xpath);
                window.parent.postMessage({ type: 'XPATH_STATUS', status: 'error', error: e.message, xpath: xpath }, '*');
            }
        }
        if (event.data.type === 'SELECT_DESCENDANT') {
            const selector = event.data.selector;
            if (currentSelection) {
                try {
                    const el = currentSelection.querySelector(selector);
                    if (el) {
                        sendElementData(el);
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('ag-highlight');
                        setTimeout(() => el.classList.remove('ag-highlight'), 2000);
                    } else {
                        console.warn('Descendant not found:', selector);
                    }
                } catch (e) {
                    console.error("Invalid Selector:", selector);
                }
            }
        }
        if (event.data.type === 'HIGHLIGHT_DESCENDANT') {
            const path = event.data.path; // array of indices
            if (currentSelection && Array.isArray(path)) {
                let target = currentSelection;
                for (const idx of path) {
                    if (target.children && target.children[idx]) {
                        target = target.children[idx];
                    } else {
                        target = null;
                        break;
                    }
                }

                document.querySelectorAll('.ag-highlight-tree').forEach(el => el.classList.remove('ag-highlight-tree'));

                if (target) {
                    target.classList.add('ag-highlight-tree');
                }
            }
        }
        if (event.data.type === 'SELECT_TREE_NODE') {
            const path = event.data.path; // array of indices
            if (currentSelection && Array.isArray(path)) {
                let target = currentSelection;
                for (const idx of path) {
                    if (target.children && target.children[idx]) {
                        target = target.children[idx];
                    } else {
                        target = null;
                        break;
                    }
                }
                if (target) {
                    sendElementData(target);
                    // Scroll to view
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.classList.add('ag-highlight');
                    setTimeout(() => target.classList.remove('ag-highlight'), 2000);
                }
            }
        }
        if (event.data.type === 'SCAN_MEDIA') {
            scanMedia();
        }
        if (event.data.type === 'SCAN_STORAGE') {
            scanStorage();
        }
    });

    // --- CONSOLE INTERCEPTION ---
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
    };

    function proxyConsole(type) {
        return function (...args) {
            originalConsole[type].apply(console, args);
            window.parent.postMessage({
                type: 'CONSOLE_LOG',
                payload: {
                    type,
                    args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)),
                    timestamp: Date.now()
                }
            }, '*');
        };
    }

    console.log = proxyConsole('log');
    console.warn = proxyConsole('warn');
    console.error = proxyConsole('error');
    console.info = proxyConsole('info');

    // --- ADVANCED NETWORK INTERCEPTION ---

    // Helper to safely stringify body
    function safeBody(body) {
        if (!body) return null;
        if (typeof body === 'string') return body.substring(0, 100000); // 100KB limit
        if (body instanceof FormData) return '[FormData]';
        if (body instanceof URLSearchParams) return body.toString();
        try { return JSON.stringify(body).substring(0, 100000); } catch { return '[Complex Object]'; }
    }

    // Capture Headers helper
    function getHeaders(headers) {
        const h = {};
        if (headers instanceof Headers) {
            headers.forEach((v, k) => h[k] = v);
        } else if (typeof headers === 'object') {
            return headers;
        }
        return h;
    }

    // 1. Fetch Interception
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const id = Math.random().toString(36).substring(7);
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        const options = args[1] || {};
        const method = options.method || 'GET';

        window.parent.postMessage({
            type: 'NETWORK_REQ',
            payload: {
                id,
                url,
                method,
                type: 'fetch',
                timestamp: Date.now(),
                requestHeaders: getHeaders(options.headers),
                requestBody: safeBody(options.body)
            }
        }, '*');

        try {
            const response = await originalFetch.apply(this, args);
            const clone = response.clone();

            // Try to read body if it's text/json
            let responseBody = null;
            const contentType = clone.headers.get('content-type') || '';
            if (contentType.includes('json') || contentType.includes('text') || contentType.includes('xml')) {
                try {
                    const text = await clone.text();
                    responseBody = text.substring(0, 100000);
                } catch (e) { /* ignore */ }
            }

            window.parent.postMessage({
                type: 'NETWORK_RES',
                payload: {
                    id,
                    status: response.status,
                    timestamp: Date.now(),
                    responseHeaders: getHeaders(response.headers),
                    responseBody
                }
            }, '*');
            return response;
        } catch (err) {
            window.parent.postMessage({
                type: 'NETWORK_ERR',
                payload: { id, error: err.message, timestamp: Date.now() }
            }, '*');
            throw err;
        }
    };

    // 2. XHR Interception
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function () {
        const xhr = new originalXHR();
        const id = Math.random().toString(36).substring(7);
        let method = 'GET';
        let url = '';
        let requestHeaders = {};

        const originalOpen = xhr.open;
        xhr.open = function (m, u, ...args) {
            method = m;
            url = u;
            return originalOpen.apply(this, [m, u, ...args]);
        };

        const originalSetRequestHeader = xhr.setRequestHeader;
        xhr.setRequestHeader = function (header, value) {
            requestHeaders[header] = value;
            return originalSetRequestHeader.apply(this, [header, value]);
        };

        const originalSend = xhr.send;
        xhr.send = function (body) {
            window.parent.postMessage({
                type: 'NETWORK_REQ',
                payload: {
                    id,
                    url,
                    method,
                    type: 'xhr',
                    timestamp: Date.now(),
                    requestHeaders,
                    requestBody: safeBody(body)
                }
            }, '*');

            xhr.addEventListener('load', function () {
                let responseBody = null;
                const contentType = xhr.getResponseHeader('content-type') || '';
                if (contentType.includes('json') || contentType.includes('text') || contentType.includes('xml')) {
                    responseBody = xhr.responseText.substring(0, 100000);
                }

                // Parse response headers
                const responseHeaders = {};
                const headerStr = xhr.getAllResponseHeaders();
                headerStr.trim().split(/[\r\n]+/).forEach(line => {
                    const parts = line.split(': ');
                    const key = parts.shift();
                    const value = parts.join(': ');
                    if (key) responseHeaders[key] = value;
                });

                window.parent.postMessage({
                    type: 'NETWORK_RES',
                    payload: {
                        id,
                        status: xhr.status,
                        timestamp: Date.now(),
                        responseHeaders,
                        responseBody
                    }
                }, '*');
            });

            xhr.addEventListener('error', function () {
                window.parent.postMessage({
                    type: 'NETWORK_ERR',
                    payload: { id, error: 'XHR Error', timestamp: Date.now() }
                }, '*');
            });

            return originalSend.apply(this, [body]);
        };

        return xhr;
    };

    // 3. Resource Timing Observer
    try {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') return; // Handled above

                // Only care about resources that actually load data
                if (['script', 'link', 'css', 'img', 'video', 'audio'].includes(entry.initiatorType)) {
                    window.parent.postMessage({
                        type: 'NETWORK_REQ',
                        payload: {
                            id: 'res-' + Math.random().toString(36).substring(7),
                            url: entry.name,
                            method: 'GET',
                            type: entry.initiatorType,
                            timestamp: Date.now() - entry.duration, // approximate start
                            duration: entry.duration,
                            status: 200 // Assumed success if it showed up here
                        }
                    }, '*');
                }
            });
        });
        observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
        console.warn('PerformanceObserver not supported');
    }

    // --- MEDIA SCANNER ---
    function scanMedia() {
        const assets = [];

        // Images
        document.querySelectorAll('img').forEach(img => {
            if (img.src) assets.push({ type: 'image', url: img.src, dimensions: `${img.naturalWidth}x${img.naturalHeight}` });
        });

        // Videos
        document.querySelectorAll('video').forEach(vid => {
            if (vid.src) assets.push({ type: 'video', url: vid.src });
            vid.querySelectorAll('source').forEach(s => {
                if (s.src) assets.push({ type: 'video', url: s.src });
            });
        });

        // Audio
        document.querySelectorAll('audio').forEach(aud => {
            if (aud.src) assets.push({ type: 'audio', url: aud.src });
            aud.querySelectorAll('source').forEach(s => {
                if (s.src) assets.push({ type: 'audio', url: s.src });
            });
        });

        // Background Images
        document.querySelectorAll('*').forEach(el => {
            const bg = window.getComputedStyle(el).backgroundImage;
            if (bg && bg !== 'none' && bg.startsWith('url')) {
                const url = bg.slice(5, -2);
                assets.push({ type: 'image', url: url });
            }
        });

        const uniqueAssets = Array.from(new Set(assets.map(a => JSON.stringify(a)))).map(s => JSON.parse(s));
        window.parent.postMessage({ type: 'MEDIA_FOUND', payload: uniqueAssets }, '*');
    }

    // --- STORAGE SCANNER ---
    function scanStorage() {
        const cookies = document.cookie.split(';').map(c => {
            const [key, ...v] = c.trim().split('=');
            return { key, value: v.join('=') };
        }).filter(c => c.key);

        const localStorageData = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                localStorageData.push({ key, value: localStorage.getItem(key) });
            }
        } catch (e) {
            console.warn("Access to localStorage denied");
        }

        window.parent.postMessage({
            type: 'STORAGE_DATA',
            payload: { cookies, localStorage: localStorageData }
        }, '*');
    }

    // Initialize scan after load
    window.addEventListener('load', () => setTimeout(scanMedia, 1000));

})();
