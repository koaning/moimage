function render({ model, el }) {
    // Create main container
    const container = document.createElement('div');
    container.style.cssText = `
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 20px;
        max-width: 100%;
        background: #fafafa;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
    `;

    // Create upload area (visible when no image)
    const uploadArea = document.createElement('div');
    uploadArea.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 120px;
    `;

    // Upload icon and text
    uploadArea.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 10px; color: #999;">📁</div>
        <div style="font-size: 16px; font-weight: 500; color: #666; margin-bottom: 5px;">
            Drop image files here
        </div>
        <div style="font-size: 12px; color: #999;">
            Supports PNG, JPG, GIF, WebP • Drag & drop
        </div>
    `;

    // Create image preview area (hidden initially)
    const previewArea = document.createElement('div');
    previewArea.style.cssText = `
        display: none;
        flex-direction: column;
        align-items: center;
    `;

    // Create preview image
    const previewImg = document.createElement('img');
    previewImg.style.cssText = `
        max-width: 100%;
        max-height: 300px;
        border-radius: 4px;
        margin-bottom: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    // Create file info display
    const fileInfo = document.createElement('div');
    fileInfo.style.cssText = `
        font-size: 12px;
        color: #666;
        margin-bottom: 10px;
        font-family: monospace;
    `;

    // Create replace text
    const replaceText = document.createElement('div');
    replaceText.style.cssText = `
        font-size: 11px;
        color: #999;
    `;
    replaceText.textContent = '📁 Drop, browse, or paste to replace';

    previewArea.appendChild(previewImg);
    previewArea.appendChild(fileInfo);
    previewArea.appendChild(replaceText);

    // Create button row
    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 15px;
        justify-content: center;
    `;

    // Browse Files button
    const browseButton = document.createElement('button');
    browseButton.textContent = 'Browse Files';
    browseButton.style.cssText = `
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background 0.2s;
    `;
    browseButton.addEventListener('mouseover', () => browseButton.style.background = '#0056b3');
    browseButton.addEventListener('mouseout', () => browseButton.style.background = '#007bff');

    // Paste Image button
    const pasteButton = document.createElement('button');
    pasteButton.textContent = '📋 Paste Image';
    pasteButton.style.cssText = `
        padding: 8px 16px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background 0.2s;
    `;
    pasteButton.addEventListener('mouseover', () => pasteButton.style.background = '#1e7e34');
    pasteButton.addEventListener('mouseout', () => pasteButton.style.background = '#28a745');

    buttonRow.appendChild(browseButton);
    buttonRow.appendChild(pasteButton);

    // Create status display
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 12px;
        min-height: 16px;
        display: none;
    `;

    // Create hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // Append elements
    container.appendChild(uploadArea);
    container.appendChild(buttonRow);
    container.appendChild(previewArea);
    container.appendChild(statusDiv);
    container.appendChild(fileInput);
    el.appendChild(container);

    // State variables
    let isDragOver = false;
    let isFocused = false;

    // Update container appearance
    function updateAppearance() {
        const hasImage = Boolean(model.get('src'));
        
        if (hasImage) {
            uploadArea.style.display = 'none';
            previewArea.style.display = 'flex';
            container.style.borderColor = '#28a745';
            container.style.backgroundColor = '#f8fff9';
        } else {
            uploadArea.style.display = 'flex';
            previewArea.style.display = 'none';
            container.style.backgroundColor = isFocused ? '#f0f8ff' : '#fafafa';
        }

        if (isDragOver) {
            container.style.borderColor = '#007bff';
            container.style.backgroundColor = '#f0f8ff';
            container.style.transform = 'scale(1.02)';
        } else if (isFocused) {
            container.style.borderColor = '#007bff';
            container.style.borderStyle = 'solid';
        } else {
            container.style.borderColor = hasImage ? '#28a745' : '#ccc';
            container.style.borderStyle = hasImage ? 'solid' : 'dashed';
            container.style.transform = 'scale(1)';
        }
    }

    // Handle file processing
    function processFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            updateStatus('Please select a valid image file', 'error');
            return;
        }

        updateStatus('Processing image...', 'info');

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Update model with image data
                model.set('src', e.target.result);
                model.set('filename', file.name);
                model.set('file_size', file.size);
                model.set('width', img.width);
                model.set('height', img.height);
                
                // Detect format from file type or name
                const format = file.type.split('/')[1]?.toUpperCase() || 
                              file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
                model.set('format', format);
                
                model.save_changes();
                
                updateStatus('Image uploaded successfully!', 'success');
                updateDisplay();
                updateAppearance();
            };
            
            img.onerror = function() {
                updateStatus('Failed to process image', 'error');
            };
            
            img.src = e.target.result;
        };

        reader.onerror = function() {
            updateStatus('Failed to read file', 'error');
        };

        reader.readAsDataURL(file);
    }


    // Update status display
    function updateStatus(message, type = 'info') {
        statusDiv.textContent = message;
        
        const colors = {
            'success': { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
            'error': { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
            'warning': { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' },
            'info': { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }
        };
        
        const style = colors[type] || colors.info;
        statusDiv.style.backgroundColor = style.bg;
        statusDiv.style.color = style.color;
        statusDiv.style.border = `1px solid ${style.border}`;
        statusDiv.style.display = 'block';
        
        model.set('upload_status', message);
        model.save_changes();
        
        // Clear status after 3 seconds for success/info
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
                model.set('upload_status', '');
                model.save_changes();
            }, 3000);
        }
    }

    // Update preview display
    function updateDisplay() {
        const src = model.get('src');
        const filename = model.get('filename');
        const fileSize = model.get('file_size');
        const width = model.get('width');
        const height = model.get('height');
        
        if (src) {
            previewImg.src = src;
            
            const sizeStr = fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : '';
            const dimStr = width && height ? `${width} × ${height}px` : '';
            const parts = [filename, sizeStr, dimStr].filter(Boolean);
            
            fileInfo.textContent = parts.join(' • ');
        }
    }

    // Event listeners for drag & drop
    container.addEventListener('dragover', function(e) {
        e.preventDefault();
        isDragOver = true;
        updateAppearance();
    });

    container.addEventListener('dragenter', function(e) {
        e.preventDefault();
        isDragOver = true;
        updateAppearance();
    });

    container.addEventListener('dragleave', function(e) {
        e.preventDefault();
        if (!container.contains(e.relatedTarget)) {
            isDragOver = false;
            updateAppearance();
        }
    });

    container.addEventListener('drop', function(e) {
        e.preventDefault();
        isDragOver = false;
        
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
        
        updateAppearance();
    });

    // Browse button functionality
    browseButton.addEventListener('click', function(e) {
        e.stopPropagation();
        fileInput.click();
    });

    // Paste button functionality with debug logging
    pasteButton.addEventListener('click', async function(e) {
        e.stopPropagation();
        
        const originalText = pasteButton.textContent;
        pasteButton.textContent = '⏳ Reading clipboard...';
        pasteButton.disabled = true;
        
        console.log('🔍 Paste button clicked - reading clipboard...');
        
        try {
            // Try modern clipboard API
            if (navigator.clipboard && navigator.clipboard.read) {
                const clipboardItems = await navigator.clipboard.read();
                
                // Debug: Log all available clipboard items and types
                console.log('📋 Clipboard contents:', clipboardItems);
                console.log('📋 Number of clipboard items:', clipboardItems.length);
                
                clipboardItems.forEach((item, index) => {
                    console.log(`📋 Item ${index} types:`, item.types);
                    item.types.forEach(type => {
                        console.log(`  - Available type: ${type}`);
                    });
                });
                
                let foundImage = false;
                
                // Try to process each type
                for (let item of clipboardItems) {
                    for (let type of item.types) {
                        console.log(`🔍 Checking type: ${type}`);
                        if (type.startsWith('image/')) {
                            console.log(`✅ Found image type: ${type}`);
                            try {
                                const blob = await item.getType(type);
                                console.log(`📦 Blob info - Size: ${blob.size} bytes, Type: ${blob.type}`);
                                const file = new File([blob], 'pasted-image.png', { type: blob.type });
                                processFile(file);
                                foundImage = true;
                                break;
                            } catch (typeError) {
                                console.error(`❌ Failed to get ${type}:`, typeError);
                            }
                        } else {
                            console.log(`⏭️  Skipping non-image type: ${type}`);
                        }
                    }
                    if (foundImage) break;
                }
                
                if (!foundImage) {
                    console.warn('⚠️ No processable image found in clipboard');
                    console.log('💡 Available types were:', clipboardItems.flatMap(item => item.types));
                    updateStatus('No image found in clipboard', 'warning');
                    console.log('🔍 Attempting legacy clipboard event approach...');
                    
                    // Try legacy approach - create a temporary input and trigger paste
                    const tempInput = document.createElement('textarea');
                    tempInput.style.position = 'absolute';
                    tempInput.style.left = '-9999px';
                    document.body.appendChild(tempInput);
                    tempInput.focus();
                    
                    const handleLegacyPaste = (e) => {
                        console.log('📋 Legacy paste event triggered');
                        console.log('📋 ClipboardData items:', e.clipboardData?.items);
                        
                        const items = e.clipboardData?.items;
                        if (items) {
                            console.log('📋 Legacy clipboard items found:', items.length);
                            for (let i = 0; i < items.length; i++) {
                                const item = items[i];
                                console.log(`📋 Legacy item ${i}: type=${item.type}, kind=${item.kind}`);
                                
                                if (item.type.startsWith('image/')) {
                                    console.log(`✅ Found legacy image type: ${item.type}`);
                                    const file = item.getAsFile();
                                    if (file) {
                                        console.log(`📦 Legacy blob size: ${file.size} bytes`);
                                        processFile(file);
                                        foundImage = true;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        document.body.removeChild(tempInput);
                        
                        if (!foundImage) {
                            console.warn('⚠️ Legacy approach also failed - Pixelmator/professional app clipboard format not accessible via browser');
                            updateStatus('Pixelmator clipboard format not supported. Try: Save → Drag/Drop or Browse Files', 'warning');
                        }
                    };
                    
                    tempInput.addEventListener('paste', handleLegacyPaste, { once: true });
                    
                    // Trigger paste programmatically
                    setTimeout(() => {
                        try {
                            document.execCommand('paste');
                        } catch (error) {
                            console.error('❌ execCommand paste failed:', error);
                            document.body.removeChild(tempInput);
                            updateStatus('Clipboard access method not supported', 'error');
                        }
                    }, 10);
                }
            } else {
                console.error('❌ Clipboard API not supported');
                updateStatus('Clipboard access not supported', 'warning');
            }
        } catch (error) {
            console.error('❌ Clipboard access failed:', error);
            console.log('Error details:');
            console.log('  - Name:', error.name);
            console.log('  - Message:', error.message);
            console.log('  - Stack:', error.stack);
            
            if (error.name === 'NotAllowedError') {
                updateStatus('Clipboard access denied. Please allow clipboard permissions.', 'error');
            } else {
                updateStatus(`Failed to read clipboard: ${error.message}`, 'error');
            }
        } finally {
            // Reset button
            pasteButton.textContent = originalText;
            pasteButton.disabled = false;
        }
    });

    // File input change
    fileInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    });

    // Model change listeners
    model.on('change:src', updateDisplay);
    model.on('change:src', updateAppearance);

    // Initial setup
    updateDisplay();
    updateAppearance();

}

export default { render };
