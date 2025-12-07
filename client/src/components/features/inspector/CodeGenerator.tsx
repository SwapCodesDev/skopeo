import { useState } from 'react';
import { Button } from '../../ui/Button';
import { CodeBlock } from '../../ui/CodeBlock';
import type { ElementData, CodeMode } from '../../../types';

interface CodeGeneratorProps {
    element: ElementData | null;
    extractors: string[];
    url: string;
}

export const CodeGenerator = ({ element, extractors, url }: CodeGeneratorProps) => {
    const [mode, setMode] = useState<CodeMode>('bs4');
    const [copied, setCopied] = useState(false);

    const generateCode = () => {
        if (!element) return '# No element selected';
        const sel = element.selector;

        const formatExtraction = (varName: string, m: CodeMode) => {
            if (extractors.length === 0) return `${varName}`;
            const extractions = extractors.map(key => {
                if (key === 'innerText') {
                    if (m === 'bs4') return `${varName}.get_text(strip=True)`;
                    if (m === 'selenium') return `${varName}.text`;
                    return `${varName}.inner_text()`; // playwright
                }
                if (key === 'innerHTML') {
                    if (m === 'bs4') return `${varName}.decode_contents()`;
                    if (m === 'selenium') return `${varName}.get_attribute('innerHTML')`;
                    return `${varName}.inner_html()`; // playwright
                }
                // Attributes
                // BS4 uses get(), Selenium/Playwright use get_attribute()
                if (m === 'bs4') return `${varName}.get('${key}')`;
                return `${varName}.get_attribute('${key}')`;
            });
            if (extractions.length === 1) return `print(${extractions[0]})`;
            const dict = extractors.map((key, i) => `'${key}': ${extractions[i]}`).join(', ');
            return `data = {${dict}}\n    print(data)`;
        };

        if (mode === 'bs4') {
            return `import requests
from bs4 import BeautifulSoup

url = "${url || 'TARGET_URL'}"
resp = requests.get(url)
soup = BeautifulSoup(resp.text, "html.parser")

elements = soup.select("${sel}")

for el in elements:
    ${formatExtraction('el', 'bs4')}`;
        } else if (mode === 'selenium') {
            return `from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("${url || 'TARGET_URL'}")

elements = driver.find_elements(By.CSS_SELECTOR, "${sel}")

for el in elements:
    ${formatExtraction('el', 'selenium')}

driver.quit()`;
        } else {
            // Playwright
            return `from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("${url || 'TARGET_URL'}")

    elements = page.locator("${sel}")
    
    # Iterate over all matching elements
    count = elements.count()
    for i in range(count):
        el = elements.nth(i)
        ${formatExtraction('el', 'playwright')}

    browser.close()`;
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Generated Code</h3>
                <div className="flex bg-gray-800/50 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setMode('bs4')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'bs4' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        BS4
                    </button>
                    <button
                        onClick={() => setMode('selenium')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'selenium' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Selenium
                    </button>
                    <button
                        onClick={() => setMode('playwright')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'playwright' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Playwright
                    </button>
                </div>
            </div>
            <div className="relative group">
                <div className="bg-black/40 backdrop-blur-md p-4 rounded-lg border border-gray-700/50 shadow-inner max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                    <CodeBlock code={generateCode()} className="text-gray-200" />
                </div>
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopy}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all scale-90"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </Button>
            </div>
        </div>
    );
};
