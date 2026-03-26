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
  const mathVerifySection  = $('#mathVerifySection');

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
  /* -------------------------------------------------------
     i18n translations
     ------------------------------------------------------- */
  const I18N = {
    fr: {
      'nav.home': 'Accueil',
      'nav.drawings': 'Dessins',
      'hero.title': 'Bienvenue sur <span class="highlight">SamuelColors</span> !',
      'hero.sub': "L'appli de coloriage qui rend les maths amusantes",
      'hero.start': '🚀 Commencer',
      'stats.drawings': 'Dessins',
      'stats.categories': 'Categories',
      'stats.calctypes': 'Types de calculs',
      'stats.levels': 'Niveaux',
      'howto.title': 'Comment ca marche ?',
      'howto.step1': 'Choisis un dessin',
      'howto.step1d': 'Animaux, heros ou formes simples',
      'howto.step2': 'Colorie !',
      'howto.step2d': 'Pinceau, seau ou calculs maths',
      'howto.step3': 'Sauvegarde',
      'howto.step3d': "Telecharge ton chef-d'oeuvre en PNG",
      'cta.title': 'Pret a colorier ?',
      'cta.sub': 'C\'est gratuit et ca marche directement dans ton navigateur !',
      'cta.btn': 'Choisir un dessin 🎨',
      'picker.title': 'Choisis ton dessin',
      'folders.title': 'Nos collections',
      'folders.sub': 'Choisis une collection puis colorie ou fais des maths !',
    },
    en: {
      'nav.home': 'Home',
      'nav.drawings': 'Drawings',
      'hero.title': 'Welcome to <span class="highlight">SamuelColors</span>!',
      'hero.sub': 'The coloring app that makes math fun',
      'hero.start': '🚀 Start',
      'stats.drawings': 'Drawings',
      'stats.categories': 'Categories',
      'stats.calctypes': 'Calc types',
      'stats.levels': 'Levels',
      'howto.title': 'How does it work?',
      'howto.step1': 'Pick a drawing',
      'howto.step1d': 'Animals, heroes or simple shapes',
      'howto.step2': 'Color it!',
      'howto.step2d': 'Brush, bucket or math challenges',
      'howto.step3': 'Save',
      'howto.step3d': 'Download your masterpiece as PNG',
      'cta.title': 'Ready to color?',
      'cta.sub': "It's free and works right in your browser!",
      'cta.btn': 'Pick a drawing 🎨',
      'picker.title': 'Pick your drawing',
      'folders.title': 'Our collections',
      'folders.sub': 'Pick a collection then color or do math!',
    }
  };

  let currentLang = localStorage.getItem('sc-lang') || 'fr';

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('sc-lang', lang);
    const dict = I18N[lang] || I18N.fr;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) {
        if (key === 'hero.title') {
          el.innerHTML = dict[key]; // contains <span>
        } else {
          el.textContent = dict[key];
        }
      }
    });
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.textContent = lang.toUpperCase();
  }

  /* -------------------------------------------------------
     Dark mode
     ------------------------------------------------------- */
  let darkMode = localStorage.getItem('sc-dark') === 'true';

  function applyDark(on) {
    darkMode = on;
    localStorage.setItem('sc-dark', on);
    document.documentElement.setAttribute('data-theme', on ? 'dark' : 'light');
    const btn = document.getElementById('darkToggle');
    if (btn) btn.textContent = on ? '☀️' : '🌙';
  }

  function init() {
    CanvasEngine.init(drawingCanvas, outlineCanvas, canvasContainer, canvasCursor);
    setupNavigation();
    setupToolbar();
    setupModals();
    setupPicker();
    setupFolders();
    setupProfiles();
    renderCategories();
    updateFavColorButtons();

    // Dark mode toggle
    const darkBtn = $('#darkToggle');
    if (darkBtn) darkBtn.addEventListener('click', () => { applyDark(!darkMode); playClickSound(); });
    applyDark(darkMode);

    // Language toggle
    const langBtn = $('#langToggle');
    if (langBtn) langBtn.addEventListener('click', () => {
      applyLang(currentLang === 'fr' ? 'en' : 'fr');
      playClickSound();
    });
    applyLang(currentLang);

    // Auto-verify callback for math mode
    CanvasEngine.setOnAllZonesColored(() => {
      // Small delay to let the last paint render
      setTimeout(() => {
        const result = CanvasEngine.verifyMathColoring();
        if (result.correct) {
          showSuccess(result);
        } else {
          showError(result);
        }
      }, 300);
    });

    // Sound context (lazy init)
    window._audioCtx = null;
  }

  /* -------------------------------------------------------
     Generic folder modal opener
     ------------------------------------------------------- */
  const FOLDER_GRADIENTS = {
    animaux: 'linear-gradient(135deg, #A29BFE, #FD79A8)',
    heros:   'linear-gradient(135deg, #FDCB6E, #E17055)',
    monde:   'linear-gradient(135deg, #81ECEC, #74B9FF)',
    bilal:   'linear-gradient(135deg, #00B894, #00CEC9)',
    samuel:  'linear-gradient(135deg, #6C5CE7, #FD79A8)',
    lazhaar: 'linear-gradient(135deg, #E17055, #FDCB6E)',
  };

  function openFolderModal(config) {
    const overlay = $('#folderModal');
    const banner = $('#folderModalBanner');
    const grid = $('#folderModalGrid');
    const mathOpts = $('#folderMathOpts');
    const iconEl = $('#folderModalIcon');
    const titleEl = $('#folderModalTitle');
    const descEl = $('#folderModalDesc');

    // Set banner
    banner.style.background = FOLDER_GRADIENTS[config.id] || FOLDER_GRADIENTS.samuel;
    iconEl.textContent = config.icon;
    titleEl.textContent = config.title;
    descEl.textContent = config.desc;

    // Current state
    let isMathTab = false;

    function fillGrid() {
      grid.textContent = '';
      const list = isMathTab
        ? config.drawings.filter(d => {
            const p = new DOMParser();
            return p.parseFromString(d.svg, 'image/svg+xml').querySelectorAll('[data-zone]').length >= 4;
          })
        : config.drawings;

      list.forEach(d => {
        const preview = createEl('div', { className: 'picker-card-preview' });
        preview.innerHTML = d.svg;
        const title = createEl('h4', null, d.name);
        const card = createEl('div', { className: 'picker-card' }, [preview, title]);
        card.addEventListener('click', () => {
          closeFolderModal();
          playClickSound();
          if (isMathTab) {
            selectedMathType = $$('[data-fmtype].active')[0]?.dataset.fmtype || 'addition';
            selectedDifficulty = $$('[data-fdiff].active')[0]?.dataset.fdiff || 'easy';
            openColoring(d.id, true);
          } else {
            openColoring(d.id, false);
          }
        });
        grid.appendChild(card);
      });
    }

    // Tabs
    $$('[data-ftab]').forEach(t => {
      t.onclick = () => {
        $$('[data-ftab]').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        isMathTab = t.dataset.ftab === 'math';
        mathOpts.hidden = !isMathTab;
        fillGrid();
      };
    });

    // Math type + difficulty chips
    $$('[data-fmtype]').forEach(c => {
      c.onclick = () => { $$('[data-fmtype]').forEach(x => x.classList.remove('active')); c.classList.add('active'); };
    });
    $$('[data-fdiff]').forEach(c => {
      c.onclick = () => { $$('[data-fdiff]').forEach(x => x.classList.remove('active')); c.classList.add('active'); };
    });

    // Reset to libre tab
    $$('[data-ftab]').forEach(t => t.classList.toggle('active', t.dataset.ftab === 'libre'));
    isMathTab = false;
    mathOpts.hidden = true;

    fillGrid();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeFolderModal() {
    $('#folderModal').hidden = true;
    document.body.style.overflow = '';
  }

  /* -------------------------------------------------------
     Profiles (Bilal, Samuel, Lazhaar) — unique drawings
     ------------------------------------------------------- */
  function setupProfiles() {
    const profileDrawings = {
      bilal:   ['cat', 'dog', 'lion', 'star', 'house'],
      samuel:  ['butterfly', 'hero', 'robot', 'flower', 'rocket', 'rainbow'],
      lazhaar: ['turtle', 'fish', 'ninja', 'supercat', 'star', 'house']
    };

    // Close button
    $('#folderModalClose').addEventListener('click', closeFolderModal);
    $('#folderModal').addEventListener('click', (e) => { if (e.target === $('#folderModal')) closeFolderModal(); });

    $$('.profile-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        playClickSound();
        const name = btn.dataset.profile;
        const ids = profileDrawings[name] || [];
        const drawings = ids.map(id => DRAWINGS.find(d => d.id === id)).filter(Boolean);
        openFolderModal({
          id: name,
          icon: name === 'bilal' ? '🎮' : name === 'samuel' ? '👑' : '🎯',
          title: 'Espace de ' + name.charAt(0).toUpperCase() + name.slice(1),
          desc: drawings.length + ' dessins selectionnes',
          drawings
        });
      });
    });
  }

  /* -------------------------------------------------------
     Home Folders (3 collections on home page)
     ------------------------------------------------------- */
  function setupFolders() {
    const grid = $('#foldersGrid');
    if (!grid) return;

    const folders = [
      {
        id: 'animaux', icon: '🐾', title: 'Animaux',
        desc: 'Chat, chien, lion, tortue, poisson, papillon',
        headerClass: '',
        drawings: DRAWINGS.filter(d => d.categories.includes('animaux'))
      },
      {
        id: 'heros', icon: '🦸', title: 'Super-heros',
        desc: 'Heros volant, robot, ninja, super chat',
        headerClass: 'folder-heroes',
        drawings: DRAWINGS.filter(d => d.categories.includes('super-heros'))
      },
      {
        id: 'monde', icon: '🌍', title: 'Monde & Formes',
        desc: 'Maison, fusee, etoile, fleur, arc-en-ciel',
        headerClass: 'folder-world',
        drawings: DRAWINGS.filter(d =>
          d.categories.includes('enfants') || d.categories.includes('ecole') || d.categories.includes('debutant')
        ).filter((d, i, a) => a.findIndex(x => x.id === d.id) === i)
      }
    ];

    grid.textContent = '';
    folders.forEach(folder => {
      const iconEl = createEl('div', { className: 'folder-icon', textContent: folder.icon });
      const h3 = createEl('h3', null, folder.title);
      const p = createEl('p', null, folder.desc);
      const header = createEl('div', { className: 'folder-header ' + folder.headerClass }, [iconEl, h3, p]);

      const previews = createEl('div', { className: 'folder-previews' });
      folder.drawings.slice(0, 6).forEach(d => {
        previews.appendChild(createEl('div', { className: 'folder-thumb', textContent: d.thumbnail }));
      });

      const btnLibre = createEl('button', { className: 'folder-btn' }, '🎨 Coloriage');
      btnLibre.addEventListener('click', () => {
        playClickSound();
        openFolderModal({ id: folder.id, icon: folder.icon, title: folder.title, desc: folder.desc, drawings: folder.drawings });
      });

      const btnMath = createEl('button', { className: 'folder-btn folder-btn-math' }, '🧮 Maths');
      btnMath.addEventListener('click', () => {
        playClickSound();
        openFolderModal({ id: folder.id, icon: folder.icon, title: folder.title + ' — Maths', desc: 'Resous les calculs !', drawings: folder.drawings });
        // Switch to math tab
        setTimeout(() => {
          const mathTab = document.querySelector('[data-ftab="math"]');
          if (mathTab) mathTab.click();
        }, 50);
      });

      const actions = createEl('div', { className: 'folder-actions' }, [btnLibre, btnMath]);
      const card = createEl('div', { className: 'folder-card' }, [header, previews, actions]);
      grid.appendChild(card);
    });
  }

  /* -------------------------------------------------------
     Drawing Picker Modal
     ------------------------------------------------------- */
  function setupPicker() {
    const overlay = $('#pickerModal');
    const closeBtn = $('#pickerClose');
    const gridLibre = $('#pickerGridLibre');
    const gridMath = $('#pickerGridMath');
    const contentLibre = $('#pickerLibre');
    const contentMath = $('#pickerMath');
    const tabs = $$('[data-picker-tab]');
    const mathTypeChips = $$('[data-mtype]');
    const diffChips = $$('[data-diff]');

    let pickerMathType = 'addition';
    let pickerDifficulty = 'easy';

    // Open buttons (hero + CTA + navbar)
    ['btnOpenPicker', 'btnOpenPicker2', 'navOpenPicker'].forEach(id => {
      const btn = $('#' + id);
      if (btn) btn.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.classList.remove('open');
        burgerMenu.classList.remove('active');
        openPicker();
      });
    });

    // Close
    function closePicker() {
      overlay.hidden = true;
      document.body.style.overflow = '';
    }
    closeBtn.addEventListener('click', closePicker);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePicker(); });

    // Tabs
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const which = tab.dataset.pickerTab;
        contentLibre.hidden = (which !== 'libre');
        contentMath.hidden = (which !== 'math');
        if (which === 'math') populateMathGrid();
      });
    });

    // Math type chips
    mathTypeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        mathTypeChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        pickerMathType = chip.dataset.mtype;
        populateMathGrid();
      });
    });

    // Difficulty chips
    diffChips.forEach(chip => {
      chip.addEventListener('click', () => {
        diffChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        pickerDifficulty = chip.dataset.diff;
        populateMathGrid();
      });
    });

    function openPicker() {
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      populateLibreGrid();
      populateMathGrid();
    }

    function populateLibreGrid() {
      gridLibre.textContent = '';
      DRAWINGS.forEach(d => {
        const card = createPickerCard(d, () => {
          closePicker();
          openColoring(d.id, false);
        });
        gridLibre.appendChild(card);
      });
    }

    function populateMathGrid() {
      gridMath.textContent = '';
      const compatible = getMathCompatibleDrawings();
      compatible.forEach(d => {
        const card = createPickerCard(d, () => {
          closePicker();
          selectedMathType = pickerMathType;
          selectedDifficulty = pickerDifficulty;
          openColoring(d.id, true);
        });
        gridMath.appendChild(card);
      });
    }

    function createPickerCard(drawing, onClick) {
      const preview = createEl('div', { className: 'picker-card-preview' });
      preview.innerHTML = drawing.svg;
      const title = createEl('h4', null, drawing.name);
      const card = createEl('div', { className: 'picker-card' }, [preview, title]);
      card.addEventListener('click', () => { playClickSound(); onClick(); });
      return card;
    }
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
      mathVerifySection.hidden = false;

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

      // Math mode: only fill + eraser, default to fill
      setActiveTool('fill');
    } else {
      colorSection.hidden = false;
      favColorsSection.hidden = false;
      mathPaletteSection.hidden = true;
      mathVerifySection.hidden = true;

      showView('coloring');
      requestAnimationFrame(() => {
        CanvasEngine.loadDrawing(drawing.svg, false, null);
      });

      // Sync color from picker
      CanvasEngine.setColor(colorPicker.value);
      colorPreview.style.background = colorPicker.value;
    }

    // Set back button target
    coloringBack.dataset.action = 'go-home';

    // Default tool: fill for math, brush for free
    setActiveTool(isMath ? 'fill' : 'brush');
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
        // Switch back to fill tool with this color (in case eraser was active)
        CanvasEngine.setTool('fill');
        CanvasEngine.setColor(item.color);
        $$('[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === 'fill'));
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
      CanvasEngine.downloadPNG('samuelcolors-' + name + '.png');
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
    // In math mode: no brush allowed, only fill and eraser
    if (isMathColoring && tool === 'brush') tool = 'fill';

    $$('[data-tool]').forEach(b => {
      // Hide brush button in math mode
      if (isMathColoring && b.dataset.tool === 'brush') {
        b.style.display = 'none';
      } else {
        b.style.display = '';
      }
      b.classList.toggle('active', b.dataset.tool === tool);
    });

    // In math mode, eraser = "zone eraser" (fill with white via bucket)
    if (isMathColoring && tool === 'eraser') {
      CanvasEngine.setTool('fill');
      CanvasEngine.setColor('#FFFFFF');
    } else {
      CanvasEngine.setTool(tool);
    }

    brushSizeSection.hidden = (tool !== 'brush') || isMathColoring;
    eraserSizeSection.hidden = true; // no size slider needed in math
  }

  /* -------------------------------------------------------
     Favorite colors persistence
     ------------------------------------------------------- */
  function loadFavColors() {
    try {
      const saved = localStorage.getItem('samuelcolors-fav-colors');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return ['#FF0000', '#00AA00', '#0066FF', '#FFD700'];
  }

  function saveFavColors() {
    try {
      localStorage.setItem('samuelcolors-fav-colors', JSON.stringify(favColors));
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
      CanvasEngine.downloadPNG('samuelcolors-' + name + '-resultat.png');
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
      CanvasEngine.downloadPNG('samuelcolors-' + (currentDrawingId || 'coloriage') + '.png');
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
