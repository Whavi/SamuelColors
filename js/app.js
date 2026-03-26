/* ============================================================
   app.js — Main application logic: navigation, UI, sounds,
   confetti, localStorage persistence
   ============================================================ */

(function() {
  'use strict';

  /* -------------------------------------------------------
     DOM References
     ------------------------------------------------------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const navbar         = $('#navbar');
  const burgerMenu     = $('#burgerMenu');
  const navLinks       = $('#navLinks');
  const views          = $$('.view');
  const navLinkEls     = $$('.nav-link');

  // Coloring
  const drawingCanvas  = $('#drawingCanvas');
  const outlineCanvas  = $('#outlineCanvas');
  const canvasContainer= $('#canvasContainer');
  const canvasCursor   = $('#canvasCursor');
  const toolbar        = $('#toolbar');

  // Tool controls
  const brushSizeSlider  = $('#brushSize');
  const brushSizeLabel   = $('#brushSizeLabel');
  const eraserSizeSlider = $('#eraserSize');
  const eraserSizeLabel  = $('#eraserSizeLabel');
  const brushSizeSection = $('#brushSizeSection');
  const eraserSizeSection= $('#eraserSizeSection');
  const colorPicker      = $('#colorPicker');
  const colorPreview     = $('#currentColorPreview');
  const colorSection     = $('#colorSection');
  const favColorsSection = $('#favColorsSection');
  const mathPaletteSection = $('#mathPaletteSection');
  const mathPalette      = $('#mathPalette');

  // Buttons
  const btnUndo        = $('#btnUndo');
  const btnRedo        = $('#btnRedo');
  const btnSave        = $('#btnSave');
  const btnReset       = $('#btnReset');
  const coloringBack   = $('#coloringBack');
  const btnVerify      = $('#btnVerify');
  const mathVerifyBar  = $('#mathVerifyBar');

  // Modals
  const successModal   = $('#successModal');
  const errorModal     = $('#errorModal');
  const successMessage = $('#successMessage');
  const errorMessage   = $('#errorMessage');
  const errorDetails   = $('#errorDetails');
  const btnDownloadResult = $('#btnDownloadResult');
  const btnCloseSuccess= $('#btnCloseSuccess');
  const btnRetry       = $('#btnRetry');
  const btnShowAnswer  = $('#btnShowAnswer');

  // Confetti
  const confettiCanvas = $('#confettiCanvas');

  // Grids
  const categoriesGrid = $('#categoriesGrid');
  const drawingsGrid   = $('#drawingsGrid');
  const drawingsTitle  = $('#drawingsTitle');
  const coloringTitle  = $('#coloringTitle');
  const mathDrawingsGrid = $('#mathDrawingsGrid');
  const mathDifficulty = $('#mathDifficulty');

  /* -------------------------------------------------------
     State
     ------------------------------------------------------- */
  let currentView = 'home';
  let previousView = 'home';
  let selectedMathType = null;
  let selectedDifficulty = null;
  let currentDrawingId = null;
  let isMathColoring = false;

  // Favorite colors (persisted)
  let favColors = loadFavColors();

  /* -------------------------------------------------------
     Safe DOM helpers — all content is from hardcoded data,
     but we use DOM construction for safety.
     ------------------------------------------------------- */
  function createEl(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === 'className') el.className = v;
        else if (k === 'textContent') el.textContent = v;
        else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
        else el.setAttribute(k, v);
      }
    }
    if (children) {
      if (typeof children === 'string') el.textContent = children;
      else if (Array.isArray(children)) children.forEach(c => { if (c) el.appendChild(c); });
      else el.appendChild(children);
    }
    return el;
  }

  /* -------------------------------------------------------
     Init
     ------------------------------------------------------- */
  function init() {
    CanvasEngine.init(drawingCanvas, outlineCanvas, canvasContainer, canvasCursor);
    setupNavigation();
    setupToolbar();
    setupModals();
    renderCategories();
    updateFavColorButtons();

    // Sound context (lazy init)
    window._audioCtx = null;
  }

  /* -------------------------------------------------------
     Navigation
     ------------------------------------------------------- */
  function setupNavigation() {
    // Burger menu
    burgerMenu.addEventListener('click', () => {
      burgerMenu.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Nav links
    navLinkEls.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        if (view) showView(view);
        navLinks.classList.remove('open');
        burgerMenu.classList.remove('active');
      });
    });

    // Action buttons (data-action)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      switch (action) {
        case 'go-home': showView('home'); break;
        case 'go-categories': showView('categories'); break;
        case 'go-math': showView('math'); break;
      }
    });

    // Math type cards
    $$('.math-type-card').forEach(card => {
      card.addEventListener('click', () => {
        $$('.math-type-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedMathType = card.dataset.mathType;
        mathDifficulty.hidden = false;
        mathDrawingsGrid.hidden = true;
        playClickSound();
      });
    });

    // Difficulty buttons
    $$('[data-difficulty]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedDifficulty = btn.dataset.difficulty;
        renderMathDrawings();
        playClickSound();
      });
    });
  }

  function showView(viewId) {
    previousView = currentView;
    currentView = viewId;

    views.forEach(v => v.classList.remove('active'));
    const target = $(`#view-${viewId}`);
    if (target) target.classList.add('active');

    // Update nav
    navLinkEls.forEach(l => {
      l.classList.toggle('active', l.dataset.view === viewId);
    });

    // Reset math state when leaving math view
    if (viewId !== 'math' && viewId !== 'coloring') {
      selectedMathType = null;
      selectedDifficulty = null;
      $$('.math-type-card').forEach(c => c.classList.remove('selected'));
      mathDifficulty.hidden = true;
      mathDrawingsGrid.hidden = true;
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }

  /* -------------------------------------------------------
     Categories
     ------------------------------------------------------- */
  function renderCategories() {
    categoriesGrid.textContent = '';
    CATEGORIES.forEach(cat => {
      const iconDiv = createEl('div', { className: 'category-icon', textContent: cat.icon });
      const h3 = createEl('h3', null, cat.name);
      const p = createEl('p', null, cat.description);
      const card = createEl('div', { className: 'category-card' }, [iconDiv, h3, p]);
      card.addEventListener('click', () => {
        showDrawings(cat.id, cat.name);
        playClickSound();
      });
      categoriesGrid.appendChild(card);
    });
  }

  function showDrawings(categoryId, categoryName) {
    drawingsTitle.textContent = categoryName;
    drawingsGrid.textContent = '';

    const filtered = DRAWINGS.filter(d => d.categories.includes(categoryId));
    filtered.forEach(d => {
      const previewDiv = createEl('div', { className: 'drawing-preview' });
      // SVG from hardcoded data — safe to set
      previewDiv.innerHTML = d.svg;
      const h3 = createEl('h3', null, d.name);
      const card = createEl('div', { className: 'drawing-card' }, [previewDiv, h3]);
      card.addEventListener('click', () => {
        openColoring(d.id, false);
        playClickSound();
      });
      drawingsGrid.appendChild(card);
    });

    showView('drawings');
  }

  /* -------------------------------------------------------
     Math drawings
     ------------------------------------------------------- */
  function renderMathDrawings() {
    mathDrawingsGrid.textContent = '';
    mathDrawingsGrid.hidden = false;

    const compatible = getMathCompatibleDrawings();
    compatible.forEach(d => {
      const previewDiv = createEl('div', { className: 'drawing-preview' });
      // SVG from hardcoded data — safe to set
      previewDiv.innerHTML = d.svg;
      const h3 = createEl('h3', null, d.name);
      const card = createEl('div', { className: 'drawing-card' }, [previewDiv, h3]);
      card.addEventListener('click', () => {
        openColoring(d.id, true);
        playClickSound();
      });
      mathDrawingsGrid.appendChild(card);
    });
  }

  /* -------------------------------------------------------
     Open coloring mode
     ------------------------------------------------------- */
  function openColoring(drawingId, isMath) {
    const drawing = DRAWINGS.find(d => d.id === drawingId);
    if (!drawing) return;

    currentDrawingId = drawingId;
    isMathColoring = isMath;
    coloringTitle.textContent = drawing.name;

    // Configure toolbar for mode
    if (isMath) {
      colorSection.hidden = true;
      favColorsSection.hidden = true;
      mathPaletteSection.hidden = false;
      mathVerifyBar.hidden = false;

      // Generate exercise
      const exercise = generateMathExercise(drawingId, selectedMathType, selectedDifficulty);
      if (!exercise) return;

      // Build palette
      renderMathPaletteUI(exercise);

      // Load drawing with math mode
      showView('coloring');
      // Small delay to let layout settle before canvas init
      requestAnimationFrame(() => {
        CanvasEngine.loadDrawing(drawing.svg, true, exercise);
      });

      // Set first palette color as current
      if (exercise.legend.length > 0) {
        CanvasEngine.setColor(exercise.legend[0].color);
      }
    } else {
      colorSection.hidden = false;
      favColorsSection.hidden = false;
      mathPaletteSection.hidden = true;
      mathVerifyBar.hidden = true;

      showView('coloring');
      requestAnimationFrame(() => {
        CanvasEngine.loadDrawing(drawing.svg, false, null);
      });

      // Sync color from picker
      CanvasEngine.setColor(colorPicker.value);
      colorPreview.style.background = colorPicker.value;
    }

    // Set back button target
    coloringBack.dataset.action = isMath ? 'go-math' : 'go-categories';

    // Reset tool to brush
    setActiveTool('brush');
  }

  function renderMathPaletteUI(exercise) {
    mathPalette.textContent = '';
    exercise.legend.forEach((item, idx) => {
      const swatch = createEl('span', {
        className: 'math-palette-swatch',
        style: 'background:' + item.color
      });
      const label = createEl('span', null, item.result + ' = ' + item.colorName);
      const el = createEl('div', {
        className: 'math-palette-item' + (idx === 0 ? ' selected' : '')
      }, [swatch, label]);
      el.addEventListener('click', () => {
        $$('.math-palette-item').forEach(p => p.classList.remove('selected'));
        el.classList.add('selected');
        CanvasEngine.setColor(item.color);
        playClickSound();
      });
      mathPalette.appendChild(el);
    });
  }

  /* -------------------------------------------------------
     Toolbar
     ------------------------------------------------------- */
  function setupToolbar() {
    // Tool buttons
    $$('[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        setActiveTool(btn.dataset.tool);
        playClickSound();
      });
    });

    // Brush size
    brushSizeSlider.addEventListener('input', () => {
      const val = parseInt(brushSizeSlider.value);
      CanvasEngine.setBrushSize(val);
      brushSizeLabel.textContent = val + 'px';
    });

    // Eraser size
    eraserSizeSlider.addEventListener('input', () => {
      const val = parseInt(eraserSizeSlider.value);
      CanvasEngine.setEraserSize(val);
      eraserSizeLabel.textContent = val + 'px';
    });

    // Color picker
    colorPicker.addEventListener('input', () => {
      CanvasEngine.setColor(colorPicker.value);
      colorPreview.style.background = colorPicker.value;
    });
    colorPreview.style.background = colorPicker.value;

    // Favorite colors
    $$('.fav-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.fav);
        const color = favColors[idx];
        CanvasEngine.setColor(color);
        colorPicker.value = color;
        colorPreview.style.background = color;
        playClickSound();
      });

      btn.addEventListener('dblclick', () => {
        const idx = parseInt(btn.dataset.fav);
        // Use the current color picker value
        favColors[idx] = colorPicker.value;
        saveFavColors();
        updateFavColorButtons();
      });
    });

    // Undo/Redo
    btnUndo.addEventListener('click', () => { CanvasEngine.undo(); playClickSound(); });
    btnRedo.addEventListener('click', () => { CanvasEngine.redo(); playClickSound(); });

    // Save PNG
    btnSave.addEventListener('click', () => {
      const name = currentDrawingId || 'coloriage';
      CanvasEngine.downloadPNG('sacol-' + name + '.png');
      playClickSound();
    });

    // Reset
    btnReset.addEventListener('click', () => {
      if (confirm('Recommencer le coloriage ?')) {
        const drawing = DRAWINGS.find(d => d.id === currentDrawingId);
        if (drawing) {
          CanvasEngine.loadDrawing(
            drawing.svg,
            isMathColoring,
            isMathColoring ? CanvasEngine.mathExercise : null
          );
        }
      }
    });

    // Verify math
    btnVerify.addEventListener('click', () => {
      const result = CanvasEngine.verifyMathColoring();
      if (result.correct) {
        showSuccess(result);
      } else {
        showError(result);
      }
    });
  }

  function setActiveTool(tool) {
    $$('[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === tool));
    CanvasEngine.setTool(tool);

    brushSizeSection.hidden = (tool !== 'brush');
    eraserSizeSection.hidden = (tool !== 'eraser');
  }

  /* -------------------------------------------------------
     Favorite colors persistence
     ------------------------------------------------------- */
  function loadFavColors() {
    try {
      const saved = localStorage.getItem('sacol-fav-colors');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return ['#FF0000', '#00AA00', '#0066FF', '#FFD700'];
  }

  function saveFavColors() {
    try {
      localStorage.setItem('sacol-fav-colors', JSON.stringify(favColors));
    } catch(e) {}
  }

  function updateFavColorButtons() {
    $$('.fav-color-btn').forEach(btn => {
      const idx = parseInt(btn.dataset.fav);
      btn.style.background = favColors[idx];
    });
  }

  /* -------------------------------------------------------
     Modals
     ------------------------------------------------------- */
  function setupModals() {
    btnCloseSuccess.addEventListener('click', () => { successModal.hidden = true; });
    btnRetry.addEventListener('click', () => { errorModal.hidden = true; });
    btnShowAnswer.addEventListener('click', () => {
      errorModal.hidden = true;
      CanvasEngine.showSolution();
    });
    btnDownloadResult.addEventListener('click', () => {
      const name = currentDrawingId || 'coloriage';
      CanvasEngine.downloadPNG('sacol-' + name + '-resultat.png');
    });

    // Close modals on overlay click
    [successModal, errorModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.hidden = true;
      });
    });
  }

  function showSuccess(result) {
    successMessage.textContent = 'Bravo ! Tu as colorie ' + result.correctCount + '/' + result.total + ' zones correctement !';
    successModal.hidden = false;
    launchConfetti();
    playSuccessSound();
  }

  function showError(result) {
    errorMessage.textContent = result.correctCount + '/' + result.total + ' zones correctes.';
    const errorList = result.errors.slice(0, 5).map(function(e) {
      return e.operation + ' → ' + e.expected;
    }).join(', ');
    errorDetails.textContent = 'Erreurs : ' + errorList;
    errorModal.hidden = false;
  }

  /* -------------------------------------------------------
     Confetti
     ------------------------------------------------------- */
  function launchConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    const ctx = confettiCanvas.getContext('2d');

    const particles = [];
    const colors = ['#FF4444','#FF8800','#FFDD00','#44BB44','#4488FF','#AA44FF','#FF66AA'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width,
        y: -20 - Math.random() * 200,
        w: 6 + Math.random() * 6,
        h: 10 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let frame = 0;
    const maxFrames = 180;

    function animate() {
      frame++;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      if (frame > maxFrames) {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        return;
      }

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.rotation += p.rotationSpeed;
        if (frame > maxFrames - 40) {
          p.opacity = Math.max(0, p.opacity - 0.025);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  /* -------------------------------------------------------
     Sounds (Web Audio API — no external files)
     ------------------------------------------------------- */
  function getAudioCtx() {
    if (!window._audioCtx) {
      window._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return window._audioCtx;
  }

  function playClickSound() {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch(e) {}
  }

  function playSuccessSound() {
    try {
      const ctx = getAudioCtx();
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch(e) {}
  }

  /* -------------------------------------------------------
     Keyboard shortcuts
     ------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (currentView !== 'coloring') return;

    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) { CanvasEngine.redo(); }
      else { CanvasEngine.undo(); }
    }
    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      CanvasEngine.redo();
    }
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      CanvasEngine.downloadPNG('sacol-' + (currentDrawingId || 'coloriage') + '.png');
    }
    if (e.key === 'b' && !e.ctrlKey) setActiveTool('brush');
    if (e.key === 'e' && !e.ctrlKey) setActiveTool('eraser');
    if (e.key === 'g' && !e.ctrlKey) setActiveTool('fill');
  });

  /* -------------------------------------------------------
     Start
     ------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
