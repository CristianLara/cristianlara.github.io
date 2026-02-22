// Lightweight retro cursor follower (desktop only)
(function () {
  'use strict';

  function isTouchDevice() {
    if (typeof window === 'undefined') return true;
    return ('ontouchstart' in window) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function createRoot() {
    const root = document.createElement('div');
    root.className = 'retro-cursor-root';
    root.setAttribute('aria-hidden', 'true');
    return root;
  }

  function createCursor() {
    const c = document.createElement('div');
    c.className = 'retro-cursor';
    return c;
  }

  function spawnTrail(root, x, y, color) {
    const t = document.createElement('div');
    t.className = 'retro-trail-pixel';
    t.style.left = x + 'px';
    t.style.top = y + 'px';
    if (color) t.style.background = color;
    root.appendChild(t);
    t.addEventListener('animationend', () => t.remove());
  }

  function initCursorFollower(opts) {
    opts = opts || {};
    if (isTouchDevice() || prefersReducedMotion()) return { destroy: () => {} };

    const root = createRoot();
    document.body.appendChild(root);
    const cursor = createCursor();
    root.appendChild(cursor);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let posX = mouseX;
    let posY = mouseY;
    const ease = 0.18;
    let ticking = false;
    let lastSpawn = 0;

    function update() {
      posX += (mouseX - posX) * ease;
      posY += (mouseY - posY) * ease;
      cursor.style.transform = `translate(${posX}px, ${posY}px) translate(-50%, -50%)`;
      ticking = false;
      requestAnimationFrame(update);
    }

    // Track whether pointer is over an interactive element so we can hide
    // the JS sprite when the CSS pointer cursor is shown.
    let pointerOverInteractive = false;

    function isInteractiveElement(el) {
      if (!el) return false;
      return !!el.closest && !!el.closest('a, button, [role="button"], #sprite');
    }

    function setPointerState(over) {
      if (over === pointerOverInteractive) return;
      pointerOverInteractive = over;
      // hide/show the JS sprite root
      root.style.display = over ? 'none' : '';
    }

    function onMove(e) {
      const x = e.clientX;
      const y = e.clientY;
      mouseX = x;
      mouseY = y;
      // hide sprite when over interactive elements (CSS pointer shown)
      setPointerState(isInteractiveElement(e.target));
      const now = Date.now();
      if (now - lastSpawn > 30 && !pointerOverInteractive) {
        spawnTrail(root, x, y, getComputedStyle(document.documentElement).getPropertyValue('--retro-color') || '#0bc');
        lastSpawn = now;
      }
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true });

    // Track whether pointer is outside the window
    let pointerOutside = false;

    // Hide the JS sprite when the pointer leaves the document (relatedTarget==null)
    function onWindowMouseOut(e) {
      if (!e.relatedTarget) {
        pointerOutside = true;
        root.style.display = 'none';
      }
    }

    function onWindowMouseIn(/*e*/) {
      // show again when we get input back; actual position will be set on next mousemove
      pointerOutside = false;
      if (!pointerOverInteractive) root.style.display = '';
    }

    // Ensure reappearance when the pointer re-enters anywhere: listen for pointermove
    // and mouseover as some browsers emit different events on re-entry.
    function onAnyPointerMove(e) {
      // If pointer was outside, treat this as re-entry and show the sprite unless
      // the target is interactive (in which case CSS pointer will show instead).
      if (pointerOutside) {
        pointerOutside = false;
        setPointerState(isInteractiveElement(e.target));
        if (!pointerOverInteractive) root.style.display = '';
      }
    }

    window.addEventListener('mouseout', onWindowMouseOut, { passive: true });
    window.addEventListener('mouseenter', onWindowMouseIn, { passive: true });
    window.addEventListener('pointermove', onAnyPointerMove, { passive: true });
    window.addEventListener('mouseover', onAnyPointerMove, { passive: true });
    window.addEventListener('blur', () => { pointerOutside = true; root.style.display = 'none'; }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { pointerOutside = true; root.style.display = 'none'; }
    });

    // Keep root sized for absolute positioning
    root.style.width = '100%';
    root.style.height = '100%';

    // start RAF loop
    requestAnimationFrame(update);

    return {
      destroy() {
        window.removeEventListener('mousemove', onMove);
        cursor.remove();
        root.remove();
      }
    };
  }

  // Auto-init after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initCursorFollower());
  } else {
    initCursorFollower();
  }

  // Expose for manual control if needed
  window.initCursorFollower = initCursorFollower;

})();
