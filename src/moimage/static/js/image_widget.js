function render({ model, el }) {
    // Create container div
    const container = document.createElement('div');
    container.style.cssText = `
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        max-width: 100%;
        background: #f9f9f9;
    `;

    // Create image element
    const img = document.createElement('img');
    img.style.cssText = `
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 auto;
    `;

    // Create info div
    const info = document.createElement('div');
    info.style.cssText = `
        margin-top: 10px;
        font-family: monospace;
        font-size: 12px;
        color: #666;
    `;

    // Function to update image
    function updateImage() {
        const src = model.get('src');
        const width = model.get('width');
        const height = model.get('height');
        const format = model.get('format');
        
        if (src) {
            img.src = src;
            img.onload = function() {
                // Update model with actual dimensions if not set
                if (!width || !height) {
                    model.set('width', this.naturalWidth);
                    model.set('height', this.naturalHeight);
                    model.save_changes();
                }
                updateInfo();
            };
            img.onerror = function() {
                info.textContent = 'Error loading image';
                info.style.color = '#d32f2f';
            };
        }
    }

    // Function to update info display
    function updateInfo() {
        const width = model.get('width');
        const height = model.get('height');
        const format = model.get('format');
        const src = model.get('src');
        
        let infoText = '';
        if (width && height) {
            infoText += `Dimensions: ${width} × ${height}px`;
        }
        if (format) {
            infoText += infoText ? ` | Format: ${format}` : `Format: ${format}`;
        }
        if (src && src.startsWith('data:')) {
            infoText += infoText ? ' | Source: Base64 data' : 'Source: Base64 data';
        } else if (src) {
            const filename = src.split('/').pop();
            infoText += infoText ? ` | File: ${filename}` : `File: ${filename}`;
        }
        
        info.textContent = infoText;
    }

    // Listen for model changes
    model.on('change:src', updateImage);
    model.on('change:width', updateInfo);
    model.on('change:height', updateInfo);
    model.on('change:format', updateInfo);

    // Append elements
    container.appendChild(img);
    container.appendChild(info);
    el.appendChild(container);

    // Initial update
    updateImage();
}

export default { render };
