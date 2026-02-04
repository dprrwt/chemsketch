// ChemSketch — Main Application
// Using SvgDrawer for reliable SVG rendering
(function() {
    'use strict';

    let currentSmiles = '';
    let currentName = '';
    let svgDrawer = null;

    // DOM Elements
    const smilesInput = document.getElementById('smiles-input');
    const renderBtn = document.getElementById('render-btn');
    const svgElement = document.getElementById('molecule-svg');
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

        // Initialize SVG drawer
        try {
            svgDrawer = new SmilesDrawer.SvgDrawer(options);
        } catch (e) {
            showError('Failed to initialize drawer: ' + e.message);
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

        if (!svgDrawer) {
            showError('Drawer not initialized');
            return;
        }

        errorMsg.textContent = '';
        currentSmiles = smiles.trim();
        currentName = name;

        // Clear SVG
        svgElement.innerHTML = '';

        // Parse and draw
        SmilesDrawer.parse(currentSmiles, function(tree) {
            try {
                svgDrawer.draw(tree, svgElement, 'light');
                moleculeName.textContent = name || currentSmiles.substring(0, 30);
                enableExportButtons();
                updateURL();
            } catch (e) {
                console.error('Draw error:', e);
                showError('Error rendering: ' + e.message);
                disableExportButtons();
            }
        }, function(err) {
            console.error('Parse error:', err);
            showError('Invalid SMILES: ' + (err.message || err));
            disableExportButtons();
        });
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

    function svgToDataURL() {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }

    function downloadPNG() {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = function() {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 500, 500);
            ctx.drawImage(img, 0, 0);
            const link = document.createElement('a');
            link.download = (currentName || 'molecule') + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            showToast('PNG downloaded!');
        };
        img.src = svgToDataURL();
    }

    function downloadSVG() {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = (currentName || 'molecule') + '.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
        showToast('SVG downloaded!');
    }

    async function copySVG() {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        await navigator.clipboard.writeText(svgData);
        showToast('SVG copied!');
    }

    async function copyEmbed() {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        await navigator.clipboard.writeText(svgData);
        showToast('SVG embed copied!');
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
