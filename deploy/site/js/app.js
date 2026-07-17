(() => {
  // ═══════════════════════════════════════════════════════
  // Theme System
  // ═══════════════════════════════════════════════════════

  const STORAGE_KEY = 'goolang-theme';

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // Apply saved theme immediately
  setTheme(getPreferredTheme());

  window.toggleTheme = function() {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  };

  // Listen for OS theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ═══════════════════════════════════════════════════════
  // API Explorer
  // ═══════════════════════════════════════════════════════

  const API_BASE = window.location.origin + '/api';

  const endpoints = {
    'GET /health': { method: 'GET', path: '/health', body: false },
    'POST /echo': {
      method: 'POST', path: '/echo', body: true,
      placeholder: '{\n  "message": "Hello from GooLang!"\n}'
    },
    'GET /users': { method: 'GET', path: '/users', body: false },
    'POST /users': {
      method: 'POST', path: '/users', body: true,
      placeholder: '{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
    }
  };

  let currentEndpoint = 'GET /health';

  window.selectEndpoint = function(btn) {
    document.querySelectorAll('.api-endpoint').forEach(e => e.classList.remove('active'));
    btn.classList.add('active');

    const method = btn.dataset.method;
    const path = btn.dataset.path;
    currentEndpoint = method + ' ' + path;

    const ep = endpoints[currentEndpoint];
    const badge = document.getElementById('api-method-badge');
    badge.textContent = method;
    badge.className = 'api-method-badge method ' + method.toLowerCase();
    document.getElementById('api-path-display').textContent = path;

    const reqSection = document.getElementById('request-section');
    const reqBody = document.getElementById('request-body');

    if (ep.body) {
      reqSection.style.display = 'block';
      reqBody.value = ep.placeholder || '';
    } else {
      reqSection.style.display = 'none';
    }

    document.getElementById('response-output').innerHTML =
      '<span class="response-placeholder">Click "Send Request" to see the response</span>';
  };

  window.sendRequest = async function() {
    const ep = endpoints[currentEndpoint];
    const btn = document.getElementById('send-btn');
    const output = document.getElementById('response-output');

    btn.disabled = true;
    btn.textContent = 'Sending...';
    output.innerHTML = '<span style="color: var(--text-faint)">Loading...</span>';

    const opts = {
      method: ep.method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (ep.body) {
      const bodyVal = document.getElementById('request-body').value.trim();
      if (bodyVal) {
        try {
          JSON.parse(bodyVal);
          opts.body = bodyVal;
        } catch (e) {
          output.innerHTML = '<span style="color: var(--red)">Invalid JSON: ' + escapeHtml(e.message) + '</span>';
          btn.disabled = false;
          btn.textContent = 'Send Request';
          return;
        }
      }
    }

    const start = performance.now();
    try {
      const res = await fetch(API_BASE + ep.path, opts);
      const elapsed = Math.round(performance.now() - start);
      const contentType = res.headers.get('content-type') || '';

      let body;
      if (contentType.includes('application/json')) {
        body = JSON.stringify(await res.json(), null, 2);
      } else {
        body = await res.text();
      }

      const statusColor = res.ok ? 'var(--green)' : 'var(--red)';
      output.innerHTML =
        '<span style="color: ' + statusColor + '">' + res.status + ' ' + res.statusText + '</span>' +
        '  <span style="color: var(--text-faint)">(' + elapsed + 'ms)</span>\n\n' +
        escapeHtml(body);
    } catch (err) {
      output.innerHTML = '<span style="color: var(--red)">Request failed: ' + escapeHtml(err.message) + '</span>';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Request';
    }
  };

  // ═══════════════════════════════════════════════════════
  // Clipboard
  // ═══════════════════════════════════════════════════════

  window.copyCommand = function(cmd, btn) {
    navigator.clipboard.writeText(cmd).then(() => {
      showToast();
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = orig; }, 1500);
      }
    });
  };

  function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ═══════════════════════════════════════════════════════
  // Nav scroll effect
  // ═══════════════════════════════════════════════════════

  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.style.borderBottomColor = window.scrollY > 20 ? 'var(--border)' : 'transparent';
  });

  // ═══════════════════════════════════════════════════════
  // Intersection observer for fade-in
  // ═══════════════════════════════════════════════════════

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .step, .arch-layer').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
})();
