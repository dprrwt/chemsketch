// ChemSketch — Main Application
// Using SmilesDrawer.apply() for simpler, more reliable rendering
(function() {
    'use strict';

    let currentSmiles = '';
    let currentName = '';

    // DOM Elements
    const smilesInput = document.getElementById('smiles-input');
    const renderBtn = document.getElementById('render-btn');
    const canvas = document.getElementById('molecule-canvas');
    const moleculeName = document.getElementById('molecule-name');
    const errorMsg = document.getElementById('error-msg');
    const moleculeButtons = document.querySelectorAll('.molecule-buttons button');
    
    const downloadPngBtn = document.getElementById('download-png');
    const downloadSvgBtn = document.getElementById('download-svg');
    const copySvgBtn = document.getElementById('copy-svg');
    const copyEmbedBtn = document.getElementById('copy-embed');
    const copyUrlBtn = document.getElementById('copy-url');

    // Drawer options
    const options = {
        width: 500,
        height: 500
    };

    function init() {
        if (typeof SmilesDrawer === 'undefined') {
            showError('SmilesDrawer library not loaded');
            return;
        }

        // Setup event listeners
        renderBtn.addEventListener('click', () => render(smilesInput.value));
        smilesInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') render(smilesInput.value);
        });

        moleculeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                smilesInput.value = btn.dataset.smiles;
                render(btn.dataset.smiles, btn.dataset.name);
            });
        });

        downloadPngBtn.addEventListener('click', downloadPNG);
        downloadSvgBtn.addEventListener('click', downloadSVG);
        copySvgBtn.addEventListener('click', copySVG);
        copyEmbedBtn.addEventListener('click', copyEmbed);
        copyUrlBtn.addEventListener('click', copyURL);

        // Load from URL or render default
        loadFromURL();
    }

    function render(smiles, name = '') {
        if (!smiles || !smiles.trim()) {
            showError('Please enter a SMILES string');
            return;
        }

        errorMsg.textContent = '';
        currentSmiles = smiles.trim();
        currentName = name;

        // Clear canvas first
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set data-smiles attribute and use SmilesDrawer.apply()
        canvas.setAttribute('data-smiles', currentSmiles);
        
        try {
            // SmilesDrawer.apply() scans for elements with data-smiles and renders them
            SmilesDrawer.apply(options, 'molecule-canvas', 'light');
            
            moleculeName.textContent = name || currentSmiles.substring(0, 30);
            enableExportButtons();
            updateURL();
        } catch (e) {
            console.error('Render error:', e);
            showError('Error: ' + e.message);
            disableExportButtons();
        }
    }

    function showError(msg) {
        errorMsg.textContent = msg;
    }

    function showToast(msg) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    function enableExportButtons() {
        [downloadPngBtn, downloadSvgBtn, copySvgBtn, copyEmbedBtn, copyUrlBtn].forEach(b => b.disabled = false);
    }

    function disableExportButtons() {
        [downloadPngBtn, downloadSvgBtn, copySvgBtn, copyEmbedBtn, copyUrlBtn].forEach(b => b.disabled = true);
    }

    function updateURL() {
        const url = new URL(window.location);
        url.searchParams.set('smiles', currentSmiles);
        if (currentName) url.searchParams.set('name', currentName);
        else url.searchParams.delete('name');
        window.history.replaceState({}, '', url);
    }

    function downloadPNG() {
        const link = document.createElement('a');
        link.download = (currentName || 'molecule') + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('PNG downloaded!');
    }

    function downloadSVG() {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
<image href="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}"/>
</svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = (currentName || 'molecule') + '.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
        showToast('SVG downloaded!');
    }

    async function copySVG() {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
<image href="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}"/>
</svg>`;
        await navigator.clipboard.writeText(svg);
        showToast('SVG copied!');
    }

    async function copyEmbed() {
        const embed = `<img src="${canvas.toDataURL('image/png')}" alt="${currentName || currentSmiles}">`;
        await navigator.clipboard.writeText(embed);
        showToast('Embed copied!');
    }

    async function copyURL() {
        const url = new URL(window.location);
        url.searchParams.set('smiles', currentSmiles);
        if (currentName) url.searchParams.set('name', currentName);
        await navigator.clipboard.writeText(url.toString());
        showToast('URL copied!');
    }

    function loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const smiles = params.get('smiles') || 'c1ccccc1';
        const name = params.get('name') || (smiles === 'c1ccccc1' ? 'Benzene' : '');
        smilesInput.value = smiles;
        render(smiles, name);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
