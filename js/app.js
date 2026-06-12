/* =============================================
   AGRANI CRM — APP CONTROLLER
   ============================================= */

const App = {
  state: {
    user: null,
    bizId: null,
    module: 'dashboard',
    sidebarCollapsed: false,
  },

  // =============================================
  // BOOT
  // =============================================
  init() {
    const theme = localStorage.getItem('agrani_theme');
    if (theme) document.documentElement.setAttribute('data-theme', theme);

    initData(); // seed mock data
    const savedUser = DB.get('session');
    if (savedUser) {
      // Refresh user from the live USERS array in case permissions changed
      const liveUser = USERS.find(u => u.id === savedUser.id) || savedUser;
      if (!liveUser.permissions) {
        liveUser.permissions = (typeof DEFAULT_ROLES !== 'undefined' && DEFAULT_ROLES[liveUser.role]) ? DEFAULT_ROLES[liveUser.role] : [];
      }
      this.state.user = liveUser;
      DB.set('session', liveUser);
      
      let lastBiz = DB.get('lastBiz') || BUSINESSES[0].id;
      // Security check: Make sure they are allowed to see this business
      const allowed = liveUser.allowedBusinesses || [];
      if (!allowed.includes('all') && !allowed.includes(lastBiz)) {
        lastBiz = allowed[0] || BUSINESSES[0].id;
      }
      this.state.bizId = lastBiz;
      this.state.module = 'dashboard';
      this.renderApp();
    } else {
      this.renderLogin();
    }
  },

  // =============================================
  // AUTH
  // =============================================
  renderLogin() {
    document.getElementById('app').innerHTML = `
<div class="login-screen">
  <div class="login-grid-lines"></div>
  <div class="login-particles" id="particles"></div>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-logo">
        <div class="login-logo-icon">🏢</div>
        <h1>Agrani CRM</h1>
        <p>Multi-Business Intelligence Platform</p>
      </div>
      <div class="login-divider"><span>Sign in to your account</span></div>
      <form class="login-form" onsubmit="App.login(event)">
        <div class="form-group">
          <label>Username</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input type="text" id="loginUser" placeholder="Enter your username" autocomplete="username" required>
          </div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input type="password" id="loginPass" placeholder="Enter your password" autocomplete="current-password" required>
          </div>
        </div>
        <button type="submit" class="btn-login">Sign In →</button>
        <div class="login-error" id="loginError">Invalid username or password. Please try again.</div>
      </form>
      <div class="login-hint">
        Sign in with your assigned credentials. Contact your administrator if you need access.
      </div>
    </div>
  </div>
</div>`;
    this._spawnParticles();
  },

  _spawnParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 8 + 4;
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random()*100}%;
        background:${['#6366F1','#8B5CF6','#06B6D4','#10B981'][Math.floor(Math.random()*4)]};
        animation-duration:${Math.random()*15+10}s;
        animation-delay:${Math.random()*10}s;
      `;
      container.appendChild(p);
    }
  },

  login(e) {
    e.preventDefault();
    const username = document.getElementById('loginUser').value.trim().toLowerCase();
    const password = document.getElementById('loginPass').value;
    const user = USERS.find(u => u.username.toLowerCase() === username && u.password === password);
    if (user) {
      // Ensure all required fields are present with safe fallbacks
      if (!user.permissions) user.permissions = DEFAULT_ROLES[user.role] || [];
      if (!user.allowedBusinesses) user.allowedBusinesses = ['all'];
      // Save full user object to session
      DB.set('session', user);
      this.state.user = user;
      // Pick a valid business for this user
      let lastBiz = DB.get('lastBiz') || BUSINESSES[0].id;
      const allowed = user.allowedBusinesses || [];
      if (!allowed.includes('all') && !allowed.includes(lastBiz)) {
        lastBiz = allowed[0] || BUSINESSES[0].id;
      }
      this.state.bizId = lastBiz;
      this.state.module = 'dashboard';
      this.renderApp();
    } else {
      const err = document.getElementById('loginError');
      err.classList.add('show');
      setTimeout(() => err.classList.remove('show'), 3500);
    }
  },

  logout() {
    DB.del('session');
    DB.del('lastBiz');
    this.state.user = null;
    this.state.bizId = null;
    this.state.module = 'dashboard';
    this.renderLogin();
  },

  // =============================================
  // RENDER APP
  // =============================================
  renderApp() {
    document.getElementById('app').innerHTML = `
<div class="app-shell">
  ${this._renderSidebar()}
  <div class="main-content ${this.state.sidebarCollapsed ? 'sidebar-collapsed' : ''}" id="mainContent">
    ${this._renderTopbar()}
    <div id="moduleContent"></div>
  </div>
</div>`;
    this._renderModule();
  },

  // =============================================
  // SIDEBAR
  // =============================================
  _renderSidebar() {
    const biz = BUSINESSES.find(b => b.id === this.state.bizId) || BUSINESSES[0];
    const type = biz.type;
    const industryLabel = INDUSTRY_LABELS[type] || type;
    const industryNav = INDUSTRY_NAV[type] || [];

    // Group businesses by type, filtered by user permissions
    const groups = {};
    const inactiveList = [];
    const allowed = this.state.user.allowedBusinesses || [];
    const isAll = allowed.includes('all');
    
    BUSINESSES.forEach(b => {
      if (isAll || allowed.includes(b.id)) {
        if (b.active === false) {
          inactiveList.push(b);
        } else {
          if (!groups[b.type]) groups[b.type] = [];
          groups[b.type].push(b);
        }
      }
    });

    return `
<div class="sidebar ${this.state.sidebarCollapsed ? 'collapsed' : ''}" id="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-logo">🏢</div>
    <div class="sidebar-brand">
      <h2>Agrani CRM</h2>
      <p>Multi-Business</p>
    </div>
    <button class="collapse-btn" onclick="App.toggleSidebar()" title="Toggle Sidebar">
      ${this.state.sidebarCollapsed ? '→' : '←'}
    </button>
  </div>

  <div class="biz-switcher-wrap" id="bizSwitcherWrap">
    <button class="biz-switcher-btn" id="bizSwitcherBtn" onclick="App.toggleBizDropdown()">
      <div class="biz-icon-badge" style="background:${biz.color}22">${biz.icon}</div>
      <div class="biz-info">
        <div class="bn">${escHtml(biz.name)}</div>
        <div class="bt">${INDUSTRY_LABELS[biz.type]?.split(' ').slice(1).join(' ') || biz.type}</div>
      </div>
      <span class="biz-chevron">▼</span>
    </button>

    <div class="biz-dropdown" id="bizDropdown">
      <div class="biz-search-wrap">
        <input class="biz-search-input" id="bizSearchInput" placeholder="🔍 Search businesses..." oninput="App.filterBizDropdown(this.value)" onclick="event.stopPropagation()">
      </div>
      <div id="bizDropdownList">
        ${Object.entries(groups).map(([type, bizList]) => `
          <div class="biz-dropdown-group" data-group="${type}">
            <div class="biz-group-label">${INDUSTRY_LABELS[type] || type}</div>
            ${bizList.map(b => `
              <div class="biz-item ${b.id === this.state.bizId ? 'active' : ''}" onclick="App.switchBiz('${b.id}')" data-bizname="${escHtml(b.name.toLowerCase())}">
                <div class="biz-item-dot" style="background:${b.color}"></div>
                <span class="biz-item-name">${escHtml(b.name)}</span>
                ${b.id === this.state.bizId ? '<span class="biz-item-check">✓</span>' : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}
        ${inactiveList.length > 0 ? `
          <div class="biz-dropdown-group" data-group="inactive">
            <div class="biz-group-label" style="opacity:0.6">Inactive Businesses</div>
            ${inactiveList.map(b => `
              <div class="biz-item ${b.id === this.state.bizId ? 'active' : ''}" onclick="App.switchBiz('${b.id}')" data-bizname="${escHtml(b.name.toLowerCase())}" style="opacity:0.6">
                <div class="biz-item-dot" style="background:${b.color}; filter:grayscale(1)"></div>
                <span class="biz-item-name">${escHtml(b.name)} (Inactive)</span>
                ${b.id === this.state.bizId ? '<span class="biz-item-check">✓</span>' : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
      ${(this.state.user.permissions || []).includes('manage_businesses') ? `
      <div class="biz-dropdown-group" style="margin-top:8px; border-top:1px solid var(--border); padding-top:8px">
        <div class="biz-item" onclick="App.openModal('add-business')" style="color:var(--accent); font-weight:600">
          <div class="biz-item-dot" style="background:transparent; font-size:16px">+</div>
          <span class="biz-item-name">Add New Business</span>
        </div>
      </div>` : ''}
    </div>
  </div>

  <nav class="sidebar-nav">
    <div class="nav-section-label">Core</div>
    ${BASE_NAV.map(item => `
      <div class="nav-item ${this.state.module === item.id ? 'active' : ''}" onclick="App.nav('${item.id}')" id="nav-${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
        ${item.id === 'tasks' ? `<span class="nav-badge" id="taskBadge">${DB.bget(this.state.bizId,'tasks').filter(t=>!t.done && (!t.assignedTo || t.assignedTo===this.state.user.id)).length}</span>` : ''}
      </div>
    `).join('')}

    ${industryNav.length > 0 ? `
      <div class="nav-divider"></div>
      <div class="nav-section-label">${industryLabel}</div>
      ${industryNav.map(item => `
        <div class="nav-item ${this.state.module === item.id ? 'active' : ''}" onclick="App.nav('${item.id}')" id="nav-${item.id}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </div>
      `).join('')}
    ` : ''}

    ${biz.addons && biz.addons.length > 0 ? `
      <div class="nav-divider"></div>
      <div class="nav-section-label">Add-ons</div>
      ${biz.addons.map(addonId => {
        const a = ADDON_REGISTRY[addonId];
        if(!a) return '';
        return `
        <div class="nav-item ${this.state.module === addonId ? 'active' : ''}" onclick="App.nav('${addonId}')" id="nav-${addonId}">
          <span class="nav-icon">${a.icon}</span>
          <span class="nav-label">${a.label}</span>
        </div>`;
      }).join('')}
    ` : ''}

    ${biz.crossSell ? `
      <div class="nav-divider"></div>
      <div class="nav-section-label">Global Network</div>
      <div class="nav-item ${this.state.module === 'cross_sell' ? 'active' : ''}" onclick="App.nav('cross_sell')" id="nav-cross_sell">
        <span class="nav-icon">🌐</span>
        <span class="nav-label" style="color:var(--accent);font-weight:600">Cross-Sell Network</span>
      </div>
    ` : ''}

    <div class="nav-divider"></div>
    ${BOTTOM_NAV.filter(item => item.id !== 'team' || (this.state.user.permissions || []).includes('manage_team')).map(item => `
      <div class="nav-item ${this.state.module === item.id ? 'active' : ''}" onclick="App.nav('${item.id}')" id="nav-${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
      </div>
    `).join('')}
  </nav>

  <div class="sidebar-footer">
    <div class="user-card">
      <div class="user-avatar" style="background:${this.state.user?.color || '#6366F1'}">${this.state.user?.avatar || 'A'}</div>
      <div class="user-info">
        <div class="un">${escHtml(this.state.user?.name || 'Admin')}</div>
        <div class="ur">${escHtml(this.state.user?.role || '')}</div>
      </div>
      <button class="logout-btn" onclick="App.logout()" title="Logout">⎋</button>
    </div>
  </div>
</div>`;
  },

  _renderTopbar() {
    const biz = BUSINESSES.find(b => b.id === this.state.bizId) || BUSINESSES[0];
    const allNav = [...BASE_NAV, ...(INDUSTRY_NAV[biz.type] || []), ...BOTTOM_NAV];
    
    // Check if it's an addon or cross_sell
    let modLabel = this.state.module;
    if (this.state.module === 'cross_sell') modLabel = 'Cross-Sell Network';
    else if (ADDON_REGISTRY[this.state.module]) modLabel = ADDON_REGISTRY[this.state.module].label;
    else {
      const currentNav = allNav.find(n => n.id === this.state.module);
      if (currentNav) modLabel = currentNav.label;
    }

    return `
<div class="topbar">
  <div class="topbar-left">
    <span style="font-size:16px">${biz.icon}</span>
    <span class="topbar-biz">${escHtml(biz.name)}</span>
    <span class="topbar-sep">/</span>
    <span class="topbar-module">${escHtml(modLabel)}</span>
  </div>
  <div class="topbar-search">
    <span class="search-icon">🔍</span>
    <input type="text" placeholder="Search across CRM..." oninput="App.globalSearch(this.value)" onfocus="App.globalSearch(this.value)" onblur="setTimeout(()=>document.getElementById('globalSearchDropdown')?.classList.remove('active'),200)">
    <div class="global-search-dropdown" id="globalSearchDropdown"></div>
  </div>
  <div class="topbar-actions">
    <button class="topbar-btn" title="Submit Timesheet" onclick="App.openModal('submit-eod')" style="background:var(--success);color:white;border:none">⏱️ EOD</button>
    <button class="topbar-btn" title="Toggle Theme" onclick="App.toggleTheme()">
      ${document.documentElement.getAttribute('data-theme') === 'light' ? '🌙' : '☀️'}
    </button>
    <button class="topbar-btn" title="Notifications" onclick="App.toast('3 new notifications','info')">
      🔔<span class="notif-dot"></span>
    </button>
    <button class="topbar-btn" title="Quick Add" onclick="App.openModal('add-contact','${biz.id}')">➕</button>
    <button class="topbar-btn" title="Refresh" onclick="App._renderModule()">🔄</button>
    <div class="topbar-user-pill" title="Logged in as ${escHtml(this.state.user.name)} (${escHtml(this.state.user.role)})" onclick="App.logout()" style="cursor:pointer">
      <div class="user-avatar" style="width:28px;height:28px;font-size:12px;border-radius:8px;background:${this.state.user.color || '#6366F1'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">${escHtml(this.state.user.avatar || this.state.user.name[0])}</div>
      <span style="font-size:12px;font-weight:500;color:var(--text-secondary)">${escHtml(this.state.user.name.split(' ')[0])}</span>
    </div>
  </div>
</div>`;
  },

  toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const newTheme = isLight ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('agrani_theme', newTheme);
    this.renderApp();
  },

  exportCSV(type) {
    const bizId = this.state.bizId;
    let data = [];
    let headers = [];
    let filename = '';

    if (type === 'contacts') {
      const contacts = DB.bget(bizId, 'contacts');
      headers = ['Name', 'Phone', 'Email', 'City', 'Source', 'Status', 'Company', 'Value'];
      data = contacts.map(c => [c.name, c.phone, c.email||'', c.city||'', c.source||'', c.status||'', c.company||'', c.value||0]);
      filename = `contacts_${bizId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'invoices') {
      const invoices = DB.bget(bizId, 'invoices');
      headers = ['Invoice Number', 'Client', 'Amount', 'Status', 'Due Date', 'Payment Date', 'Payment Medium'];
      data = invoices.map(i => [i.number, i.client, i.amount, i.status, i.dueDate||'', i.payDate||'', i.payMedium||'']);
      filename = `invoices_${bizId}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      return;
    }

    if (data.length === 0) return this.toast('No data to export', 'error');

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\n';
    data.forEach(row => {
      const safeRow = row.map(v => `"${String(v).replace(/"/g, '""')}"`);
      csvContent += safeRow.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    this.toast('Export downloaded', 'success');
  },

  globalSearch(query) {
    const dropdown = document.getElementById('globalSearchDropdown');
    if (!dropdown) return;
    if (!query || query.length < 2) {
      dropdown.classList.remove('active');
      return;
    }

    const bizId = this.state.bizId;
    query = query.toLowerCase();
    
    // Search Contacts
    const contacts = DB.bget(bizId, 'contacts').filter(c => c.name.toLowerCase().includes(query) || (c.email||'').toLowerCase().includes(query));
    // Search Deals
    const deals = DB.bget(bizId, 'deals').filter(d => d.title.toLowerCase().includes(query));
    // Search Invoices
    const invoices = DB.bget(bizId, 'invoices').filter(i => (i.number||'').toLowerCase().includes(query) || (i.client||'').toLowerCase().includes(query));

    let html = '';
    
    if (contacts.length > 0) {
      html += `<div class="search-res-group">Contacts</div>`;
      contacts.slice(0,3).forEach(c => {
        html += `<div class="search-res-item" onmousedown="App.nav('contacts')">
          <div class="search-res-title">${escHtml(c.name)}</div>
          <div class="search-res-sub">Phone: ${escHtml(c.phone)}</div>
        </div>`;
      });
    }

    if (deals.length > 0) {
      html += `<div class="search-res-group">Deals</div>`;
      deals.slice(0,3).forEach(d => {
        html += `<div class="search-res-item" onmousedown="App.nav('deals')">
          <div class="search-res-title">${escHtml(d.title)}</div>
          <div class="search-res-sub">Value: ₹${d.value.toLocaleString('en-IN')}</div>
        </div>`;
      });
    }

    if (invoices.length > 0) {
      html += `<div class="search-res-group">Invoices</div>`;
      invoices.slice(0,3).forEach(i => {
        html += `<div class="search-res-item" onmousedown="App.nav('invoices')">
          <div class="search-res-title">${escHtml(i.number)} - ${escHtml(i.client)}</div>
          <div class="search-res-sub">Amount: ${fmtINR(i.amount)}</div>
        </div>`;
      });
    }

    if (!html) {
      html = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px">No results found for "${escHtml(query)}"</div>`;
    }

    dropdown.innerHTML = html;
    dropdown.classList.add('active');
  },

  // =============================================
  // NAVIGATION
  // =============================================
  nav(moduleId) {
    if (this.state.user.role !== 'Admin') {
      const perms = this.state.user.permissions || [];
      if (moduleId === 'reports' && !perms.includes('view_reports')) {
        this.toast('Access Denied: You do not have permission to view reports.', 'error');
        return;
      }
      if (['invoices', 'deals'].includes(moduleId) && !perms.includes('view_financials')) {
        this.toast('Access Denied: You do not have permission to view financials.', 'error');
        return;
      }
      if (moduleId === 'team' && !perms.includes('manage_team')) {
        this.toast('Access Denied: You do not have permission to manage the team.', 'error');
        return;
      }
    }

    this.state.module = moduleId;
    // Update sidebar active states
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navEl = document.getElementById('nav-' + moduleId);
    if (navEl) navEl.classList.add('active');

    // Update topbar breadcrumb
    const biz = BUSINESSES.find(b => b.id === this.state.bizId) || BUSINESSES[0];
    const allNav = [...BASE_NAV, ...(INDUSTRY_NAV[biz.type] || []), ...BOTTOM_NAV];
    let modLabel = moduleId;
    if (moduleId === 'cross_sell') modLabel = 'Cross-Sell Network';
    else if (ADDON_REGISTRY[moduleId]) modLabel = ADDON_REGISTRY[moduleId].label;
    else {
      const currentNav = allNav.find(n => n.id === moduleId);
      if (currentNav) modLabel = currentNav.label;
    }
    document.querySelector('.topbar-module') && (document.querySelector('.topbar-module').textContent = modLabel);

    this._renderModule();
  },

  _renderModule() {
    const biz = BUSINESSES.find(b => b.id === this.state.bizId) || BUSINESSES[0];
    const mod = Modules[this.state.module];
    const content = document.getElementById('moduleContent');
    if (!content) return;

    if (mod) {
      content.innerHTML = mod.render(biz);
      // Destroy old charts before init
      Chart.instances && Object.values(Chart.instances).forEach(c => { try { c.destroy(); } catch(e) {} });
      setTimeout(() => { try { mod.init(biz); } catch(e) { console.warn('Module init error:', e); } }, 50);
    } else {
      content.innerHTML = `<div class="page-content"><div class="empty-state"><div class="empty-state-icon">🚧</div><h3>Building Add-on</h3><p>The "${this.state.module}" module interface is under development.</p></div></div>`;
    }

    // Scroll to top
    document.querySelector('.main-content')?.scrollTo(0, 0);
  },

  // =============================================
  // BUSINESS SWITCHER
  // =============================================
  toggleBizDropdown() {
    const btn = document.getElementById('bizSwitcherBtn');
    const dd  = document.getElementById('bizDropdown');
    if (!btn || !dd) return;
    const isOpen = dd.classList.contains('open');
    btn.classList.toggle('open', !isOpen);
    dd.classList.toggle('open', !isOpen);
    if (!isOpen) {
      setTimeout(() => document.addEventListener('click', this._closeBizDropdown.bind(this), { once: true }), 10);
    }
  },

  _closeBizDropdown(e) {
    const wrap = document.getElementById('bizSwitcherWrap');
    if (wrap && !wrap.contains(e.target)) {
      document.getElementById('bizSwitcherBtn')?.classList.remove('open');
      document.getElementById('bizDropdown')?.classList.remove('open');
    }
  },

  switchBiz(bizId) {
    this.state.bizId = bizId;
    this.state.module = 'dashboard';
    DB.set('lastBiz', bizId);
    this.renderApp();
    this.toast('Switched to ' + (BUSINESSES.find(b => b.id === bizId)?.name || bizId), 'success');
  },

  filterBizDropdown(query) {
    const q = (query || '').toLowerCase().trim();
    const listEl = document.getElementById('bizDropdownList');
    if (!listEl) return;
    listEl.querySelectorAll('.biz-item').forEach(item => {
      const name = item.dataset.bizname || '';
      item.style.display = (!q || name.includes(q)) ? '' : 'none';
    });
    listEl.querySelectorAll('.biz-dropdown-group').forEach(group => {
      const visible = [...group.querySelectorAll('.biz-item')].some(i => i.style.display !== 'none');
      group.style.display = visible ? '' : 'none';
    });
  },

  // =============================================
  // SIDEBAR COLLAPSE
  // =============================================
  toggleSidebar() {
    this.state.sidebarCollapsed = !this.state.sidebarCollapsed;
    const sidebar = document.getElementById('sidebar');
    const main    = document.getElementById('mainContent');
    const btn     = document.querySelector('.collapse-btn');
    if (sidebar) sidebar.classList.toggle('collapsed', this.state.sidebarCollapsed);
    if (main)    main.classList.toggle('sidebar-collapsed', this.state.sidebarCollapsed);
    if (btn)     btn.textContent = this.state.sidebarCollapsed ? '→' : '←';
  },

  // =============================================
  // CONTACTS CRUD
  // =============================================
  filterContacts(bizId, search = '', status = '', source = '') {
    let contacts = DB.bget(bizId, 'contacts');
    if (search) {
      const q = search.toLowerCase();
      contacts = contacts.filter(c =>
        (c.name||'').toLowerCase().includes(q) ||
        (c.email||'').toLowerCase().includes(q) ||
        (c.city||'').toLowerCase().includes(q) ||
        (c.phone||'').includes(q)
      );
    }
    if (status) contacts = contacts.filter(c => c.status === status);
    if (source) contacts = contacts.filter(c => c.source === source);

    const tbody = document.getElementById('contactsBody');
    const count = document.getElementById('contactCount');
    if (tbody) tbody.innerHTML = contacts.map(c => Modules.contacts._row(c)).join('');
    if (count) count.textContent = contacts.length + ' contacts';
  },

  viewContact(id, bizId) {
    const contact = DB.bget(bizId, 'contacts').find(c => c.id === id);
    if (!contact) return;
    
    // Create a mock doc list if it doesn't exist
    const docs = DB.bget(bizId, 'contact_docs_'+id) || [];
    
    const html = `
<div class="modal-header">
  <span class="modal-title">👥 ${escHtml(contact.name)} — Profile & Documents</span>
  <button class="modal-close" onclick="App.closeModal()">✕</button>
</div>
<div class="modal-body">
  <div style="display:flex;gap:16px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border)">
    <div class="avatar" style="width:64px;height:64px;font-size:24px;background:${randomColor(contact.name)}">${initials(contact.name)}</div>
    <div>
      <div style="font-size:18px;font-weight:700;color:var(--text-primary)">${escHtml(contact.name)}</div>
      <div style="font-size:13px;color:var(--text-muted)">📧 ${escHtml(contact.email||'N/A')} &nbsp;•&nbsp; 📞 ${escHtml(contact.phone||'N/A')}</div>
      <div style="font-size:13px;color:var(--text-muted);margin-top:4px">🏢 ${escHtml(contact.company||'No Company')} &nbsp;•&nbsp; 📍 ${escHtml(contact.city||'N/A')}</div>
    </div>
  </div>

  <h3 style="font-size:14px;color:var(--text-primary);margin-bottom:12px">Document Vault</h3>
  <div style="background:var(--bg-card);border:1px dashed var(--border);border-radius:var(--radius-md);padding:24px;text-align:center;cursor:pointer;margin-bottom:16px" onclick="App.simulateUpload('${id}','${bizId}')">
    <div style="font-size:24px;margin-bottom:8px">📤</div>
    <div style="font-size:13px;font-weight:600;color:var(--text-primary)">Click to upload customer documents</div>
    <div style="font-size:11px;color:var(--text-muted)">PDF, JPG, PNG allowed (Max 5MB)</div>
  </div>

  <div id="contactDocList_${id}">
    ${docs.length === 0 ? `<div style="font-size:12px;color:var(--text-muted);text-align:center">No documents uploaded yet.</div>` : 
      docs.map(d=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:8px">
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--text-primary)">📄 ${escHtml(d.name)}</div>
          <div style="font-size:11px;color:var(--text-muted)">Uploaded by ${d.by} on ${fmtDate(d.date)}</div>
        </div>
        <button class="btn btn-icon btn-sm" onclick="App.toast('Downloading...','success')">⬇️</button>
      </div>`).join('')}
  </div>
</div>
<div class="modal-footer">
  <button class="btn btn-secondary" onclick="App.closeModal()">Close</button>
</div>`;
    this.openModalHTML(html);
  },

  simulateUpload(cid, bizId) {
    let docs = DB.bget(bizId, 'contact_docs_'+cid);
    docs.push({
      id: uid(),
      name: ['ID_Proof.pdf', 'Address_Verification.jpg', 'Contract_Signed.pdf', 'Tax_Document.pdf'][Math.floor(Math.random()*4)],
      by: this.state.user.name,
      date: new Date().toISOString()
    });
    DB.bset(bizId, 'contact_docs_'+cid, docs);
    this.toast('Document uploaded to vault!', 'success');
    this.viewContact(cid, bizId); // re-render
  },

  editContact(id, bizId) {
    const c = DB.bget(bizId, 'contacts').find(x => x.id === id);
    if (!c) return;
    const sColors = {new:'info',qualified:'primary',proposal:'warning','closed-won':'success','closed-lost':'danger'};
    this.openModalHTML(`
<div class="modal-header"><span class="modal-title">✏️ Edit Contact</span><button class="modal-close" onclick="App.closeModal()">✕</button></div>
<div class="modal-body">
  <div class="form-row">
    <div class="form-field"><label class="form-label">Full Name</label><input class="form-input" id="ec_name" value="${escHtml(c.name||'')}"></div>
    <div class="form-field"><label class="form-label">Phone</label><input class="form-input" id="ec_phone" value="${escHtml(c.phone||'')}"></div>
  </div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Email</label><input class="form-input" type="email" id="ec_email" value="${escHtml(c.email||'')}"></div>
    <div class="form-field"><label class="form-label">City</label><select class="form-select" id="ec_city">${CITIES.map(city=>`<option ${city===c.city?'selected':''}>${city}</option>`).join('')}</select></div>
  </div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Status</label><select class="form-select" id="ec_status">
      ${['new','qualifying','proposal','ongoing','closed-won','closed-lost'].map(s=>`<option value="${s}" ${s===c.status?'selected':''}>${s}</option>`).join('')}
    </select></div>
    <div class="form-field"><label class="form-label">Value (₹)</label><input class="form-input" type="number" id="ec_value" value="${c.value||0}"></div>
  </div>
  <div class="form-field"><label class="form-label">Company</label><input class="form-input" id="ec_company" value="${escHtml(c.company||'')}"></div>
  <div class="form-field"><label class="form-label">Notes</label><textarea class="form-textarea" id="ec_note">${escHtml(c.note||'')}</textarea></div>
</div>
<div class="modal-footer">
  <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
  <button class="btn btn-primary" onclick="App.saveEditContact('${id}','${bizId}')">Save Changes</button>
</div>`);
  },

  saveEditContact(id, bizId) {
    DB.bupdate(bizId, 'contacts', id, {
      name:    document.getElementById('ec_name')?.value?.trim(),
      phone:   document.getElementById('ec_phone')?.value?.trim(),
      email:   document.getElementById('ec_email')?.value,
      city:    document.getElementById('ec_city')?.value,
      status:  document.getElementById('ec_status')?.value,
      value:   parseInt(document.getElementById('ec_value')?.value) || 0,
      company: document.getElementById('ec_company')?.value,
      note:    document.getElementById('ec_note')?.value,
    });
    this.closeModal();
    this._renderModule();
    this.toast('Contact updated!', 'success');
  },

  delContact(id) {
    if (!confirm('Delete this contact?')) return;
    const biz = this.state.bizId;
    DB.bdel(biz, 'contacts', id);
    this._renderModule();
    this.toast('Contact deleted', 'success');
  },

  exportContacts(bizId) {
    const contacts = DB.bget(bizId, 'contacts');
    const csv = ['Name,Email,Phone,City,Source,Status,Value']
      .concat(contacts.map(c => [c.name,c.email,c.phone,c.city,c.source,c.status,c.value].join(',')))
      .join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `contacts_${bizId}.csv`;
    a.click();
    this.toast('Exported ' + contacts.length + ' contacts', 'success');
  },

  contactViewTab(view) {
    document.getElementById('tabKanban').classList.toggle('active', view === 'kanban');
    document.getElementById('tabList').classList.toggle('active', view === 'list');
    document.getElementById('contactsKanban').classList.toggle('hidden', view !== 'kanban');
    document.getElementById('contactsList').classList.toggle('hidden', view !== 'list');
  },

  quickStageContact(id, bizId, stage) {
    DB.bupdate(bizId, 'contacts', id, { status: stage });
    this._renderModule();
    this.toast(`Contact moved to ${stage}`, 'success');
  },

  openModalAddLeadStage(bizId, stage) {
    this.openModal('add-contact', bizId, stage);
    setTimeout(() => {
      const statusSel = document.getElementById('cf_status');
      if (statusSel) statusSel.value = stage;
    }, 50);
  },

  // =============================================
  // DEALS
  // =============================================
  viewDeal(id, bizId) {
    const deal = DB.bget(bizId, 'deals').find(d => d.id === id);
    if (!deal) return;
    const stages = ['lead','proposal','negotiation','won','lost'];
    const stageColors = {lead:'#6366F1',proposal:'#F59E0B',negotiation:'#06B6D4',won:'#10B981',lost:'#EF4444'};
    this.openModalHTML(`
<div class="modal-header">
  <span class="modal-title">💼 ${escHtml(deal.title)}</span>
  <button class="modal-close" onclick="App.closeModal()">✕</button>
</div>
<div class="modal-body">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
    <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Deal Value</div>
      <div style="font-size:22px;font-weight:800;color:var(--success)">${fmtINR(deal.value)}</div>
    </div>
    <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Contact</div>
      <div style="font-size:15px;font-weight:700;color:var(--text-primary)">${escHtml(deal.contact||'—')}</div>
    </div>
  </div>
  <div style="margin-bottom:20px">
    <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Move to Stage</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${stages.map(s => `<button onclick="App.moveDealStage('${id}','${bizId}','${s}')" style="padding:6px 14px;border-radius:20px;border:2px solid ${stageColors[s]};background:${deal.stage===s?stageColors[s]+'33':'transparent'};color:${stageColors[s]};font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s">${s.charAt(0).toUpperCase()+s.slice(1)}</button>`).join('')}
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
    <span style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Expected Close</span>
    <span style="font-size:13px;font-weight:600;color:var(--text-primary)">${fmtDate(deal.expectedClose)}</span>
  </div>
  <div style="padding:10px 0">
    <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Notes</div>
    <div style="font-size:13px;color:var(--text-secondary);line-height:1.6">${escHtml(deal.note||'No notes added.')}</div>
  </div>
</div>
<div class="modal-footer">
  <button class="btn btn-danger" onclick="App.delDeal('${id}','${bizId}');App.closeModal()">Delete Deal</button>
  <button class="btn btn-primary" onclick="App.closeModal()">Close</button>
</div>`);
  },

  moveDealStage(id, bizId, newStage) {
    DB.bupdate(bizId, 'deals', id, { stage: newStage });
    this.closeModal();
    this._renderModule();
    this.toast(`Deal moved to "${newStage}"!`, 'success');
  },

  delDeal(id, bizId) {
    DB.bdel(bizId, 'deals', id);
    this._renderModule();
    this.toast('Deal removed', 'success');
  },

  // =============================================
  // TASKS
  // =============================================
  toggleTask(id, bizId, done) {
    DB.bupdate(bizId, 'tasks', id, { done });
    const badge = document.getElementById('taskBadge');
    if (badge) badge.textContent = DB.bget(bizId, 'tasks').filter(t => !t.done).length;
  },

  delTask(id, bizId) {
    DB.bdel(bizId, 'tasks', id);
    this._renderModule();
    this.toast('Task removed', 'success');
  },

  taskTab(btn, tab) {
    document.querySelectorAll('#taskTabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('taskListOpen')?.classList.toggle('hidden', tab !== 'open');
    document.getElementById('taskListDone')?.classList.toggle('hidden', tab !== 'done');
  },

  // =============================================
  // INVOICES & QUOTES
  // =============================================
  billingViewTab(view) {
    document.getElementById('tabInv').classList.toggle('active', view === 'inv');
    document.getElementById('tabQuotes').classList.toggle('active', view === 'quotes');
    document.getElementById('viewInvoices').classList.toggle('hidden', view !== 'inv');
    document.getElementById('viewQuotes').classList.toggle('hidden', view !== 'quotes');
  },

  recordPayment(id, bizId) {
    const inv = DB.bget(bizId, 'invoices').find(x => x.id === id);
    if (!inv) return;
    this.openModalHTML(`
<div class="modal-header"><span class="modal-title">💰 Record Payment</span><button class="modal-close" onclick="App.closeModal()">✕</button></div>
<div class="modal-body">
  <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);padding:12px;border-radius:8px;margin-bottom:16px;display:flex;justify-content:space-between">
    <span style="font-size:13px;font-weight:600;color:var(--text-primary)">Amount Due</span>
    <span style="font-size:16px;font-weight:800;color:var(--success)">${fmtINR(inv.amount)}</span>
  </div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Payment Date</label><input type="date" class="form-input" id="pay_date" value="${new Date().toISOString().split('T')[0]}"></div>
    <div class="form-field"><label class="form-label">Medium</label><select class="form-select" id="pay_medium">
      <option>Bank Transfer (NEFT/RTGS)</option><option>UPI / QR Code</option><option>Cash</option><option>Cheque</option><option>Credit Card / Gateway</option>
    </select></div>
  </div>
  <div class="form-field"><label class="form-label">Notes (Optional)</label><textarea class="form-textarea" id="pay_notes" placeholder="Transaction ID, Cheque number, etc."></textarea></div>
</div>
<div class="modal-footer">
  <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
  <button class="btn btn-success" onclick="App.savePayment('${id}','${bizId}')">Confirm Payment</button>
</div>`);
  },

  savePayment(id, bizId) {
    DB.bupdate(bizId, 'invoices', id, { 
      status: 'paid',
      payDate: document.getElementById('pay_date')?.value,
      payMedium: document.getElementById('pay_medium')?.value,
      payNotes: document.getElementById('pay_notes')?.value
    });
    DB.logActivity(bizId, 'Recorded payment', 'Invoice');
    this.closeModal();
    this._renderModule();
    this.toast('Payment recorded successfully ✓', 'success');
  },

  viewInvoice(id, bizId) {
    this.toast('Invoice PDF generator coming soon', 'info');
  },

  delInvoice(id, bizId) {
    if (!confirm('Delete this invoice?')) return;
    DB.bdel(bizId, 'invoices', id);
    this._renderModule();
    this.toast('Invoice deleted', 'success');
  },

  viewQuote(id, bizId) {
    this.toast('Quotation viewer coming soon', 'info');
  },

  convertQuoteToInvoice(id, bizId) {
    const q = DB.bget(bizId, 'quotes').find(x => x.id === id);
    if (!q) return;
    const inv = DB.bpush(bizId, 'invoices', {
      number: q.number.replace('QT','INV'),
      client: q.client,
      amount: q.amount,
      status: 'pending',
      dueDate: new Date(Date.now()+7*86400000).toISOString().split('T')[0],
    });
    DB.bupdate(bizId, 'quotes', id, { status: 'accepted' });
    DB.logActivity(bizId, 'Converted Quote to Invoice', inv.number);
    this._renderModule();
    this.billingViewTab('inv');
    this.toast(`Quotation converted to Invoice ${inv.number}`, 'success');
  },

  delQuote(id, bizId) {
    if (!confirm('Delete this quotation?')) return;
    DB.bdel(bizId, 'quotes', id);
    this._renderModule();
    this.toast('Quotation deleted', 'success');
  },

  // =============================================
  // TICKETS
  // =============================================
  viewTicket(id, bizId) {
    this.toast('Ticket thread viewer coming soon', 'info');
  },

  closeTicket(id, bizId) {
    DB.bupdate(bizId, 'tickets', id, { status: 'Resolved' });
    this._renderModule();
    this.toast('Ticket resolved ✓', 'success');
  },

  delTicket(id, bizId) {
    if (!confirm('Delete this ticket?')) return;
    DB.bdel(bizId, 'tickets', id);
    this._renderModule();
    this.toast('Ticket deleted', 'success');
  },

  // =============================================
  // RATE CALCULATOR
  // =============================================
  calcRate() {
    this.toast('Estimate generated! ₹23,110 for selected move.', 'success');
  },

  // =============================================
  // MODALS
  // =============================================
  openModal(type, bizId, extra) {
    let html = '';
    if (type === 'add-contact') html = this._contactForm(bizId);
    else if (type === 'add-deal') html = this._dealForm(bizId, extra);
    else if (type === 'add-task') html = this._taskForm(bizId);
    else if (type === 'add-invoice') html = this._invoiceForm(bizId);
    else if (type === 'add-business') html = this._businessForm();
    else if (type === 'add-employee') html = this._employeeForm();
    else if (type === 'edit-permissions') html = this._permissionsForm(extra);
    else if (type === 'add-ticket') html = this._ticketForm(bizId);
    else if (type === 'submit-eod') html = this._submitEodForm();
    else html = `<div class="modal-header"><span class="modal-title">Coming Soon</span><button class="modal-close" onclick="App.closeModal()">✕</button></div><div class="modal-body"><div class="empty-state"><div class="empty-state-icon">🚧</div><h3>Form coming soon!</h3></div></div>`;
    this.openModalHTML(html);
  },

  openModalHTML(html) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modalOverlay';
    overlay.innerHTML = `<div class="modal">${html}</div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) this.closeModal(); });
    document.body.appendChild(overlay);
  },

  openUserModal(userId) {
    const isManager = (App.state.user.permissions || []).includes('manage_team');
    if (!isManager) return this.toast('Permission Denied', 'error');

    let u = userId ? USERS.find(x => x.id === userId) : null;
    let allowedBiz = u ? (u.allowedBusinesses || []) : [];
    const isAll = allowedBiz.includes('all');

    const bizCheckboxes = BUSINESSES.map(b => `
      <label style="display:flex;align-items:center;gap:8px;padding:4px 0">
        <input type="checkbox" name="allowedBusinesses" value="${b.id}" ${isAll || allowedBiz.includes(b.id) ? 'checked' : ''} style="accent-color:var(--accent)">
        ${escHtml(b.name)}
      </label>
    `).join('');

    const html = `
      <div class="modal-header">
        <span class="modal-title">${u ? 'Edit User' : 'Create User'}</span>
        <button class="modal-close" type="button" onclick="App.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <form onsubmit="App.saveUser(event, '${userId || ''}')" style="display:flex;flex-direction:column;gap:12px">
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="userFormName" required value="${u ? escHtml(u.name) : ''}">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="userFormEmail" required value="${u ? escHtml(u.email) : ''}">
          </div>
          <div class="form-group">
            <label>Username</label>
            <input type="text" id="userFormUsername" required value="${u ? escHtml(u.username) : ''}">
          </div>
          <div class="form-group">
            <label>Password ${u ? '<span style="font-size:11px;color:var(--text-muted)">(Leave blank to keep current)</span>' : ''}</label>
            <input type="password" id="userFormPassword" ${u ? '' : 'required'}>
          </div>
          <div class="form-group">
            <label>Role</label>
            <select id="userFormRole" required>
              <option value="Admin" ${u && u.role==='Admin'?'selected':''}>Admin</option>
              <option value="Manager" ${u && u.role==='Manager'?'selected':''}>Manager</option>
              <option value="Staff" ${!u || u.role==='Staff'?'selected':''}>Staff</option>
            </select>
          </div>
          <div class="form-group">
            <label>Business Access</label>
            <div style="border:1px solid var(--border);padding:8px;border-radius:6px;max-height:150px;overflow-y:auto;background:var(--bg-secondary)">
              <label style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:4px;font-weight:bold">
                <input type="checkbox" name="allowedBusinesses" value="all" ${isAll ? 'checked' : ''} style="accent-color:var(--accent)" onchange="Array.from(this.closest('div').querySelectorAll('input')).forEach(i => { if(i!==this) i.checked = this.checked })">
                All Businesses
              </label>
              ${bizCheckboxes}
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top:8px">Save User</button>
        </form>
      </div>
    `;
    this.openModalHTML(html);
  },

  saveUser(e, userId) {
    e.preventDefault();
    const isManager = (App.state.user.permissions || []).includes('manage_team');
    if (!isManager) return this.toast('Permission Denied', 'error');

    const name = document.getElementById('userFormName').value.trim();
    const email = document.getElementById('userFormEmail').value.trim();
    const username = document.getElementById('userFormUsername').value.trim();
    const password = document.getElementById('userFormPassword').value;
    const role = document.getElementById('userFormRole').value;
    
    // Get allowed businesses
    const checkboxes = Array.from(e.target.querySelectorAll('input[name="allowedBusinesses"]:checked'));
    const isAll = checkboxes.some(c => c.value === 'all');
    const allowedBusinesses = isAll ? ['all'] : checkboxes.map(c => c.value).filter(v => v !== 'all');

    if (allowedBusinesses.length === 0) {
      return this.toast('User must have access to at least one business.', 'error');
    }

    if (userId) {
      // Edit
      const u = USERS.find(x => x.id === userId);
      if (u) {
        u.name = name;
        u.email = email;
        u.username = username;
        if (password) u.password = password;
        u.role = role;
        u.permissions = DEFAULT_ROLES[role] || DEFAULT_ROLES.Staff;
        u.allowedBusinesses = allowedBusinesses;
        u.avatar = name.charAt(0).toUpperCase();
        this.toast('User updated!', 'success');
      }
    } else {
      // Create
      if (USERS.find(x => x.username === username)) return this.toast('Username already exists', 'error');
      
      const newUser = {
        id: 'u' + Date.now(),
        name, email, username, password, role,
        permissions: DEFAULT_ROLES[role] || DEFAULT_ROLES.Staff,
        allowedBusinesses,
        avatar: name.charAt(0).toUpperCase(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      };
      USERS.push(newUser);
      this.toast('User created!', 'success');
    }

    localStorage.setItem('agrani_users', JSON.stringify(USERS));
    this.closeModal();
    if (this.state.module === 'team') this._renderModule();
  },


  // =============================================
  // SETTINGS TOGGLES
  // =============================================
  toggleAddon(bizId, addonId, enabled) {
    const biz = BUSINESSES.find(b => b.id === bizId);
    if(!biz) return;
    if(!biz.addons) biz.addons = [];
    if(enabled && !biz.addons.includes(addonId)) biz.addons.push(addonId);
    if(!enabled) biz.addons = biz.addons.filter(a => a !== addonId);
    DB.updateBusiness(bizId, { addons: biz.addons });
    this.toast(`Add-on ${enabled ? 'enabled' : 'disabled'}!`, 'success');
    this.renderApp();
  },

  toggleCrossSell(bizId, enabled) {
    const biz = BUSINESSES.find(b => b.id === bizId);
    if(!biz) return;
    biz.crossSell = enabled;
    DB.updateBusiness(bizId, { crossSell: enabled });
    this.toast(`Cross-selling ${enabled ? 'enabled' : 'disabled'}!`, 'success');
    this.renderApp();
  },

  toggleBizActive(bizId, active) {
    const biz = BUSINESSES.find(b => b.id === bizId);
    if (!biz) return;
    biz.active = active;
    DB.updateBusiness(bizId, { active });
    this.toast(`Business marked as ${active ? 'Active' : 'Inactive'}`, 'success');
    this.renderApp();
  },

  saveBizInfo(bizId) {
    const phone = document.getElementById('set_phone')?.value || '';
    const altPhone = document.getElementById('set_altPhone')?.value || '';
    const email = document.getElementById('set_email')?.value || '';
    const website = document.getElementById('set_website')?.value || '';
    const address = document.getElementById('set_address')?.value || '';
    const gst = document.getElementById('set_gst')?.value || '';
    
    DB.updateBusiness(bizId, { phone, altPhone, email, website, address, gst });
    
    const biz = BUSINESSES.find(b => b.id === bizId);
    if (biz) {
      biz.phone = phone; biz.altPhone = altPhone; biz.email = email;
      biz.website = website; biz.address = address; biz.gst = gst;
    }
    
    this.toast('Business information saved!', 'success');
    this._renderModule();
  },

  closeModal() {
    document.getElementById('modalOverlay')?.remove();
  },

  _contactForm(bizId) {
    return `
<div class="modal-header"><span class="modal-title">👥 Add New Lead</span><button class="modal-close" onclick="App.closeModal()">✕</button></div>
<div class="modal-body">
  <div class="form-row">
    <div class="form-field"><label class="form-label">Full Name *</label><input class="form-input" id="cf_name" placeholder="e.g. Ramesh Kumar" required></div>
    <div class="form-field"><label class="form-label">Phone *</label><input class="form-input" id="cf_phone" placeholder="+91 98765 43210" required></div>
  </div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Email</label><input class="form-input" id="cf_email" type="email" placeholder="email@example.com"></div>
    <div class="form-field"><label class="form-label">City</label><select class="form-select" id="cf_city">${CITIES.map(c=>`<option>${c}</option>`).join('')}</select></div>
  </div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Source</label><select class="form-select" id="cf_source">${SOURCES.map(s=>`<option>${s}</option>`).join('')}</select></div>
    <div class="form-field"><label class="form-label">Stage</label><select class="form-select" id="cf_status"><option value="new">New Lead</option><option value="qualifying">Qualifying</option><option value="proposal">Proposal</option><option value="ongoing">Ongoing</option><option value="closed-won">Closed Won</option><option value="closed-lost">Closed Lost</option></select></div>
  </div>
  <div class="form-field"><label class="form-label">Company</label><input class="form-input" id="cf_company" placeholder="Company name (optional)"></div>
  <div class="form-field"><label class="form-label">Estimated Value (₹)</label><input class="form-input" id="cf_value" type="number" placeholder="0"></div>
  <div class="form-field"><label class="form-label">Notes</label><textarea class="form-textarea" id="cf_note" placeholder="Any additional notes..."></textarea></div>
</div>
<div class="modal-footer">
  <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
  <button class="btn btn-primary" onclick="App.saveContact('${bizId}')">Save Lead</button>
</div>`;
  },

  saveContact(bizId) {
    const name  = document.getElementById('cf_name')?.value?.trim();
    const phone = document.getElementById('cf_phone')?.value?.trim();
    if (!name || !phone) { this.toast('Name and phone are required!', 'error'); return; }
    DB.bpush(bizId, 'contacts', {
      name, phone,
      email:   document.getElementById('cf_email')?.value,
      city:    document.getElementById('cf_city')?.value,
      source:  document.getElementById('cf_source')?.value,
      status:  document.getElementById('cf_status')?.value,
      company: document.getElementById('cf_company')?.value,
      value:   parseInt(document.getElementById('cf_value')?.value) || 0,
      note:    document.getElementById('cf_note')?.value,
    });
    DB.logActivity(bizId, 'Added lead', name);
    this.closeModal();
    this._renderModule();
    this.toast('Contact added successfully!', 'success');
  },

  _dealForm(bizId, stage) {
    return `
<div class="modal-header"><span class="modal-title">💼 Add New Deal</span><button class="modal-close" onclick="App.closeModal()">✕</button></div>
<div class="modal-body">
  <div class="form-field"><label class="form-label">Deal Title *</label><input class="form-input" id="df_title" placeholder="e.g. Kerala Tour Package" required></div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Contact</label><select class="form-select" id="df_contact">${DB.bget(bizId,'contacts').map(c=>`<option>${escHtml(c.name)}</option>`).join('')}</select></div>
    <div class="form-field"><label class="form-label">Deal Value (₹)</label><input class="form-input" id="df_value" type="number" placeholder="0"></div>
  </div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Stage</label><select class="form-select" id="df_stage">
      <option value="lead" ${stage==='lead'?'selected':''}>Lead</option>
      <option value="proposal" ${stage==='proposal'?'selected':''}>Proposal</option>
      <option value="negotiation" ${stage==='negotiation'?'selected':''}>Negotiation</option>
      <option value="won" ${stage==='won'?'selected':''}>Won</option>
      <option value="lost">Lost</option>
    </select></div>
    <div class="form-field"><label class="form-label">Expected Close</label><input class="form-input" id="df_date" type="date"></div>
  </div>
  <div class="form-field"><label class="form-label">Notes</label><textarea class="form-textarea" id="df_note" placeholder="Deal notes..."></textarea></div>
</div>
<div class="modal-footer">
  <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
  <button class="btn btn-primary" onclick="App.saveDeal('${bizId}')">Save Deal</button>
</div>`;
  },

  saveDeal(bizId) {
    const title = document.getElementById('df_title')?.value?.trim();
    if (!title) { this.toast('Deal title is required!', 'error'); return; }
    const stageColors = {lead:'#6366F1',proposal:'#F59E0B',negotiation:'#06B6D4',won:'#10B981',lost:'#EF4444'};
    const stage = document.getElementById('df_stage')?.value;
    DB.bpush(bizId, 'deals', {
      title,
      contact:       document.getElementById('df_contact')?.value,
      value:         parseInt(document.getElementById('df_value')?.value) || 0,
      stage,
      color:         stageColors[stage] || '#6366F1',
      expectedClose: document.getElementById('df_date')?.value,
      note:          document.getElementById('df_note')?.value,
    });
    DB.logActivity(bizId, 'Created deal', title);
    this.closeModal();
    this._renderModule();
    this.toast('Deal added!', 'success');
  },

  _taskForm(bizId) {
    const today = new Date().toISOString().split('T')[0];
    const users = USERS.filter(u => u.allowedBusinesses.includes('all') || u.allowedBusinesses.includes(bizId));
    return `
<div class="modal-header"><span class="modal-title">✅ Add New Task</span><button class="modal-close" onclick="App.closeModal()">✕</button></div>
<div class="modal-body">
  <div class="form-field"><label class="form-label">Task Title *</label><input class="form-input" id="tf_title" placeholder="e.g. Follow up with Ramesh Kumar" required></div>
  <div class="form-field"><label class="form-label">Description</label><textarea class="form-textarea" id="tf_desc" placeholder="Details about this task..."></textarea></div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Due Date</label><input class="form-input" id="tf_date" type="date" value="${today}"></div>
    <div class="form-field"><label class="form-label">Priority</label><select class="form-select" id="tf_priority"><option value="high">🔴 High</option><option value="medium" selected>🟡 Medium</option><option value="low">🟢 Low</option></select></div>
  </div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Assignee</label><select class="form-select" id="tf_assignee">${users.map(u=>`<option value="${u.id}" ${u.id===this.state.user.id?'selected':''}>${escHtml(u.name)}</option>`).join('')}</select></div>
    <div class="form-field"><label class="form-label">Contact (optional)</label><select class="form-select" id="tf_contact"><option value="">— None —</option>${DB.bget(bizId,'contacts').map(c=>`<option value="${c.id}">${escHtml(c.name)}</option>`).join('')}</select></div>
  </div>
</div>
<div class="modal-footer">
  <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
  <button class="btn btn-primary" onclick="App.saveTask('${bizId}')">Save Task</button>
</div>`;
  },

  saveTask(bizId) {
    const title = document.getElementById('tf_title')?.value?.trim();
    if (!title) { this.toast('Task title is required!', 'error'); return; }
    DB.bpush(bizId, 'tasks', {
      title,
      desc:      document.getElementById('tf_desc')?.value?.trim(),
      priority:  document.getElementById('tf_priority')?.value,
      dueDate:   document.getElementById('tf_date')?.value,
      contact:   document.getElementById('tf_contact')?.value,
      assignedTo:document.getElementById('tf_assignee')?.value || this.state.user.id,
      assignedBy:this.state.user.id,
      done: false
    });
    this.closeModal();
    this._renderModule();
    this.toast('Task added!', 'success');
  },

  _submitEodForm() {
    const today = new Date().toISOString().split('T')[0];
    const userBusinesses = BUSINESSES.filter(b => this.state.user.allowedBusinesses.includes('all') || this.state.user.allowedBusinesses.includes(b.id));
    return `
<div class="modal-header"><span class="modal-title">⏱️ Submit Daily Timesheet</span><button class="modal-close" onclick="App.closeModal()">✕</button></div>
<div class="modal-body">
  <div class="form-field"><label class="form-label">Date</label><input type="date" class="form-input" id="eod_date" value="${today}" max="${today}"></div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Business</label><select class="form-select" id="eod_biz">
      ${userBusinesses.map(b => `<option value="${b.id}">${escHtml(b.name)}</option>`).join('')}
    </select></div>
    <div class="form-field"><label class="form-label">Hours Spent</label><input type="number" class="form-input" id="eod_hours" min="0.5" step="0.5" value="8"></div>
  </div>
  <div class="form-field"><label class="form-label">Work Description</label><textarea class="form-textarea" id="eod_desc" placeholder="What did you work on today? e.g. Called 10 leads, closed 2 deals" rows="4"></textarea></div>
</div>
<div class="modal-footer">
  <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
  <button class="btn btn-primary" onclick="App.saveTimesheetEntry()">Submit Timesheet</button>
</div>`;
  },

  saveTimesheetEntry() {
    const date = document.getElementById('eod_date')?.value;
    const bizId = document.getElementById('eod_biz')?.value;
    const hours = parseFloat(document.getElementById('eod_hours')?.value) || 0;
    const desc = document.getElementById('eod_desc')?.value?.trim();

    if (!desc || hours <= 0) {
      this.toast('Please enter valid hours and description', 'error');
      return;
    }

    const bizName = BUSINESSES.find(b => b.id === bizId)?.name || bizId;
    const sheets = DB.get('timesheets') || [];
    sheets.push({
      id: uid(),
      userId: this.state.user.id,
      userName: this.state.user.name,
      userAvatar: this.state.user.avatar,
      userColor: this.state.user.color,
      bizId, bizName,
      date, hours, desc,
      submittedAt: new Date().toISOString()
    });
    DB.set('timesheets', sheets);

    this.closeModal();
    if (this.state.module === 'timesheets') this._renderModule();
    this.toast('Timesheet submitted successfully!', 'success');
  },

  _invoiceForm(bizId) {
    const contacts = DB.bget(bizId, 'contacts');
    const today = new Date().toISOString().split('T')[0];
    const due   = new Date(Date.now() + 30*86400000).toISOString().split('T')[0];
    const prefix = bizId.slice(0,3).toUpperCase() + '-';
    const num = prefix + (2025000 + DB.bget(bizId,'invoices').length + 1);
    return `
<div class="modal-header"><span class="modal-title">🧾 New Invoice</span><button class="modal-close" onclick="App.closeModal()">✕</button></div>
<div class="modal-body">
  <div class="form-row">
    <div class="form-field"><label class="form-label">Invoice #</label><input class="form-input" id="if_num" value="${num}"></div>
    <div class="form-field"><label class="form-label">Client *</label><select class="form-select" id="if_client">${contacts.map(c=>`<option>${escHtml(c.name)}</option>`).join('')}</select></div>
  </div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Amount (₹) *</label><input class="form-input" id="if_amount" type="number" placeholder="0"></div>
    <div class="form-field"><label class="form-label">Status</label><select class="form-select" id="if_status"><option value="draft">Draft</option><option value="pending" selected>Pending</option><option value="paid">Paid</option></select></div>
  </div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Issue Date</label><input class="form-input" id="if_issue" type="date" value="${today}"></div>
    <div class="form-field"><label class="form-label">Due Date</label><input class="form-input" id="if_due" type="date" value="${due}"></div>
  </div>
  <div class="form-field"><label class="form-label">Description / Services</label><textarea class="form-textarea" id="if_desc" placeholder="Services rendered..."></textarea></div>
</div>
<div class="modal-footer">
  <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
  <button class="btn btn-primary" onclick="App.saveInvoice('${bizId}')">Create Invoice</button>
</div>`;
  },

  saveInvoice(bizId) {
    const amount = parseInt(document.getElementById('if_amount')?.value);
    const client = document.getElementById('if_client')?.value;
    if (!amount || !client) { this.toast('Client and amount are required!', 'error'); return; }
    DB.bpush(bizId, 'invoices', {
      number:    document.getElementById('if_num')?.value,
      client,
      amount,
      status:    document.getElementById('if_status')?.value,
      issueDate: document.getElementById('if_issue')?.value,
      dueDate:   document.getElementById('if_due')?.value,
      note:      document.getElementById('if_desc')?.value,
    });
    this.closeModal();
    this._renderModule();
    this.toast('Invoice created!', 'success');
  },

  // =============================================
  // NEW FORMS (BUSINESS, TEAM, TICKETS)
  // =============================================
  // First _ticketForm removed — second definition (line ~1433) is the canonical version

  _businessForm() {
    return `
<div class="modal-header"><span class="modal-title">🏢 Add New Business</span><button class="modal-close" onclick="App.closeModal()">✕</button></div>
<div class="modal-body">
  <div class="form-field"><label class="form-label">Business Name *</label><input class="form-input" id="bf_name" placeholder="e.g. Agrani Events" required></div>
  <div class="form-field"><label class="form-label">Tagline</label><input class="form-input" id="bf_tagline" placeholder="Brief description"></div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Industry Type *</label><select class="form-select" id="bf_type">
      ${Object.entries(INDUSTRY_LABELS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
    </select></div>
    <div class="form-field"><label class="form-label">Brand Color</label><input class="form-input" id="bf_color" type="color" value="#6366F1"></div>
  </div>
</div>
<div class="modal-footer">
  <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
  <button class="btn btn-primary" onclick="App.saveBusiness()">Create Business</button>
</div>`;
  },

  saveBusiness() {
    const name = document.getElementById('bf_name')?.value?.trim();
    if (!name) { this.toast('Business name is required!', 'error'); return; }
    const type = document.getElementById('bf_type')?.value;
    const newBiz = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36),
      name,
      type,
      tagline: document.getElementById('bf_tagline')?.value || '',
      color: document.getElementById('bf_color')?.value || '#6366F1',
      icon: INDUSTRY_LABELS[type]?.split(' ')[0] || '🏢',
      addons: [],
      crossSell: false
    };
    DB.addBusiness(newBiz);
    this.closeModal();
    this.switchBiz(newBiz.id);
  },

  _employeeForm() {
    return `
<div class="modal-header"><span class="modal-title">👤 Add Employee</span><button class="modal-close" onclick="App.closeModal()">✕</button></div>
<div class="modal-body">
  <div class="form-row">
    <div class="form-field"><label class="form-label">Full Name *</label><input class="form-input" id="ef_name" placeholder="e.g. Sanjay Verma" required></div>
    <div class="form-field"><label class="form-label">Email *</label><input class="form-input" id="ef_email" type="email" placeholder="sanjay@agranigroup.in" required></div>
  </div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Username</label><input class="form-input" id="ef_user" placeholder="sanjay"></div>
    <div class="form-field"><label class="form-label">Password</label><input class="form-input" id="ef_pass" type="password" placeholder="Pass123!"></div>
  </div>
  <div class="form-field"><label class="form-label">Base Role</label><select class="form-select" id="ef_role">
    <option value="Staff">Staff</option>
    <option value="Manager">Manager</option>
    <option value="Admin">Admin</option>
  </select></div>
</div>
<div class="modal-footer">
  <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
  <button class="btn btn-primary" onclick="App.saveEmployee()">Add Employee</button>
</div>`;
  },

  saveEmployee() {
    const name = document.getElementById('ef_name')?.value?.trim();
    const email = document.getElementById('ef_email')?.value?.trim();
    if (!name || !email) { this.toast('Name and email required!', 'error'); return; }
    const role = document.getElementById('ef_role')?.value;
    const username = (document.getElementById('ef_user')?.value || name.split(' ')[0]).toLowerCase().trim();
    if (USERS.find(u => u.username.toLowerCase() === username)) {
      this.toast('Username already exists!', 'error'); return;
    }
    USERS.push({
      id: uid(),
      name, email, username,
      password: document.getElementById('ef_pass')?.value || 'pass123',
      role,
      avatar: initials(name),
      color: randomColor(name),
      permissions: DEFAULT_ROLES[role] ? [...DEFAULT_ROLES[role]] : [],
      allowedBusinesses: ['all']
    });
    localStorage.setItem('agrani_users', JSON.stringify(USERS));
    this.closeModal();
    this._renderModule();
    this.toast('Employee added! They can now log in.', 'success');
  },

  _permissionsForm(userId) {
    const user = USERS.find(u => u.id === userId);
    if (!user) return '';
    const userPerms = user.permissions || [];
    return `
<div class="modal-header"><span class="modal-title">🔐 Edit Permissions — ${escHtml(user.name)}</span><button class="modal-close" onclick="App.closeModal()">✕</button></div>
<div class="modal-body">
  <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px">Check or uncheck the boxes below to override this user's default role access.</div>
  <div class="grid-2">
    ${Object.entries(PERMISSIONS).map(([k,v]) => `
      <label style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:4px;cursor:pointer">
        <input type="checkbox" id="perm_${k}" value="${k}" ${userPerms.includes(k) ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--accent)">
        <span style="font-size:13px;color:var(--text-primary)">${v}</span>
      </label>
    `).join('')}
  </div>
</div>
<div class="modal-footer">
  <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
  <button class="btn btn-primary" onclick="App.savePermissions('${userId}')">Save Permissions</button>
</div>`;
  },

  savePermissions(userId) {
    const user = USERS.find(u => u.id === userId);
    if (!user) return;
    const newPerms = [];
    Object.keys(PERMISSIONS).forEach(k => {
      if (document.getElementById('perm_' + k)?.checked) newPerms.push(k);
    });
    user.permissions = newPerms;
    localStorage.setItem('agrani_users', JSON.stringify(USERS));
    this.closeModal();
    this._renderModule();
    this.toast('Permissions updated and saved!', 'success');
  },

  _ticketForm(bizId) {
    return `
<div class="modal-header"><span class="modal-title">🎫 Raise Support Ticket</span><button class="modal-close" onclick="App.closeModal()">✕</button></div>
<div class="modal-body">
  <div class="form-field"><label class="form-label">Subject / Issue *</label><input class="form-input" id="tk_title" placeholder="e.g. Payment Gateway Failure" required></div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Customer</label><select class="form-select" id="tk_contact">${DB.bget(bizId,'contacts').map(c=>`<option>${escHtml(c.name)}</option>`).join('')}</select></div>
    <div class="form-field"><label class="form-label">Priority</label><select class="form-select" id="tk_priority"><option value="High">High</option><option value="Medium" selected>Medium</option><option value="Low">Low</option></select></div>
  </div>
  <div class="form-row">
    <div class="form-field"><label class="form-label">Assign To</label><select class="form-select" id="tk_assignee">${USERS.map(u=>`<option>${escHtml(u.name)}</option>`).join('')}</select></div>
    <div class="form-field"><label class="form-label">Status</label><select class="form-select" id="tk_status"><option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option></select></div>
  </div>
  <div class="form-field"><label class="form-label">Issue Details</label><textarea class="form-textarea" id="tk_desc" placeholder="Describe the issue..."></textarea></div>
</div>
<div class="modal-footer">
  <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
  <button class="btn btn-primary" onclick="App.saveTicket('${bizId}')">Create Ticket</button>
</div>`;
  },

  saveTicket(bizId) {
    const title = document.getElementById('tk_title')?.value?.trim();
    if (!title) { this.toast('Subject is required!', 'error'); return; }
    DB.bpush(bizId, 'tickets', {
      id: 'TKT-' + Math.floor(Math.random()*10000),
      title,
      contact:  document.getElementById('tk_contact')?.value,
      priority: document.getElementById('tk_priority')?.value,
      assignee: document.getElementById('tk_assignee')?.value,
      status:   document.getElementById('tk_status')?.value,
      desc:     document.getElementById('tk_desc')?.value,
      date:     new Date().toISOString()
    });
    this.closeModal();
    this._renderModule();
    this.toast('Ticket created!', 'success');
  },

  // =============================================
  // TOAST NOTIFICATIONS
  // =============================================
  toast(msg, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-msg">${escHtml(msg)}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  },
};

// =============================================
// BOOT
// =============================================
document.addEventListener('DOMContentLoaded', () => App.init());
