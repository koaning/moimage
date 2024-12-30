function render({model, el}){
    const width = 400;
    const height = 300;
    let segments = [];
    let selectedColor = null;
    let isErasing = false;
    let undoHistory = [];

    const container = document.createElement('div');
    container.className = 'widget-wrapper';
    container.width = width;
    container.height = height;

    const controls = document.createElement('div');
    controls.className = 'controls';

    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    const colorBtns = colors.map(color => {
        const colorBtn = document.createElement('button');
        colorBtn.className = 'color-btn';
        colorBtn.style.backgroundColor = color;
        colorBtn.dataset.color = color;
        controls.appendChild(colorBtn);
        return colorBtn;
    });

    const eraserBtn = document.createElement('button');
    eraserBtn.id = 'eraser';
    eraserBtn.className = 'action-btn';
    eraserBtn.textContent = 'Eraser';
    controls.appendChild(eraserBtn);

    const undoBtn = document.createElement('button');
    undoBtn.id = 'undo';
    undoBtn.className = 'action-btn';
    undoBtn.textContent = 'Undo';
    controls.appendChild(undoBtn);

    container.appendChild(controls);

    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'container';

    const baseImage = document.createElement('img');
    baseImage.id = 'baseImage';
    baseImage.src = 'https://placecats.com/millie/400/300';
    baseImage.alt = 'Base image';
    canvasContainer.appendChild(baseImage);

    const maskCanvas = document.createElement('canvas');
    maskCanvas.id = 'maskCanvas';
    canvasContainer.appendChild(maskCanvas);

    const interactionCanvas = document.createElement('canvas');
    interactionCanvas.id = 'interactionCanvas';
    canvasContainer.appendChild(interactionCanvas);
    
    container.appendChild(canvasContainer);
    el.appendChild(container);

    // Set canvas sizes
    maskCanvas.width = width;
    maskCanvas.height = height;
    interactionCanvas.width = width;
    interactionCanvas.height = height;
    
    const maskCtx = maskCanvas.getContext('2d');
    const interactionCtx = interactionCanvas.getContext('2d');
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Draw segments
    function drawSegments() {
        maskCtx.clearRect(0, 0, width, height);
        
        segments.forEach(segment => {
            maskCtx.beginPath();
            maskCtx.moveTo(segment.points[0].x, segment.points[0].y);
            
            for (let i = 1; i < segment.points.length; i++) {
                maskCtx.lineTo(segment.points[i].x, segment.points[i].y);
            }
            
            maskCtx.closePath();
            
            if (segment.color) {
                maskCtx.fillStyle = segment.color + '80'; // 50% opacity
                maskCtx.fill();
            }
            
            maskCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            maskCtx.lineWidth = 1;
            maskCtx.stroke();
        });
    }
    
    // Find segments under a point
    // Handle hover highlighting
    interactionCanvas.addEventListener('mousemove', (event) => {
    if (isDrawing) return;

    const rect = interactionCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    interactionCtx.clearRect(0, 0, width, height);

    const hoveredSegment = findSegmentsInRadius(x, y, 1)[0];
    if (hoveredSegment) {
        interactionCtx.beginPath();
        interactionCtx.moveTo(hoveredSegment.points[0].x, hoveredSegment.points[0].y);
        
        for (let i = 1; i < hoveredSegment.points.length; i++) {
            interactionCtx.lineTo(hoveredSegment.points[i].x, hoveredSegment.points[i].y);
        }
        
        interactionCtx.closePath();
        interactionCtx.strokeStyle = 'white';
        interactionCtx.lineWidth = 4;
        interactionCtx.stroke();
        
        interactionCtx.strokeStyle = 'black';
        interactionCtx.lineWidth = 2;
        interactionCtx.stroke();
    }
    });

    function findSegmentsInRadius(x, y, radius) {
        return segments.filter(segment => {
            const bounds = segment.points.reduce((acc, point) => {
                return {
                    minX: Math.min(acc.minX, point.x),
                    minY: Math.min(acc.minY, point.y),
                    maxX: Math.max(acc.maxX, point.x),
                    maxY: Math.max(acc.maxY, point.y)
                };
            }, {minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity});
            
            if (x < bounds.minX - radius || x > bounds.maxX + radius ||
                y < bounds.minY - radius || y > bounds.maxY + radius) {
                return false;
            }
            
            interactionCtx.beginPath();
            interactionCtx.moveTo(segment.points[0].x, segment.points[0].y);
            
            for (let i = 1; i < segment.points.length; i++) {
                interactionCtx.lineTo(segment.points[i].x, segment.points[i].y);
            }
            
            interactionCtx.closePath();
            return interactionCtx.isPointInPath(x, y);
        });
    }
    
    // Save state for undo
    function saveState() {
        undoHistory.push(segments.map(segment => ({
            ...segment,
            points: [...segment.points],
            color: segment.color
        })));
    }
    
    // Handle mouse events for drag selection
    interactionCanvas.addEventListener('mousedown', (event) => {
        if (!selectedColor && !isErasing) return;
        
        isDrawing = true;
        const rect = interactionCanvas.getBoundingClientRect();
        lastX = event.clientX - rect.left;
        lastY = event.clientY - rect.top;
        
        saveState();
        
        const affectedSegments = findSegmentsInRadius(lastX, lastY, 5);
        affectedSegments.forEach(segment => {
            segment.color = isErasing ? null : selectedColor;
        });
        drawSegments();
        let segmentsOut = segments.filter(s => s.color).map(s => ({id: s.id, color: s.color}));
        model.set("selection", segmentsOut);
        model.save_changes();
    });
    
    interactionCanvas.addEventListener('mousemove', (event) => {
        if (!isDrawing) return;
        
        const rect = interactionCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Draw selection line
        interactionCtx.clearRect(0, 0, width, height);
        interactionCtx.beginPath();
        interactionCtx.moveTo(lastX, lastY);
        interactionCtx.lineTo(x, y);
        interactionCtx.strokeStyle = isErasing ? 'rgba(0, 0, 0, 0.5)' : selectedColor + '80';
        interactionCtx.lineWidth = 10;
        interactionCtx.stroke();
        
        // Color segments under the line
        const affectedSegments = findSegmentsInRadius(x, y, 5);
        affectedSegments.forEach(segment => {
            segment.color = isErasing ? null : selectedColor;
        });
        drawSegments();
        
        lastX = x;
        lastY = y;
        let segmentsOut = segments
            .filter(s => s.color)
            .map(s => ({id: s.id, color: s.color}));
        model.set("selection", segmentsOut);
        model.save_changes();
    });
    
    interactionCanvas.addEventListener('mouseup', () => {
        isDrawing = false;
        interactionCtx.clearRect(0, 0, width, height);
    });
    
    interactionCanvas.addEventListener('mouseleave', () => {
        isDrawing = false;
        interactionCtx.clearRect(0, 0, width, height);
    });
    
    // Color button handling
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedColor = btn.dataset.color;
            isErasing = false;
            document.getElementById('eraser').classList.remove('active');
        });
    });
    
    // Eraser button
    eraserBtn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        eraserBtn.classList.add('active');
        selectedColor = null;
        isErasing = true;
    });
    
    // Undo button
    undoBtn.addEventListener('click', () => {
        if (undoHistory.length > 0) {
            segments = undoHistory.pop();
            drawSegments();
        }
        let segmentsOut = segments.filter(s => s.color).map(s => ({id: s.id, color: s.color}));
        model.set("selection", segmentsOut);
        model.save_changes();
    });

    // Initialize and draw
    segments = model.get("shapes");
    drawSegments();
};

export default { render };