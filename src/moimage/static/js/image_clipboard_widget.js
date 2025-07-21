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

    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
        Copy to Clipboard
    `;
    copyButton.style.cssText = `
        width: 100%;
        background: #28a745;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    // Create status display
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
        font-size: 12px;
        text-align: center;
        min-height: 16px;
        padding: 4px;
    `;

    // Create help text
    const helpDiv = document.createElement('div');
    helpDiv.style.cssText = `
        font-size: 11px;
        color: #888;
        text-align: center;
        margin-top: 5px;
        line-height: 1.3;
    `;

    // Append elements
    container.appendChild(copyButton);
    container.appendChild(statusDiv);
    container.appendChild(helpDiv);
    el.appendChild(container);

    // Check clipboard API support
    const isClipboardSupported = navigator.clipboard && navigator.clipboard.write;
    
    if (!isClipboardSupported) {
        helpDiv.textContent = 'Note: For best results, use a modern browser with clipboard support';
    } else {
        helpDiv.textContent = 'Click to copy the current image to your clipboard';
    }

    // Copy to clipboard function
    async function copyImageToClipboard() {
        const imageSrc = model.get('image_src');
        
        if (!imageSrc) {
            updateStatus('No image to copy', 'error');
            return;
        }

        try {
            if (imageSrc.startsWith('data:')) {
                // Handle base64 data URL
                await copyDataURLToClipboard(imageSrc);
            } else if (imageSrc.startsWith('http')) {
                // Handle remote URL - convert to blob first
                await copyRemoteImageToClipboard(imageSrc);
            } else {
                updateStatus('Unsupported image format', 'error');
            }
        } catch (error) {
            console.error('Clipboard copy failed:', error);
            showFallbackInstructions();
        }
    }

    async function copyDataURLToClipboard(dataURL) {
        if (!isClipboardSupported) {
            showFallbackInstructions();
            return;
        }

        try {
            // Convert data URL to blob
            const response = await fetch(dataURL);
            const blob = await response.blob();
            
            // Copy to clipboard
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            
            updateStatus('Image copied to clipboard!', 'success');
        } catch (error) {
            throw new Error('Failed to copy data URL: ' + error.message);
        }
    }

    async function copyRemoteImageToClipboard(url) {
        if (!isClipboardSupported) {
            showFallbackInstructions();
            return;
        }

        try {
            // Load image onto canvas to convert to blob
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = url;
            });

            // Create canvas and draw image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Convert to blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });

            // Copy to clipboard
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            
            updateStatus('Image copied to clipboard!', 'success');
        } catch (error) {
            throw new Error('Failed to copy remote image: ' + error.message);
        }
    }

    function showFallbackInstructions() {
        if (model.get('image_src').startsWith('data:')) {
            updateStatus('Right-click the image and select "Copy image"', 'info');
        } else {
            updateStatus('Clipboard API not supported. Try right-clicking the image.', 'warning');
        }
        
        helpDiv.innerHTML = `
            <strong>Fallback method:</strong><br>
            Right-click on the image and select<br>
            "Copy image" or "Copy image address"
        `;
    }

    function updateStatus(message, type = 'info') {
        statusDiv.textContent = message;
        
        const colors = {
            'success': '#2e7d32',
            'error': '#d32f2f',
            'warning': '#f57c00',
            'info': '#1976d2'
        };
        
        statusDiv.style.color = colors[type] || '#666';
        statusDiv.style.fontWeight = type === 'success' ? '500' : 'normal';
        
        // Update model
        model.set('clipboard_status', message);
        model.save_changes();
        
        // Clear success/error status after 3 seconds
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                statusDiv.textContent = '';
                model.set('clipboard_status', '');
                model.save_changes();
            }, 3000);
        }
    }

    function updateButtonState() {
        const imageSrc = model.get('image_src');
        const hasImage = Boolean(imageSrc);
        
        copyButton.disabled = !hasImage;
        copyButton.style.opacity = hasImage ? '1' : '0.5';
        copyButton.style.cursor = hasImage ? 'pointer' : 'not-allowed';
        
        if (!hasImage) {
            statusDiv.textContent = 'No image available';
            statusDiv.style.color = '#999';
            statusDiv.style.fontWeight = 'normal';
        } else if (statusDiv.textContent === 'No image available') {
            statusDiv.textContent = '';
        }
    }

    // Event listeners
    copyButton.addEventListener('click', copyImageToClipboard);

    // Model change listeners
    model.on('change:image_src', updateButtonState);

    // Hover effects
    copyButton.addEventListener('mouseenter', function() {
        if (!this.disabled) {
            this.style.background = '#218838';
        }
    });
    
    copyButton.addEventListener('mouseleave', function() {
        if (!this.disabled) {
            this.style.background = '#28a745';
        }
    });

    // Handle button press visual feedback
    copyButton.addEventListener('mousedown', function() {
        if (!this.disabled) {
            this.style.transform = 'scale(0.98)';
        }
    });
    
    copyButton.addEventListener('mouseup', function() {
        if (!this.disabled) {
            this.style.transform = 'scale(1)';
        }
    });

    // Initial state
    updateButtonState();
}

export default { render };
