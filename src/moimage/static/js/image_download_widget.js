function render({ model, el }) {
    // Create main container
    const container = document.createElement('div');
    container.style.cssText = `
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        max-width: 300px;
        background: #f9f9f9;
        font-family: system-ui, -apple-system, sans-serif;
    `;

    // Create filename input
    const filenameContainer = document.createElement('div');
    filenameContainer.style.cssText = 'margin-bottom: 10px;';
    
    const filenameLabel = document.createElement('label');
    filenameLabel.textContent = 'Filename:';
    filenameLabel.style.cssText = `
        display: block;
        margin-bottom: 5px;
        font-size: 12px;
        font-weight: 500;
    `;
    
    const filenameInput = document.createElement('input');
    filenameInput.type = 'text';
    filenameInput.value = model.get('filename');
    filenameInput.style.cssText = `
        width: 100%;
        padding: 4px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 12px;
        box-sizing: border-box;
    `;

    filenameContainer.appendChild(filenameLabel);
    filenameContainer.appendChild(filenameInput);

    // Create format selector
    const formatContainer = document.createElement('div');
    formatContainer.style.cssText = 'margin-bottom: 15px;';
    
    const formatLabel = document.createElement('label');
    formatLabel.textContent = 'Format:';
    formatLabel.style.cssText = `
        display: block;
        margin-bottom: 5px;
        font-size: 12px;
        font-weight: 500;
    `;
    
    const formatSelect = document.createElement('select');
    formatSelect.innerHTML = `
        <option value="png">PNG</option>
        <option value="jpg">JPG</option>
        <option value="webp">WebP</option>
    `;
    formatSelect.value = model.get('format');
    formatSelect.style.cssText = `
        width: 100%;
        padding: 4px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 12px;
        box-sizing: border-box;
    `;

    formatContainer.appendChild(formatLabel);
    formatContainer.appendChild(formatSelect);

    // Create download button
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download Image';
    downloadButton.style.cssText = `
        width: 100%;
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 10px;
    `;

    // Create status display
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
        font-size: 12px;
        text-align: center;
        min-height: 16px;
    `;

    // Append elements
    container.appendChild(filenameContainer);
    container.appendChild(formatContainer);
    container.appendChild(downloadButton);
    container.appendChild(statusDiv);
    el.appendChild(container);

    // Download function
    function downloadImage() {
        const imageSrc = model.get('image_src');
        const filename = model.get('filename') || 'image';
        const format = model.get('format') || 'png';
        
        if (!imageSrc) {
            updateStatus('No image to download', 'error');
            return;
        }

        try {
            if (imageSrc.startsWith('data:')) {
                // Handle base64 data URL
                downloadFromDataURL(imageSrc, `${filename}.${format}`);
            } else if (imageSrc.startsWith('http')) {
                // Handle remote URL
                downloadFromURL(imageSrc, `${filename}.${format}`);
            } else {
                updateStatus('Unsupported image format', 'error');
            }
        } catch (error) {
            updateStatus('Download failed: ' + error.message, 'error');
        }
    }

    function downloadFromDataURL(dataURL, filename) {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        updateStatus('Download started', 'success');
    }

    function downloadFromURL(url, filename) {
        // For cross-origin images, we need to load them onto canvas first
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const format = model.get('format') || 'png';
            const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
            const dataURL = canvas.toDataURL(mimeType);
            
            downloadFromDataURL(dataURL, filename);
        };
        
        img.onerror = function() {
            // Fallback: try direct link download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.target = '_blank';
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            updateStatus('Download initiated', 'success');
        };
        
        img.src = url;
    }

    function updateStatus(message, type = 'info') {
        statusDiv.textContent = message;
        statusDiv.style.color = type === 'error' ? '#d32f2f' : 
                               type === 'success' ? '#2e7d32' : '#666';
        
        model.set('download_status', message);
        model.save_changes();
        
        // Clear status after 3 seconds
        setTimeout(() => {
            statusDiv.textContent = '';
            model.set('download_status', '');
            model.save_changes();
        }, 3000);
    }

    function updateButtonState() {
        const imageSrc = model.get('image_src');
        const hasImage = Boolean(imageSrc);
        
        downloadButton.disabled = !hasImage;
        downloadButton.style.opacity = hasImage ? '1' : '0.5';
        downloadButton.style.cursor = hasImage ? 'pointer' : 'not-allowed';
        
        if (!hasImage) {
            statusDiv.textContent = 'No image available';
            statusDiv.style.color = '#999';
        } else if (statusDiv.textContent === 'No image available') {
            statusDiv.textContent = '';
        }
    }

    // Event listeners
    downloadButton.addEventListener('click', downloadImage);
    
    filenameInput.addEventListener('input', function() {
        model.set('filename', this.value);
        model.save_changes();
    });
    
    formatSelect.addEventListener('change', function() {
        model.set('format', this.value);
        model.save_changes();
    });

    // Model change listeners
    model.on('change:image_src', updateButtonState);
    model.on('change:filename', function() {
        filenameInput.value = model.get('filename');
    });
    model.on('change:format', function() {
        formatSelect.value = model.get('format');
    });

    // Hover effects
    downloadButton.addEventListener('mouseenter', function() {
        if (!this.disabled) {
            this.style.background = '#0056b3';
        }
    });
    
    downloadButton.addEventListener('mouseleave', function() {
        if (!this.disabled) {
            this.style.background = '#007bff';
        }
    });

    // Initial state
    updateButtonState();
}

export default { render };
