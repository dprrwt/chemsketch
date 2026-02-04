// ChemSketch — Main Application
// Using SmilesDrawer.apply() which is the simplest API
(function() {
    'use strict';

    // State
    let currentSmiles = '';
    let currentName = '';

    // DOM Elements
    const smilesInput = document.getElementById('smiles-input');
    const renderBtn = document.getElementById('render-btn');
    const canvas = document.getElementById('molecule-canvas');
    const moleculeName = document.getElementById('molecule-name');
    const errorMsg = document.getElementById('error-msg');
    const moleculeButtons = document.querySelectorAll('.molecule-buttons button');
    
    // Export buttons
    const downloadPngBtn = document.getElementById('download-png');
    const downloadSvgBtn = document.getElementById('download-svg');
    const copySvgBtn = document.getElementById('copy-svg');
    const copyEmbedBtn = document.getElementById('copy-embed');
    const copyUrlBtn = document.getElementById('copy-url');

    // Global drawer instance
    let drawer = null;

    // Initialize drawer
    function initDrawer() {
        const options = {
            width: 500,
            height: 500,
            padding: 30
        };
        drawer = new SmilesDrawer.SvgDrawer(options);
    }

    // Render molecule from SMILES
    function renderMolecule(smiles, name = '') {
        if (!smiles || !smiles.trim()) {
            showError('Please enter a SMILES string');
            return;
        }

        errorMsg.textContent = '';
        currentSmiles = smiles.trim();
        currentName = name;

        // Clear canvas
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Use SmilesDrawer.parse with the drawer
        SmilesDrawer.parse(currentSmiles, function(tree) {
            // Success - draw to canvas
            try {
                // Create a temporary SVG container
                const tempDiv = document.createElement('div');
                tempDiv.style.position = 'absolute';
                tempDiv.style.left = '-9999px';
                document.body.appendChild(tempDiv);
                
                // Draw to SVG first
                drawer.draw(tree, tempDiv, 'light');
                
                // Convert SVG to canvas
                const svg = tempDiv.querySelector('svg');
                if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const img = new Image();
                    img.onload = function() {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);
                        
                        moleculeName.textContent = name || formatSmiles(currentSmiles);
                        enableExportButtons();
                        updateURL();
                    };
                    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                }
                
                // Clean up
                document.body.removeChild(tempDiv);
            } catch (e) {
                showError('Render error: ' + e.message);
                disableExportButtons();
            }
        }, function(err) {
            showError('Invalid SMILES: ' + err);
            disableExportButtons();
        });
    }

    // Format SMILES for display
    function formatSmiles(smiles) {
        if (smiles.length > 40) {
            return smiles.substring(0, 37) + '...';
        }
        return smiles;
    }

    // Show error message
    function showError(message) {
        errorMsg.textContent = message;
    }

    // Toast notification
    function showToast(message, type = 'success') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 2500);
    }

    // Enable export buttons
    function enableExportButtons() {
        downloadPngBtn.disabled = false;
        downloadSvgBtn.disabled = false;
        copySvgBtn.disabled = false;
        copyEmbedBtn.disabled = false;
        copyUrlBtn.disabled = false;
    }

    // Disable export buttons
    function disableExportButtons() {
        downloadPngBtn.disabled = true;
        downloadSvgBtn.disabled = true;
        copySvgBtn.disabled = true;
        copyEmbedBtn.disabled = true;
        copyUrlBtn.disabled = true;
    }

    // Update URL with current SMILES
    function updateURL() {
        const url = new URL(window.location);
        url.searchParams.set('smiles', currentSmiles);
        if (currentName) {
            url.searchParams.set('name', currentName);
        } else {
            url.searchParams.delete('name');
        }
        window.history.replaceState({}, '', url);
    }

    // Download canvas as PNG
    function downloadPNG() {
        const link = document.createElement('a');
        const filename = currentName ? 
            `${currentName.toLowerCase().replace(/\s+/g, '-')}.png` : 
            'molecule.png';
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('PNG downloaded!');
    }

    // Generate SVG from canvas
    function generateSVG() {
        const imageData = canvas.toDataURL('image/png');
        
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
  <title>${currentName || currentSmiles}</title>
  <image href="${imageData}" width="${canvas.width}" height="${canvas.height}"/>
</svg>`;
    }

    // Download as SVG
    function downloadSVG() {
        const svg = generateSVG();
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filename = currentName ? 
            `${currentName.toLowerCase().replace(/\s+/g, '-')}.svg` : 
            'molecule.svg';
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        showToast('SVG downloaded!');
    }

    // Copy SVG to clipboard
    async function copySVG() {
        try {
            const svg = generateSVG();
            await navigator.clipboard.writeText(svg);
            showToast('SVG copied to clipboard!');
        } catch (e) {
            showToast('Failed to copy', 'error');
        }
    }

    // Copy embed code
    async function copyEmbed() {
        try {
            const url = `https://dprrwt.github.io/chemsketch/?smiles=${encodeURIComponent(currentSmiles)}`;
            const embed = `<a href="${url}" target="_blank"><img src="${canvas.toDataURL('image/png')}" alt="${currentName || currentSmiles}" title="View in ChemSketch"></a>`;
            await navigator.clipboard.writeText(embed);
            showToast('Embed code copied!');
        } catch (e) {
            showToast('Failed to copy', 'error');
        }
    }

    // Copy shareable URL
    async function copyURL() {
        try {
            const url = new URL(window.location);
            url.searchParams.set('smiles', currentSmiles);
            if (currentName) {
                url.searchParams.set('name', currentName);
            }
            await navigator.clipboard.writeText(url.toString());
            showToast('URL copied!');
        } catch (e) {
            showToast('Failed to copy', 'error');
        }
    }

    // Load from URL parameters
    function loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const smiles = params.get('smiles');
        const name = params.get('name');

        if (smiles) {
            smilesInput.value = smiles;
            renderMolecule(smiles, name || '');
        } else {
            // Render default benzene
            smilesInput.value = 'c1ccccc1';
            renderMolecule('c1ccccc1', 'Benzene');
        }
    }

    // Event Listeners
    renderBtn.addEventListener('click', () => {
        renderMolecule(smilesInput.value);
    });

    smilesInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            renderMolecule(smilesInput.value);
        }
    });

    moleculeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const smiles = btn.dataset.smiles;
            const name = btn.dataset.name;
            smilesInput.value = smiles;
            renderMolecule(smiles, name);
        });
    });

    downloadPngBtn.addEventListener('click', downloadPNG);
    downloadSvgBtn.addEventListener('click', downloadSVG);
    copySvgBtn.addEventListener('click', copySVG);
    copyEmbedBtn.addEventListener('click', copyEmbed);
    copyUrlBtn.addEventListener('click', copyURL);

    // Initialize when ready
    function init() {
        if (typeof SmilesDrawer === 'undefined') {
            showError('Library loading failed. Please refresh.');
            return;
        }
        
        initDrawer();
        
        // Small delay to ensure everything is ready
        setTimeout(loadFromURL, 100);
    }

    // Wait for everything to load
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
