// ChemSketch — Main Application
(function() {
    'use strict';

    let currentSmiles = '';
    let currentName = '';

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

    // Create drawer with options
    const drawerOptions = {
        width: 500,
        height: 500,
        bondThickness: 1,
        bondLength: 15,
        shortBondLength: 0.85,
        bondSpacing: 0.18 * 15,
        atomVisualization: 'default',
        isomeric: true,
        debug: false,
        terminalCarbons: true,
        explicitHydrogens: true,
        overlapSensitivity: 0.42,
        overlapResolutionIterations: 1,
        compactDrawing: true,
        fontSizeLarge: 6,
        fontSizeSmall: 4,
        padding: 20.0,
    };

    let smilesDrawer = null;

    function init() {
        if (typeof SmilesDrawer === 'undefined') {
            showError('SmilesDrawer library not loaded');
            return;
        }

        // Initialize drawer
        smilesDrawer = new SmilesDrawer.Drawer(drawerOptions);

        // Setup events
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

        // Parse SMILES
        SmilesDrawer.parse(currentSmiles, function(tree) {
            // Clear canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw to canvas
            smilesDrawer.draw(tree, canvas, 'light', false);

            moleculeName.textContent = name || currentSmiles.substring(0, 30);
            enableExportButtons();
            updateURL();
        }, function(err) {
            showError('Invalid SMILES: ' + err);
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
        const url = `https://dprrwt.github.io/chemsketch/?smiles=${encodeURIComponent(currentSmiles)}`;
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

    // Start
    window.addEventListener('load', init);
})();
