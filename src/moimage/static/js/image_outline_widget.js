function render({ model, el }) {
    // Create main container
    const container = document.createElement('div');
    container.style.cssText = `
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 15px;
        max-width: 100%;
        background: #f9f9f9;
        font-family: system-ui, -apple-system, sans-serif;
    `;

    // Create controls section
    const controls = document.createElement('div');
    controls.style.cssText = `
        margin-bottom: 15px;
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        align-items: center;
    `;

    // Outline width control
    const widthContainer = document.createElement('div');
    const widthLabel = document.createElement('label');
    widthLabel.style.cssText = `
        display: block;
        margin-bottom: 5px;
        font-size: 12px;
        font-weight: 500;
    `;
    widthLabel.textContent = 'Outline Width: ';
    
    const widthValue = document.createElement('span');
    widthValue.textContent = `${model.get('outline_width')}px`;
    widthLabel.appendChild(widthValue);
    
    const widthSlider = document.createElement('input');
    widthSlider.type = 'range';
    widthSlider.min = '1';
    widthSlider.max = '50';
    widthSlider.value = model.get('outline_width');
    widthSlider.style.cssText = 'width: 150px;';
    
    widthContainer.appendChild(widthLabel);
    widthContainer.appendChild(widthSlider);

    // Outline color control
    const colorContainer = document.createElement('div');
    const colorLabel = document.createElement('label');
    colorLabel.style.cssText = `
        display: block;
        margin-bottom: 5px;
        font-size: 12px;
        font-weight: 500;
    `;
    colorLabel.textContent = 'Outline Color:';
    
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = model.get('outline_color');
    colorPicker.style.cssText = `
        width: 50px;
        height: 30px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    
    colorContainer.appendChild(colorLabel);
    colorContainer.appendChild(colorPicker);

    // Background color control
    const backgroundContainer = document.createElement('div');
    const backgroundLabel = document.createElement('label');
    backgroundLabel.style.cssText = `
        display: block;
        margin-bottom: 5px;
        font-size: 12px;
        font-weight: 500;
    `;
    backgroundLabel.textContent = 'Background Color:';
    
    const backgroundPicker = document.createElement('input');
    backgroundPicker.type = 'color';
    backgroundPicker.value = model.get('background_color');
    backgroundPicker.style.cssText = `
        width: 50px;
        height: 30px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    
    backgroundContainer.appendChild(backgroundLabel);
    backgroundContainer.appendChild(backgroundPicker);

    controls.appendChild(widthContainer);
    controls.appendChild(colorContainer);
    controls.appendChild(backgroundContainer);

    // Create canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = `
        position: relative;
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
    `;

    // Create original image canvas (hidden)
    const originalCanvas = document.createElement('canvas');
    originalCanvas.style.display = 'none';
    
    // Create display canvas
    const displayCanvas = document.createElement('canvas');
    displayCanvas.style.cssText = `
        max-width: 100%;
        height: auto;
        border: 1px solid #ddd;
    `;

    canvasContainer.appendChild(originalCanvas);
    canvasContainer.appendChild(displayCanvas);

    // Create info div
    const info = document.createElement('div');
    info.style.cssText = `
        margin-top: 10px;
        font-family: monospace;
        font-size: 12px;
        color: #666;
    `;

    // Append all elements
    container.appendChild(controls);
    container.appendChild(canvasContainer);
    container.appendChild(info);
    el.appendChild(container);

    // Create outline/glow effect around image shape
    function createOutlineEffect(imageData, outlineWidth, outlineColor, backgroundColor) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Parse outline color
        const outlineHex = outlineColor.replace('#', '');
        const outlineR = parseInt(outlineHex.substr(0, 2), 16);
        const outlineG = parseInt(outlineHex.substr(2, 2), 16);
        const outlineB = parseInt(outlineHex.substr(4, 2), 16);
        
        // Parse background color (handle transparent case)
        let backgroundR, backgroundG, backgroundB, useBackground;
        if (backgroundColor === 'transparent') {
            backgroundR = backgroundG = backgroundB = 0;
            useBackground = false;
        } else {
            const backgroundHex = backgroundColor.replace('#', '');
            backgroundR = parseInt(backgroundHex.substr(0, 2), 16);
            backgroundG = parseInt(backgroundHex.substr(2, 2), 16);
            backgroundB = parseInt(backgroundHex.substr(4, 2), 16);
            useBackground = true;
        }
        
        // Create expanded canvas for outline
        const expandedWidth = width + (outlineWidth * 2);
        const expandedHeight = height + (outlineWidth * 2);
        const expandedData = new Uint8ClampedArray(expandedWidth * expandedHeight * 4);
        
        // First, copy original image to center of expanded canvas
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const srcIdx = (y * width + x) * 4;
                const destIdx = ((y + outlineWidth) * expandedWidth + (x + outlineWidth)) * 4;
                
                expandedData[destIdx] = data[srcIdx];     // R
                expandedData[destIdx + 1] = data[srcIdx + 1]; // G
                expandedData[destIdx + 2] = data[srcIdx + 2]; // B
                expandedData[destIdx + 3] = data[srcIdx + 3]; // A
            }
        }
        
        // Create outline by expanding non-transparent pixels
        const outlineData = new Uint8ClampedArray(expandedWidth * expandedHeight * 4);
        
        for (let y = 0; y < expandedHeight; y++) {
            for (let x = 0; x < expandedWidth; x++) {
                const idx = (y * expandedWidth + x) * 4;
                
                // Check if this pixel should be part of the outline
                let shouldOutline = false;
                
                // Look in a square around this pixel for non-transparent pixels
                for (let dy = -outlineWidth; dy <= outlineWidth && !shouldOutline; dy++) {
                    for (let dx = -outlineWidth; dx <= outlineWidth && !shouldOutline; dx++) {
                        const checkY = y + dy;
                        const checkX = x + dx;
                        
                        if (checkX >= 0 && checkX < expandedWidth && 
                            checkY >= 0 && checkY < expandedHeight) {
                            
                            const checkIdx = (checkY * expandedWidth + checkX) * 4;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            // If we find a non-transparent pixel within outline distance
                            if (expandedData[checkIdx + 3] > 0 && distance <= outlineWidth) {
                                shouldOutline = true;
                            }
                        }
                    }
                }
                
                if (shouldOutline) {
                    // Only add outline where there isn't already image content
                    if (expandedData[idx + 3] === 0) {
                        outlineData[idx] = outlineR;     // R
                        outlineData[idx + 1] = outlineG; // G
                        outlineData[idx + 2] = outlineB; // B
                        outlineData[idx + 3] = 255; // A - full opacity for outline
                    }
                }
            }
        }
        
        // Fill background and combine with outline and original image
        for (let i = 0; i < expandedData.length; i += 4) {
            if (expandedData[i + 3] === 0) { // If original pixel is transparent
                if (outlineData[i + 3] > 0) {
                    // Use outline color
                    expandedData[i] = outlineData[i];         
                    expandedData[i + 1] = outlineData[i + 1];
                    expandedData[i + 2] = outlineData[i + 2];
                    expandedData[i + 3] = outlineData[i + 3];
                } else if (useBackground) {
                    // Use background color only when explicitly requested (for display)
                    expandedData[i] = backgroundR;         
                    expandedData[i + 1] = backgroundG;
                    expandedData[i + 2] = backgroundB;
                    expandedData[i + 3] = 255; // Full opacity for background
                }
                // When useBackground is false, leave transparent (alpha = 0)
            }
            // Original image pixels stay as they are (on top)
        }
        
        return {
            imageData: new ImageData(expandedData, expandedWidth, expandedHeight),
            width: expandedWidth,
            height: expandedHeight
        };
    }

    // Apply outline effect
    function applyOutline() {
        const originalCtx = originalCanvas.getContext('2d');
        
        if (!originalCanvas.width || !originalCanvas.height) return;

        // Get image data for outline processing
        const imageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
        
        // Get outline parameters
        const outlineWidth = model.get('outline_width');
        const outlineColor = model.get('outline_color');
        const backgroundColor = model.get('background_color');
        
        // Create outline effect WITH background for display
        const displayResult = createOutlineEffect(imageData, outlineWidth, outlineColor, backgroundColor);
        
        // Create outline effect WITHOUT background for output (transparent background)
        const outputResult = createOutlineEffect(imageData, outlineWidth, outlineColor, 'transparent');
        
        // Update display canvas dimensions to accommodate outline
        displayCanvas.width = displayResult.width;
        displayCanvas.height = displayResult.height;
        
        // Draw the outlined image WITH background for visual editing
        const ctx = displayCanvas.getContext('2d');
        ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
        ctx.putImageData(displayResult.imageData, 0, 0);
        
        // Create a separate canvas for the transparent output
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = outputResult.width;
        outputCanvas.height = outputResult.height;
        const outputCtx = outputCanvas.getContext('2d');
        outputCtx.putImageData(outputResult.imageData, 0, 0);
        
        // Update processed image data with transparent background
        const processedDataUrl = outputCanvas.toDataURL('image/png');
        model.set('processed_image_src', processedDataUrl);
        model.save_changes();
    }

    // Load and display image
    function loadImage() {
        const src = model.get('src');
        if (!src) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            // Set canvas dimensions
            const maxWidth = 800;
            const maxHeight = 600;
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }

            originalCanvas.width = displayCanvas.width = width;
            originalCanvas.height = displayCanvas.height = height;

            // Draw original image to hidden canvas
            const originalCtx = originalCanvas.getContext('2d');
            originalCtx.drawImage(img, 0, 0, width, height);

            // Initial display and outline application
            applyOutline();
            updateInfo();
        };

        img.onerror = function() {
            info.textContent = 'Error loading image';
            info.style.color = '#d32f2f';
        };

        img.src = src;
    }

    // Update info display
    function updateInfo() {
        const width = originalCanvas.width;
        const height = originalCanvas.height;
        const outlineWidth = model.get('outline_width');
        const outlineColor = model.get('outline_color');
        
        info.textContent = `Dimensions: ${width} × ${height}px | Outline: ${outlineWidth}px ${outlineColor}`;
        info.style.color = '#666';
    }

    // Throttling variables
    let widthThrottleTimeout;
    let colorThrottleTimeout;
    let backgroundThrottleTimeout;

    // Width slider with immediate UI feedback and throttled processing
    widthSlider.addEventListener('input', function() {
        // Immediate UI update (no delay)
        widthValue.textContent = this.value + 'px';
        
        // Throttled backend communication and processing
        clearTimeout(widthThrottleTimeout);
        widthThrottleTimeout = setTimeout(() => {
            model.set('outline_width', parseInt(this.value));
            model.save_changes();
            applyOutline();
            updateInfo();
        }, 150); // 150ms throttle for smooth but responsive experience
    });

    // Color picker with real-time updates
    colorPicker.addEventListener('input', function() {
        // Real-time color updates while dragging in color picker
        clearTimeout(colorThrottleTimeout);
        colorThrottleTimeout = setTimeout(() => {
            model.set('outline_color', this.value);
            model.save_changes();
            applyOutline();
            updateInfo();
        }, 50); // Short delay for real-time feel
    });

    // Fallback for color picker change event (when picker closes)
    colorPicker.addEventListener('change', function() {
        clearTimeout(colorThrottleTimeout);
        model.set('outline_color', this.value);
        model.save_changes();
        applyOutline();
        updateInfo();
    });

    // Background color picker with real-time updates
    backgroundPicker.addEventListener('input', function() {
        clearTimeout(backgroundThrottleTimeout);
        backgroundThrottleTimeout = setTimeout(() => {
            model.set('background_color', this.value);
            model.save_changes();
            applyOutline();
            updateInfo();
        }, 50); // Short delay for real-time feel
    });

    // Fallback for background color picker change event
    backgroundPicker.addEventListener('change', function() {
        clearTimeout(backgroundThrottleTimeout);
        model.set('background_color', this.value);
        model.save_changes();
        applyOutline();
        updateInfo();
    });

    // Model change listeners
    model.on('change:src', loadImage);
    model.on('change:outline_width', function() {
        widthSlider.value = model.get('outline_width');
        widthValue.textContent = model.get('outline_width') + 'px';
        applyOutline();
    });
    model.on('change:outline_color', function() {
        colorPicker.value = model.get('outline_color');
        applyOutline();
    });
    model.on('change:background_color', function() {
        backgroundPicker.value = model.get('background_color');
        applyOutline();
    });

    // Initial load
    loadImage();
}

export default { render };
