/* ============================================================
   canvas-engine.js — Core drawing engine (brush, eraser, fill,
   undo/redo, layers, SVG rendering, math zone management)
   ============================================================ */

// Polyfill for roundRect (older browsers)
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (typeof r === 'number') r = [r];
    const rad = r[0] || 0;
    this.moveTo(x + rad, y);
    this.lineTo(x + w - rad, y);
    this.quadraticCurveTo(x + w, y, x + w, y + rad);
    this.lineTo(x + w, y + h - rad);
    this.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    this.lineTo(x + rad, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - rad);
    this.lineTo(x, y + rad);
    this.quadraticCurveTo(x, y, x + rad, y);
    this.closePath();
    return this;
  };
}

const CanvasEngine = (() => {
  // DOM
  let drawCanvas, drawCtx;
  let outlineCanvas, outlineCtx;
  let container;
  let cursorEl;

  // State
  let width = 0, height = 0;
  let isDrawing = false;
  let lastX = 0, lastY = 0;
  let currentTool = 'brush';   // brush | eraser | fill
  let currentColor = '#FF0000';
  let brushSize = 8;
  let eraserSize = 20;

  // Cached outline pixel data for flood fill boundaries
  let outlineData = null;

  // History (undo/redo)
  let history = [];
  let historyIndex = -1;
  const MAX_HISTORY = 40;

  // SVG data for outline rendering
  let currentSvg = null;

  // Math mode
  let mathMode = false;
  let mathExercise = null;  // { legend, zones }
  let zonePixelMap = null;  // ImageData mapping zone colors to zone IDs

  // Offscreen canvas for zone detection in math mode
  let zoneCanvas, zoneCtx;

  /* -------------------------------------------------------
     Initialize
     ------------------------------------------------------- */
  function init(drawCanvasEl, outlineCanvasEl, containerEl, cursorElement) {
    drawCanvas = drawCanvasEl;
    drawCtx = drawCanvas.getContext('2d', { willReadFrequently: true });
    outlineCanvas = outlineCanvasEl;
    outlineCtx = outlineCanvas.getContext('2d');
    container = containerEl;
    cursorEl = cursorElement;

    resize();
    setupEvents();
    window.addEventListener('resize', debounce(resize, 200));
  }

  /* -------------------------------------------------------
     Resize canvases to container
     ------------------------------------------------------- */
  function resize() {
    const rect = container.getBoundingClientRect();
    const newWidth = Math.floor(rect.width);
    const newHeight = Math.floor(rect.height);

    // Skip if container is not visible yet
    if (newWidth === 0 || newHeight === 0) return;

    // Skip if same size
    if (newWidth === width && newHeight === height) return;

    // Save current drawing
    let savedImage = null;
    if (width > 0 && height > 0 && drawCanvas.width > 0 && drawCanvas.height > 0) {
      savedImage = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
    }

    width = newWidth;
    height = newHeight;
    drawCanvas.width = width;
    drawCanvas.height = height;
    outlineCanvas.width = width;
    outlineCanvas.height = height;

    // Fill white background
    drawCtx.fillStyle = '#FFFFFF';
    drawCtx.fillRect(0, 0, width, height);

    // Restore drawing (scaled)
    if (savedImage) {
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = savedImage.width;
      tmpCanvas.height = savedImage.height;
      tmpCanvas.getContext('2d').putImageData(savedImage, 0, 0);
      drawCtx.drawImage(tmpCanvas, 0, 0, width, height);
    }

    // Re-render outline
    if (currentSvg) {
      renderOutline(currentSvg);
    }

    // Re-build zone map if in math mode
    if (mathMode && currentSvg) {
      buildZoneMap();
    }
  }

  /* -------------------------------------------------------
     Load a drawing (SVG string)
     ------------------------------------------------------- */
  function loadDrawing(svgString, isMathMode = false, exercise = null) {
    currentSvg = svgString;
    mathMode = isMathMode;
    mathExercise = exercise;

    // Force dimensions recalculation (view may have just become visible)
    const rect = container.getBoundingClientRect();
    const newW = Math.floor(rect.width);
    const newH = Math.floor(rect.height);

    // If container not visible yet, retry after layout settles
    if (newW === 0 || newH === 0) {
      setTimeout(() => loadDrawing(svgString, isMathMode, exercise), 60);
      return;
    }

    // Update canvas dimensions
    width = newW;
    height = newH;
    drawCanvas.width = width;
    drawCanvas.height = height;
    outlineCanvas.width = width;
    outlineCanvas.height = height;

    // Clear everything
    drawCtx.clearRect(0, 0, width, height);
    // Fill white background on draw canvas
    drawCtx.fillStyle = '#FFFFFF';
    drawCtx.fillRect(0, 0, width, height);

    renderOutline(svgString).then(() => {
      if (mathMode && exercise) {
        buildZoneMap();
        renderMathLabels();
      }
    });

    clearHistory();
    saveState();
  }

  /* -------------------------------------------------------
     Render SVG as outline on the outline canvas
     ------------------------------------------------------- */
  function renderOutline(svgString) {
    return new Promise((resolve) => {
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        outlineCtx.clearRect(0, 0, width, height);
        outlineCtx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        // Cache outline pixel data for flood fill boundary detection
        cacheOutlineData();
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });
  }

  /* -------------------------------------------------------
     Cache outline pixels as a boundary mask
     A pixel is a "wall" if it's dark (part of the outline)
     ------------------------------------------------------- */
  function cacheOutlineData() {
    if (width === 0 || height === 0) { outlineData = null; return; }
    const imgData = outlineCtx.getImageData(0, 0, width, height);
    const src = imgData.data;
    // Create a simple boolean mask: 1 = wall (outline), 0 = passable
    outlineData = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const r = src[idx], g = src[idx+1], b = src[idx+2], a = src[idx+3];
      // Dark opaque pixels are walls (outlines)
      if (a > 100 && r < 100 && g < 100 && b < 100) {
        outlineData[i] = 1;
      }
    }
  }

  /* -------------------------------------------------------
     Build zone pixel map for math mode fill detection
     ------------------------------------------------------- */
  function buildZoneMap() {
    if (!mathExercise || !currentSvg) return;

    zoneCanvas = document.createElement('canvas');
    zoneCanvas.width = width;
    zoneCanvas.height = height;
    zoneCtx = zoneCanvas.getContext('2d', { willReadFrequently: true });

    // Parse SVG and color each zone uniquely
    const parser = new DOMParser();
    const doc = parser.parseFromString(currentSvg, 'image/svg+xml');
    const zones = doc.querySelectorAll('[data-zone]');

    // Assign unique colors for zone identification
    const zoneColorMap = {};
    let colorIdx = 0;
    zones.forEach(el => {
      const zoneId = el.getAttribute('data-zone');
      if (!zoneColorMap[zoneId]) {
        const r = ((colorIdx * 37 + 50) % 200) + 30;
        const g = ((colorIdx * 73 + 80) % 200) + 30;
        const b = ((colorIdx * 53 + 110) % 200) + 30;
        zoneColorMap[zoneId] = `rgb(${r},${g},${b})`;
        colorIdx++;
      }
      el.setAttribute('fill', zoneColorMap[zoneId]);
      el.setAttribute('stroke', zoneColorMap[zoneId]);
      el.setAttribute('stroke-width', '2');
    });

    // Remove non-zone elements visibility
    const allElements = doc.querySelectorAll('*:not([data-zone])');
    allElements.forEach(el => {
      if (el.tagName !== 'svg' && el.tagName !== 'g' && !el.querySelector('[data-zone]')) {
        el.setAttribute('fill', 'none');
        el.setAttribute('stroke', 'none');
      }
    });

    const svg = new XMLSerializer().serializeToString(doc.documentElement);
    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      zoneCtx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      // Store the pixel data for zone lookup
      zonePixelMap = {
        imageData: zoneCtx.getImageData(0, 0, width, height),
        colorToZone: {}
      };

      // Map colors back to zone IDs
      for (const [zoneId, color] of Object.entries(zoneColorMap)) {
        const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
        if (match) {
          const key = `${match[1]},${match[2]},${match[3]}`;
          zonePixelMap.colorToZone[key] = zoneId;
        }
      }
    };
    img.src = url;
  }

  /* -------------------------------------------------------
     Get zone ID at pixel position
     ------------------------------------------------------- */
  function getZoneAtPoint(x, y) {
    if (!zonePixelMap) return null;
    const px = Math.floor(x);
    const py = Math.floor(y);
    if (px < 0 || py < 0 || px >= width || py >= height) return null;

    const idx = (py * width + px) * 4;
    const data = zonePixelMap.imageData.data;
    const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
    if (a < 50) return null;

    // Search nearby for best match
    const key = `${r},${g},${b}`;
    if (zonePixelMap.colorToZone[key]) return zonePixelMap.colorToZone[key];

    // Fuzzy match (tolerance 30)
    for (const [colorKey, zoneId] of Object.entries(zonePixelMap.colorToZone)) {
      const [cr, cg, cb] = colorKey.split(',').map(Number);
      if (Math.abs(cr-r) < 30 && Math.abs(cg-g) < 30 && Math.abs(cb-b) < 30) {
        return zoneId;
      }
    }
    return null;
  }

  /* -------------------------------------------------------
     Render math operation labels on zones
     ------------------------------------------------------- */
  function renderMathLabels() {
    if (!mathExercise) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(currentSvg, 'image/svg+xml');

    mathExercise.zones.forEach(zone => {
      const el = doc.querySelector(`[data-zone="${zone.zoneId}"]`);
      if (!el) return;

      // Get zone center approximately
      const bbox = getApproximateBBox(el);
      if (!bbox) return;

      const cx = (bbox.x + bbox.width / 2) * (width / 400);
      const cy = (bbox.y + bbox.height / 2) * (height / 400);

      // Draw label on outline canvas
      const fontSize = Math.max(10, Math.min(14, width / 30));
      outlineCtx.save();
      outlineCtx.font = `bold ${fontSize}px ${getComputedStyle(document.body).fontFamily}`;
      outlineCtx.textAlign = 'center';
      outlineCtx.textBaseline = 'middle';

      // Background
      const metrics = outlineCtx.measureText(zone.operation);
      const tw = metrics.width + 8;
      const th = fontSize + 6;
      outlineCtx.fillStyle = 'rgba(255,255,255,0.85)';
      outlineCtx.beginPath();
      outlineCtx.roundRect(cx - tw/2, cy - th/2, tw, th, 4);
      outlineCtx.fill();

      outlineCtx.strokeStyle = '#333';
      outlineCtx.lineWidth = 1;
      outlineCtx.beginPath();
      outlineCtx.roundRect(cx - tw/2, cy - th/2, tw, th, 4);
      outlineCtx.stroke();

      // Text
      outlineCtx.fillStyle = '#222';
      outlineCtx.fillText(zone.operation, cx, cy);
      outlineCtx.restore();
    });
  }

  /* -------------------------------------------------------
     Approximate bounding box from SVG element attributes
     ------------------------------------------------------- */
  function getApproximateBBox(el) {
    const tag = el.tagName.toLowerCase();
    if (tag === 'circle') {
      const cx = parseFloat(el.getAttribute('cx') || 0);
      const cy = parseFloat(el.getAttribute('cy') || 0);
      const r = parseFloat(el.getAttribute('r') || 0);
      return { x: cx - r, y: cy - r, width: r*2, height: r*2 };
    }
    if (tag === 'ellipse') {
      const cx = parseFloat(el.getAttribute('cx') || 0);
      const cy = parseFloat(el.getAttribute('cy') || 0);
      const rx = parseFloat(el.getAttribute('rx') || 0);
      const ry = parseFloat(el.getAttribute('ry') || 0);
      return { x: cx - rx, y: cy - ry, width: rx*2, height: ry*2 };
    }
    if (tag === 'rect') {
      return {
        x: parseFloat(el.getAttribute('x') || 0),
        y: parseFloat(el.getAttribute('y') || 0),
        width: parseFloat(el.getAttribute('width') || 0),
        height: parseFloat(el.getAttribute('height') || 0)
      };
    }
    if (tag === 'polygon') {
      const points = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < points.length; i += 2) {
        minX = Math.min(minX, points[i]);
        maxX = Math.max(maxX, points[i]);
        minY = Math.min(minY, points[i+1]);
        maxY = Math.max(maxY, points[i+1]);
      }
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    if (tag === 'path') {
      // Rough parse of path d attribute
      const d = el.getAttribute('d') || '';
      const nums = d.match(/-?\d+\.?\d*/g);
      if (!nums || nums.length < 2) return { x: 100, y: 100, width: 200, height: 200 };
      const coords = nums.map(Number);
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < coords.length; i += 2) {
        if (i+1 < coords.length) {
          minX = Math.min(minX, coords[i]);
          maxX = Math.max(maxX, coords[i]);
          minY = Math.min(minY, coords[i+1]);
          maxY = Math.max(maxY, coords[i+1]);
        }
      }
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    return { x: 100, y: 100, width: 200, height: 200 };
  }

  /* -------------------------------------------------------
     Events (mouse + touch)
     ------------------------------------------------------- */
  function setupEvents() {
    // Mouse
    drawCanvas.addEventListener('mousedown', onPointerDown);
    drawCanvas.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // Touch
    drawCanvas.addEventListener('touchstart', onTouchStart, { passive: false });
    drawCanvas.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    // Cursor
    container.addEventListener('mouseenter', () => { cursorEl.style.display = 'block'; });
    container.addEventListener('mouseleave', () => {
      cursorEl.style.display = 'none';
      if (isDrawing) onPointerUp();
    });
    container.addEventListener('mousemove', updateCursor);
  }

  function getPos(e) {
    const rect = drawCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (width / rect.width),
      y: (e.clientY - rect.top) * (height / rect.height)
    };
  }

  function onPointerDown(e) {
    e.preventDefault();
    const pos = getPos(e);

    if (currentTool === 'fill') {
      floodFill(Math.floor(pos.x), Math.floor(pos.y), currentColor);
      saveState();
      return;
    }

    isDrawing = true;
    lastX = pos.x;
    lastY = pos.y;

    // Draw a dot
    drawDot(pos.x, pos.y);
  }

  function onPointerMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    drawLine(lastX, lastY, pos.x, pos.y);
    lastX = pos.x;
    lastY = pos.y;
  }

  function onPointerUp() {
    if (isDrawing) {
      isDrawing = false;
      saveState();
    }
  }

  function onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY, preventDefault() {} };
    onPointerDown(fakeEvent);
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY, preventDefault() {} };
    onPointerMove(fakeEvent);
  }

  function updateCursor(e) {
    const size = currentTool === 'eraser' ? eraserSize : brushSize;
    const rect = container.getBoundingClientRect();
    const scale = rect.width / width;
    const displaySize = size * scale;
    cursorEl.style.left = e.clientX + 'px';
    cursorEl.style.top = e.clientY + 'px';
    cursorEl.style.width = displaySize + 'px';
    cursorEl.style.height = displaySize + 'px';

    if (currentTool === 'eraser') {
      cursorEl.style.borderColor = 'rgba(255,0,0,0.5)';
      cursorEl.style.background = 'rgba(255,255,255,0.3)';
    } else if (currentTool === 'fill') {
      cursorEl.style.display = 'none';
    } else {
      cursorEl.style.borderColor = 'rgba(0,0,0,0.5)';
      cursorEl.style.background = hexToRgba(currentColor, 0.3);
    }
  }

  /* -------------------------------------------------------
     Drawing operations
     ------------------------------------------------------- */
  function drawDot(x, y) {
    drawCtx.save();
    if (currentTool === 'eraser') {
      drawCtx.globalCompositeOperation = 'source-over';
      drawCtx.fillStyle = '#FFFFFF';
      drawCtx.beginPath();
      drawCtx.arc(x, y, eraserSize / 2, 0, Math.PI * 2);
      drawCtx.fill();
    } else {
      drawCtx.globalCompositeOperation = 'source-over';
      drawCtx.fillStyle = currentColor;
      drawCtx.beginPath();
      drawCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      drawCtx.fill();
    }
    drawCtx.restore();
  }

  function drawLine(x1, y1, x2, y2) {
    drawCtx.save();
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';

    if (currentTool === 'eraser') {
      drawCtx.globalCompositeOperation = 'source-over';
      drawCtx.strokeStyle = '#FFFFFF';
      drawCtx.lineWidth = eraserSize;
    } else {
      drawCtx.globalCompositeOperation = 'source-over';
      drawCtx.strokeStyle = currentColor;
      drawCtx.lineWidth = brushSize;
    }

    drawCtx.beginPath();
    drawCtx.moveTo(x1, y1);
    drawCtx.lineTo(x2, y2);
    drawCtx.stroke();
    drawCtx.restore();
  }

  /* -------------------------------------------------------
     Flood Fill (bucket tool) — scanline-based
     Uses cached outline mask as boundary.
     Fills on drawing canvas only; outlines block propagation.
     ------------------------------------------------------- */
  function floodFill(startX, startY, fillColor) {
    if (startX < 0 || startY < 0 || startX >= width || startY >= height) return;

    // If outline data not cached yet, try to build it now
    if (!outlineData) cacheOutlineData();

    // Check if start pixel is on an outline wall
    if (outlineData && outlineData[startY * width + startX]) return;

    const imageData = drawCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const fill = hexToRgbaArr(fillColor);

    const startIdx = (startY * width + startX) * 4;
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];

    // Don't fill if already the same color
    if (Math.abs(targetR - fill[0]) < 15 &&
        Math.abs(targetG - fill[1]) < 15 &&
        Math.abs(targetB - fill[2]) < 15) return;

    const tolerance = 35;

    // Check if a pixel on the drawing canvas matches the target color
    function matchesTarget(idx) {
      return Math.abs(data[idx] - targetR) <= tolerance &&
             Math.abs(data[idx+1] - targetG) <= tolerance &&
             Math.abs(data[idx+2] - targetB) <= tolerance;
    }

    // Check if pixel is passable: matches target AND not an outline wall
    function canPass(pixelIdx, dataIdx) {
      if (outlineData && outlineData[pixelIdx]) return false;
      return matchesTarget(dataIdx);
    }

    function setPixel(idx) {
      data[idx]   = fill[0];
      data[idx+1] = fill[1];
      data[idx+2] = fill[2];
      data[idx+3] = 255;
    }

    const stack = [[startX, startY]];
    const visited = new Uint8Array(width * height);

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const pidx = y * width + x;

      if (visited[pidx]) continue;
      if (!canPass(pidx, pidx * 4)) continue;

      // Scan left
      let leftX = x;
      while (leftX > 0) {
        const lp = y * width + (leftX - 1);
        if (!canPass(lp, lp * 4) || visited[lp]) break;
        leftX--;
      }

      // Scan right and fill
      let rightX = leftX;
      while (rightX < width) {
        const rp = y * width + rightX;
        if (!canPass(rp, rp * 4) || visited[rp]) break;

        setPixel(rp * 4);
        visited[rp] = 1;

        if (y > 0) {
          const ap = (y - 1) * width + rightX;
          if (!visited[ap] && canPass(ap, ap * 4)) stack.push([rightX, y - 1]);
        }
        if (y < height - 1) {
          const bp = (y + 1) * width + rightX;
          if (!visited[bp] && canPass(bp, bp * 4)) stack.push([rightX, y + 1]);
        }
        rightX++;
      }
    }

    drawCtx.putImageData(imageData, 0, 0);
  }

  /* -------------------------------------------------------
     History (Undo / Redo)
     ------------------------------------------------------- */
  function saveState() {
    // Remove future states
    if (historyIndex < history.length - 1) {
      history = history.slice(0, historyIndex + 1);
    }
    // Save
    if (width > 0 && height > 0) {
      history.push(drawCtx.getImageData(0, 0, width, height));
      if (history.length > MAX_HISTORY) {
        history.shift();
      }
      historyIndex = history.length - 1;
    }
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      drawCtx.putImageData(history[historyIndex], 0, 0);
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      drawCtx.putImageData(history[historyIndex], 0, 0);
    }
  }

  function clearHistory() {
    history = [];
    historyIndex = -1;
  }

  /* -------------------------------------------------------
     Reset canvas
     ------------------------------------------------------- */
  function reset() {
    drawCtx.fillStyle = '#FFFFFF';
    drawCtx.fillRect(0, 0, width, height);
    clearHistory();
    saveState();
  }

  /* -------------------------------------------------------
     Export to PNG (merged layers)
     ------------------------------------------------------- */
  function exportPNG() {
    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = width;
    mergedCanvas.height = height;
    const ctx = mergedCanvas.getContext('2d');
    ctx.drawImage(drawCanvas, 0, 0);
    ctx.drawImage(outlineCanvas, 0, 0);
    return mergedCanvas.toDataURL('image/png');
  }

  function downloadPNG(filename = 'coloriage.png') {
    const dataUrl = exportPNG();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  /* -------------------------------------------------------
     Math mode: Verify coloring
     Returns { correct: bool, errors: [{zoneId, expected, got}], score }
     ------------------------------------------------------- */
  function verifyMathColoring() {
    if (!mathMode || !mathExercise || !zonePixelMap) {
      return { correct: true, errors: [], score: 100 };
    }

    const imageData = drawCtx.getImageData(0, 0, width, height);
    const errors = [];
    let correct = 0;

    mathExercise.zones.forEach(zone => {
      // Sample multiple points in the zone to determine dominant color
      const zonePixels = getZonePixels(zone.zoneId);
      if (zonePixels.length === 0) return;

      // Get dominant color of the user's drawing in this zone
      const dominantColor = getDominantColor(imageData, zonePixels);

      // Check if dominant color matches expected
      const expectedRgb = hexToRgbaArr(zone.correctColor);
      const dist = colorDistance(dominantColor, expectedRgb);

      if (dist < 80) {
        correct++;
      } else {
        errors.push({
          zoneId: zone.zoneId,
          expected: zone.correctColorName,
          operation: zone.operation
        });
      }
    });

    const total = mathExercise.zones.length;
    const score = Math.round((correct / total) * 100);
    return { correct: errors.length === 0, errors, score, total, correctCount: correct };
  }

  function getZonePixels(zoneId) {
    if (!zonePixelMap) return [];
    const pixels = [];
    const data = zonePixelMap.imageData.data;

    // Find the color for this zone
    let targetColor = null;
    for (const [colorKey, id] of Object.entries(zonePixelMap.colorToZone)) {
      if (id === zoneId) {
        targetColor = colorKey.split(',').map(Number);
        break;
      }
    }
    if (!targetColor) return [];

    // Sample every 4th pixel for performance
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const idx = (y * width + x) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        if (a < 50) continue;
        if (Math.abs(r - targetColor[0]) < 30 &&
            Math.abs(g - targetColor[1]) < 30 &&
            Math.abs(b - targetColor[2]) < 30) {
          pixels.push({ x, y });
        }
      }
    }
    return pixels;
  }

  function getDominantColor(imageData, pixels) {
    const colorCounts = {};
    const data = imageData.data;

    pixels.forEach(({ x, y }) => {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // Skip white/near-white
      if (r > 240 && g > 240 && b > 240) return;
      // Skip black/near-black (outlines)
      if (r < 40 && g < 40 && b < 40) return;
      // Quantize to reduce noise
      const qr = Math.round(r / 20) * 20;
      const qg = Math.round(g / 20) * 20;
      const qb = Math.round(b / 20) * 20;
      const key = `${qr},${qg},${qb}`;
      colorCounts[key] = (colorCounts[key] || 0) + 1;
    });

    let maxCount = 0;
    let dominant = [255, 255, 255];
    for (const [key, count] of Object.entries(colorCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominant = key.split(',').map(Number);
      }
    }
    return dominant;
  }

  function colorDistance(a, b) {
    return Math.sqrt(
      (a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2
    );
  }

  /* -------------------------------------------------------
     Show solution (fill zones with correct colors)
     ------------------------------------------------------- */
  function showSolution() {
    if (!mathExercise || !currentSvg) return;

    // Create SVG with correct colors
    const parser = new DOMParser();
    const doc = parser.parseFromString(currentSvg, 'image/svg+xml');

    mathExercise.zones.forEach(zone => {
      const els = doc.querySelectorAll(`[data-zone="${zone.zoneId}"]`);
      els.forEach(el => {
        el.setAttribute('fill', zone.correctColor);
      });
    });

    const svg = new XMLSerializer().serializeToString(doc.documentElement);
    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      drawCtx.clearRect(0, 0, width, height);
      drawCtx.fillStyle = '#FFFFFF';
      drawCtx.fillRect(0, 0, width, height);
      drawCtx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      // Re-render outline on top
      renderOutline(currentSvg);
    };
    img.src = url;
  }

  /* -------------------------------------------------------
     Utility
     ------------------------------------------------------- */
  function hexToRgbaArr(hex) {
    hex = hex.replace('#', '');
    return [
      parseInt(hex.substring(0,2), 16),
      parseInt(hex.substring(2,4), 16),
      parseInt(hex.substring(4,6), 16),
      255
    ];
  }

  function hexToRgba(hex, alpha) {
    const arr = hexToRgbaArr(hex);
    return `rgba(${arr[0]},${arr[1]},${arr[2]},${alpha})`;
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  /* -------------------------------------------------------
     Setters
     ------------------------------------------------------- */
  function setTool(tool) { currentTool = tool; }
  function setColor(color) { currentColor = color; }
  function setBrushSize(size) { brushSize = size; }
  function setEraserSize(size) { eraserSize = size; }

  /* -------------------------------------------------------
     Public API
     ------------------------------------------------------- */
  return {
    init,
    loadDrawing,
    setTool,
    setColor,
    setBrushSize,
    setEraserSize,
    undo,
    redo,
    reset,
    exportPNG,
    downloadPNG,
    verifyMathColoring,
    showSolution,
    get currentTool() { return currentTool; },
    get currentColor() { return currentColor; },
    get mathMode() { return mathMode; },
    get mathExercise() { return mathExercise; }
  };
})();
