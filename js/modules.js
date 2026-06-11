/* =============================================
   AGRANI CRM — ALL MODULE RENDERERS
   ============================================= */

const Modules = {};

// =============================================
// DASHBOARD
// =============================================
Modules.dashboard = {
  label: 'Dashboard',
  render(biz) {
    const contacts = DB.bget(biz.id,'contacts');
    const deals    = DB.bget(biz.id,'deals');
    const invoices = DB.bget(biz.id,'invoices');
    const tasks    = DB.bget(biz.id,'tasks');

    const totalRev   = invoices.filter(i=>i.status==='paid').reduce((a,b)=>a+(b.amount||0),0);
    const pending    = invoices.filter(i=>i.status==='pending').reduce((a,b)=>a+(b.amount||0),0);
    const wonDeals   = deals.filter(d=>d.stage==='won').length;
    const openTasks  = tasks.filter(t=>!t.done).length;
    const newLeads   = contacts.filter(c=>c.status==='new').length;
    const pipeline   = deals.filter(d=>!['won','lost'].includes(d.stage)).reduce((a,b)=>a+(b.value||0),0);

    const recentContacts = contacts.slice(-5).reverse();
    const recentDeals    = deals.slice(-4).reverse();

    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left">
      <h2>Welcome back 👋</h2>
      <p>${biz.name} — ${biz.tagline}</p>
    </div>
    <div class="page-header-actions">
      <button class="btn btn-primary" onclick="App.openModal('add-contact')">+ Add Lead</button>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card" style="--kpi-color:#10B981">
      <div class="kpi-icon">💰</div>
      <div class="kpi-value">${fmtINR(totalRev)}</div>
      <div class="kpi-label">Revenue Collected</div>
      <div class="kpi-change up">↑ 12.4% vs last month</div>
    </div>
    <div class="kpi-card" style="--kpi-color:#6366F1">
      <div class="kpi-icon">📊</div>
      <div class="kpi-value">${fmtINR(pipeline)}</div>
      <div class="kpi-label">Active Pipeline</div>
      <div class="kpi-change up">↑ ${deals.filter(d=>d.stage==='proposal').length} in proposal</div>
    </div>
    <div class="kpi-card" style="--kpi-color:#F59E0B">
      <div class="kpi-icon">👥</div>
      <div class="kpi-value">${contacts.length}</div>
      <div class="kpi-label">Total Contacts</div>
      <div class="kpi-change up">↑ ${newLeads} new leads</div>
    </div>
    <div class="kpi-card" style="--kpi-color:#EF4444">
      <div class="kpi-icon">⏰</div>
      <div class="kpi-value">${fmtINR(pending)}</div>
      <div class="kpi-label">Pending Payments</div>
      <div class="kpi-change down">↓ ${invoices.filter(i=>i.status==='overdue').length} overdue</div>
    </div>
  </div>

  <div class="grid-2 mb-4">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Revenue Trend</div>
          <div class="card-subtitle">Last 6 months</div>
        </div>
      </div>
      <div class="card-body">
        <div class="chart-wrap"><canvas id="revenueChart"></canvas></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Deal Stages</div>
          <div class="card-subtitle">Current pipeline breakdown</div>
        </div>
      </div>
      <div class="card-body">
        <div class="chart-wrap"><canvas id="stagesChart"></canvas></div>
      </div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-header">
        <div class="card-title">Recent Activity</div>
      </div>
      <div style="padding:8px 0;max-height:300px;overflow-y:auto">
        ${DB.bget(biz.id, 'activities').slice(0, 8).map(act=>`
          <div style="display:flex;align-items:center;gap:12px;padding:10px 22px;border-bottom:1px solid var(--border)">
            <div class="avatar" style="background:${act.userColor};font-size:12px">${act.userAvatar}</div>
            <div style="flex:1;overflow:hidden">
              <div style="font-size:13px;font-weight:600;color:var(--text-primary)">
                <span style="color:var(--accent)">${escHtml(act.userName)}</span> ${escHtml(act.action)}
              </div>
              <div style="font-size:11px;color:var(--text-muted);font-weight:600">${escHtml(act.target)}</div>
            </div>
            <span style="font-size:10px;color:var(--text-muted)">${new Date(act.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
          </div>
        `).join('')}
        ${DB.bget(biz.id, 'activities').length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-muted)">No recent activity</div>' : ''}
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="card-title">Tasks Due Soon</div>
        <button class="btn btn-secondary btn-sm" onclick="App.nav('tasks')">View All</button>
      </div>
      <div style="padding:8px 0">
        ${tasks.filter(t=>!t.done).slice(0,5).map(t=>`
          <div style="display:flex;align-items:center;gap:12px;padding:10px 22px;border-bottom:1px solid var(--border)">
            <div style="width:8px;height:8px;border-radius:50%;background:${t.priority==='high'?'var(--danger)':t.priority==='medium'?'var(--warning)':'var(--success)'};flex-shrink:0"></div>
            <div style="flex:1;overflow:hidden">
              <div style="font-size:13px;font-weight:500;color:var(--text-primary)">${escHtml(t.title)}</div>
              <div style="font-size:11px;color:var(--text-muted)">${fmtDateShort(t.dueDate)} • ${escHtml(t.assignee||'Unassigned')}</div>
            </div>
            <span class="badge badge-${t.priority==='high'?'danger':t.priority==='medium'?'warning':'success'}">${t.priority}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
</div>`;
  },
  init(biz) {
    const invoices = DB.bget(biz.id,'invoices');
    const deals    = DB.bget(biz.id,'deals');
    const months   = ['Jan','Feb','Mar','Apr','May','Jun'];
    const revData  = months.map((_,i) => Math.floor(50000 + Math.random()*300000));

    const rc = document.getElementById('revenueChart');
    if(rc) new Chart(rc, {
      type:'line',
      data:{
        labels:months,
        datasets:[{
          label:'Revenue',
          data:revData,
          borderColor:'#6366F1',
          backgroundColor:'rgba(99,102,241,0.08)',
          fill:true, tension:0.4,
          pointBackgroundColor:'#6366F1',
          pointRadius:4, pointHoverRadius:6,
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{display:false}},
        scales:{
          x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#4A5568',font:{size:11}}},
          y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#4A5568',font:{size:11},callback:v=>fmtINR(v)}},
        }
      }
    });

    const stageCounts = {lead:0,proposal:0,negotiation:0,won:0,lost:0};
    deals.forEach(d=>{ if(stageCounts[d.stage]!==undefined) stageCounts[d.stage]++; });
    const sc = document.getElementById('stagesChart');
    if(sc) new Chart(sc, {
      type:'doughnut',
      data:{
        labels:['Lead','Proposal','Negotiation','Won','Lost'],
        datasets:[{
          data:Object.values(stageCounts),
          backgroundColor:['#6366F1','#F59E0B','#06B6D4','#10B981','#EF4444'],
          borderWidth:0, hoverOffset:6
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{position:'bottom',labels:{color:'#8892B0',font:{size:11},padding:16,usePointStyle:true}}}
      }
    });
  }
};

// =============================================
// SUPPORT TICKETS (GLOBAL & BUSINESS)
// =============================================
Modules.tickets = {
  label: 'Support Desk',
  render(biz) {
    const allTickets = DB.bgetAll('tickets');
    // If not admin, only show tickets assigned to them
    const tickets = (App.state.user.role === 'Admin') ? allTickets : allTickets.filter(t => t.assignee === App.state.user.name);
    const sColors = {Open:'info', 'In Progress':'warning', Resolved:'success'};
    const pColors = {High:'danger', Medium:'warning', Low:'success'};

    const openCount = tickets.filter(t=>t.status!=='Resolved').length;

    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left">
      <h2>Global Support Desk 🎫</h2>
      <p>${openCount} open tickets • ${tickets.length} total tickets</p>
    </div>
    <div class="page-header-actions">
      <button class="btn btn-primary" onclick="App.openModal('add-ticket','${biz.id}')">+ New Ticket</button>
    </div>
  </div>

  <div class="table-wrapper">
    <table class="data-table">
      <thead><tr>
        <th>Ticket ID</th><th>Title</th><th>Customer</th><th>Business</th><th>Priority</th><th>Status</th><th>Assignee</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${tickets.map(t=>`<tr>
          <td style="font-family:monospace;color:var(--accent)">${t.id}</td>
          <td style="font-weight:600">${escHtml(t.title)}</td>
          <td>${escHtml(t.contact)}</td>
          <td><span class="badge badge-primary">${BUSINESSES.find(b=>b.id===t._bizId)?.name||'Unknown'}</span></td>
          <td><span class="badge badge-${pColors[t.priority]||'muted'}">${t.priority}</span></td>
          <td><span class="badge badge-${sColors[t.status]||'muted'}">${t.status}</span></td>
          <td>${escHtml(t.assignee)}</td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-primary btn-sm" onclick="App.viewTicket('${t.id}','${t._bizId}')">View</button>
              ${t.status !== 'Resolved' ? `<button class="btn btn-success btn-sm" onclick="App.closeTicket('${t.id}','${t._bizId}')">✓ Resolve</button>` : ''}
              <button class="btn btn-icon btn-sm" onclick="App.delTicket('${t.id}','${t._bizId}')">🗑️</button>
            </div>
          </td>
        </tr>`).join('')}
        ${tickets.length===0?`<tr><td colspan="8" style="text-align:center;padding:30px">No support tickets found.</td></tr>`:''}
      </tbody>
    </table>
  </div>
</div>`;
  },
  init(biz) {}
};

// =============================================
// CONTACTS & LEAD PIPELINE
// =============================================
Modules.contacts = {
  label: 'Contacts & Leads',
  render(biz) {
    const contacts = DB.bget(biz.id,'contacts');
    const pipeline = [
      { id:'new',          label:'New Lead',    color:'#3B82F6', icon:'🌱', desc:'Fresh enquiry' },
      { id:'qualifying',   label:'Qualifying',  color:'#F59E0B', icon:'🔍', desc:'Being assessed' },
      { id:'proposal',     label:'Proposal',    color:'#8B5CF6', icon:'📋', desc:'Quote sent' },
      { id:'ongoing',      label:'Ongoing',     color:'#10B981', icon:'⚙️', desc:'Active service' },
      { id:'closed-won',   label:'Closed Won',  color:'#22C55E', icon:'🏆', desc:'Successfully closed' },
      { id:'closed-lost',  label:'Closed Lost', color:'#EF4444', icon:'❌', desc:'Not converted' },
    ];

    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left">
      <h2>Lead Pipeline</h2>
      <p>${contacts.length} contacts • ${contacts.filter(c=>c.status==='new'||c.status==='qualifying').length} active leads</p>
    </div>
    <div class="page-header-actions">
      <div class="tabs" id="contactViewTabs" style="margin-right:8px">
        <button class="tab-btn active" id="tabKanban" onclick="App.contactViewTab('kanban')">🗂 Pipeline</button>
        <button class="tab-btn" id="tabList" onclick="App.contactViewTab('list')">📋 List</button>
      </div>
      <button class="btn btn-secondary" onclick="App.exportCSV('contacts')">⬇ Export CSV</button>
      <button class="btn btn-primary" onclick="App.openModal('add-contact','${biz.id}')">+ Add Lead</button>
    </div>
  </div>

  <!-- PIPELINE SUMMARY STRIP -->
  <div style="display:flex;gap:10px;margin-bottom:20px;overflow-x:auto;padding-bottom:4px">
    ${pipeline.map(s => {
      const cnt = contacts.filter(c=>c.status===s.id).length;
      const val = contacts.filter(c=>c.status===s.id).reduce((a,b)=>a+(b.value||0),0);
      return `<div style="flex-shrink:0;background:var(--bg-card);border:1px solid ${s.color}33;border-top:3px solid ${s.color};border-radius:10px;padding:12px 16px;min-width:130px">
        <div style="font-size:18px;margin-bottom:4px">${s.icon}</div>
        <div style="font-size:20px;font-weight:800;color:var(--text-primary)">${cnt}</div>
        <div style="font-size:11px;font-weight:600;color:${s.color}">${s.label}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${fmtINR(val)}</div>
      </div>`;
    }).join('')}
  </div>

  <!-- KANBAN VIEW -->
  <div id="contactsKanban">
    <div class="kanban-board" style="grid-template-columns:repeat(${pipeline.length},1fr)">
      ${pipeline.map(s => {
        const cols = contacts.filter(c=>c.status===s.id);
        const totalVal = cols.reduce((a,b)=>a+(b.value||0),0);
        return `
        <div class="kanban-col">
          <div class="kanban-col-header" style="border-top:3px solid ${s.color}">
            <span class="kanban-col-title">${s.icon} ${s.label}</span>
            <span class="kanban-col-count">${cols.length}</span>
          </div>
          <div class="kanban-col-body">
            ${totalVal>0?`<div style="font-size:10px;color:var(--text-muted);padding:2px 4px 6px">${fmtINR(totalVal)}</div>`:''}
            ${cols.map(c=>`
              <div class="deal-card" style="--deal-color:${s.color}" onclick="App.viewContact('${c.id}','${biz.id}')">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                  <div class="avatar" style="width:28px;height:28px;font-size:11px;background:${randomColor(c.name)}">${initials(c.name)}</div>
                  <div style="flex:1;overflow:hidden">
                    <div style="font-size:12px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(c.name)}</div>
                    <div style="font-size:10px;color:var(--text-muted)">${escHtml(c.phone||'')}</div>
                  </div>
                </div>
                ${c.company?`<div style="font-size:10px;color:var(--text-muted);margin-bottom:4px">🏢 ${escHtml(c.company)}</div>`:''}
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
                  <span style="font-size:11px;font-weight:700;color:var(--success)">${fmtINR(c.value)}</span>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-icon btn-sm" style="width:22px;height:22px;font-size:10px" title="Move stage" onclick="event.stopPropagation();App.quickStageContact('${c.id}','${biz.id}','${s.id}')">→</button>
                  </div>
                </div>
              </div>
            `).join('')}
            <button class="btn btn-secondary btn-sm w-full" style="margin-top:6px;font-size:11px" onclick="App.openModalAddLeadStage('${biz.id}','${s.id}')">+ Add</button>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <!-- LIST VIEW -->
  <div id="contactsList" class="hidden">
    <div class="card mb-4">
      <div class="card-body" style="padding:12px 22px">
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <input class="form-input" id="contactSearch" placeholder="🔍  Search by name, phone, email..." style="max-width:280px" oninput="App.filterContacts('${biz.id}',this.value)">
          <select class="form-select" id="statusFilter" style="max-width:160px" onchange="App.filterContacts('${biz.id}',document.getElementById('contactSearch').value,this.value)">
            <option value="">All Stages</option>
            ${pipeline.map(s=>`<option value="${s.id}">${s.icon} ${s.label}</option>`).join('')}
          </select>
          <select class="form-select" id="sourceFilter" style="max-width:150px" onchange="App.filterContacts('${biz.id}',document.getElementById('contactSearch').value,document.getElementById('statusFilter').value,this.value)">
            <option value="">All Sources</option>
            ${SOURCES.map(s=>`<option value="${s}">${s}</option>`).join('')}
          </select>
          <div style="margin-left:auto;font-size:13px;color:var(--text-muted)" id="contactCount">${contacts.length} contacts</div>
        </div>
      </div>
    </div>
    <div class="table-wrapper">
      <table class="data-table" id="contactsTable">
        <thead><tr>
          <th>Name</th><th>Phone</th><th>City</th><th>Source</th><th>Stage</th><th>Value</th><th>Actions</th>
        </tr></thead>
        <tbody id="contactsBody">
          ${contacts.map(c=>Modules.contacts._row(c)).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
  },

  _row(c) {
    const sColors = {
      'new':'info', 'qualifying':'warning', 'proposal':'primary',
      'ongoing':'success', 'closed-won':'success', 'closed-lost':'danger'
    };
    const sLabels = {
      'new':'🌱 New', 'qualifying':'🔍 Qualifying', 'proposal':'📋 Proposal',
      'ongoing':'⚙️ Ongoing', 'closed-won':'🏆 Won', 'closed-lost':'❌ Lost'
    };
    return `<tr data-id="${c.id}">
      <td><div style="display:flex;align-items:center;gap:10px">
        <div class="avatar" style="background:${randomColor(c.name)};width:32px;height:32px;font-size:12px">${initials(c.name)}</div>
        <div>
          <div style="font-weight:600;color:var(--text-primary)">${escHtml(c.name)}</div>
          <div style="font-size:11px;color:var(--text-muted)">${escHtml(c.email||'')}</div>
        </div>
      </div></td>
      <td>${c.phone ? `<a href="tel:${c.phone}" style="color:var(--accent)">${escHtml(c.phone)}</a>` : '—'}</td>
      <td>${escHtml(c.city||'—')}</td>
      <td><span class="badge badge-muted">${escHtml(c.source||'—')}</span></td>
      <td><span class="badge badge-${sColors[c.status]||'muted'}">${sLabels[c.status]||c.status||'new'}</span></td>
      <td style="color:var(--success);font-weight:600">${fmtINR(c.value)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-primary btn-sm" onclick="App.viewContact('${c.id}','${c._bizId||App.state.bizId}')">View</button>
          <button class="btn btn-secondary btn-sm" onclick="App.editContact('${c.id}','${c._bizId||App.state.bizId}')">✏️</button>
          ${c.phone ? `<a href="tel:${c.phone}" class="btn btn-icon btn-sm" title="Call">📞</a>` : ''}
          <button class="btn btn-icon btn-sm" onclick="App.delContact('${c.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  },
  init(biz) {}
};


// =============================================
// DEALS PIPELINE
// =============================================
Modules.deals = {
  label: 'Deals Pipeline',
  render(biz) {
    const deals  = DB.bget(biz.id,'deals');
    const stages = [
      {id:'lead',        label:'Lead',         color:'#6366F1'},
      {id:'proposal',    label:'Proposal',     color:'#F59E0B'},
      {id:'negotiation', label:'Negotiation',  color:'#06B6D4'},
      {id:'won',         label:'Won ✅',       color:'#10B981'},
      {id:'lost',        label:'Lost ❌',      color:'#EF4444'},
    ];
    const totalPipeline = deals.filter(d=>!['won','lost'].includes(d.stage)).reduce((a,b)=>a+(b.value||0),0);
    const totalWon      = deals.filter(d=>d.stage==='won').reduce((a,b)=>a+(b.value||0),0);

    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left">
      <h2>Deals Pipeline</h2>
      <p>${deals.length} deals • Pipeline: ${fmtINR(totalPipeline)} • Won: ${fmtINR(totalWon)}</p>
    </div>
    <div class="page-header-actions">
      <button class="btn btn-primary" onclick="App.openModal('add-deal','${biz.id}')">+ Add Deal</button>
    </div>
  </div>
  <div class="kanban-board">
    ${stages.map(s=>{
      const cols = deals.filter(d=>d.stage===s.id);
      const total = cols.reduce((a,b)=>a+(b.value||0),0);
      return `
      <div class="kanban-col">
        <div class="kanban-col-header" style="border-top:3px solid ${s.color}">
          <span class="kanban-col-title">${s.label}</span>
          <span class="kanban-col-count">${cols.length}</span>
        </div>
        <div class="kanban-col-body" data-stage="${s.id}">
          ${total>0?`<div style="font-size:11px;color:var(--text-muted);padding:4px 6px">${fmtINR(total)}</div>`:''}
          ${cols.map(d=>`
            <div class="deal-card" style="--deal-color:${s.color}" onclick="App.viewDeal('${d.id}','${biz.id}')">
              <div class="deal-card-name">${escHtml(d.title)}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">👤 ${escHtml(d.contact||'')}</div>
              <div class="deal-card-meta">
                <span class="deal-card-value">${fmtINR(d.value)}</span>
                <span style="font-size:11px">${fmtDateShort(d.expectedClose)}</span>
              </div>
            </div>
          `).join('')}
          <button class="btn btn-secondary btn-sm w-full" style="margin-top:4px" onclick="App.openModal('add-deal','${biz.id}','${s.id}')">+ Add</button>
        </div>
      </div>`;
    }).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

// =============================================
// TASKS & CALENDAR
// =============================================
Modules.tasks = {
  label: 'Tasks & Calendar',
  render(biz) {
    const tasks = DB.bget(biz.id,'tasks');
    const open  = tasks.filter(t=>!t.done);
    const done  = tasks.filter(t=>t.done);

    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left">
      <h2>Tasks & Follow-ups</h2>
      <p>${open.length} pending • ${done.length} completed</p>
    </div>
    <div class="page-header-actions">
      <button class="btn btn-primary" onclick="App.openModal('add-task','${biz.id}')">+ Add Task</button>
    </div>
  </div>

  <div class="tabs mb-4" id="taskTabs">
    <button class="tab-btn active" onclick="App.taskTab(this,'open')">Open (${open.length})</button>
    <button class="tab-btn" onclick="App.taskTab(this,'done')">Completed (${done.length})</button>
  </div>

  <div id="taskListOpen">
    ${open.length===0?`<div class="empty-state"><div class="empty-state-icon">✅</div><h3>All caught up!</h3><p>No pending tasks. Great work!</p></div>`:''}
    ${open.map(t=>Modules.tasks._row(t,biz.id)).join('')}
  </div>
  <div id="taskListDone" class="hidden">
    ${done.map(t=>Modules.tasks._row(t,biz.id)).join('')}
  </div>
</div>`;
  },
  _row(t,bizId) {
    const pClr = t.priority==='high'?'var(--danger)':t.priority==='medium'?'var(--warning)':'var(--success)';
    const days  = daysUntil(t.dueDate);
    const overdue = days!==null && days<0 && !t.done;
    return `<div class="job-item" style="margin-bottom:8px;opacity:${t.done?0.6:1}">
      <div>
        <input type="checkbox" ${t.done?'checked':''} style="width:18px;height:18px;cursor:pointer;accent-color:var(--accent)"
          onchange="App.toggleTask('${t.id}','${bizId}',this.checked)">
      </div>
      <div style="flex:1;overflow:hidden">
        <div style="font-size:13px;font-weight:600;color:var(--text-primary);${t.done?'text-decoration:line-through;':''}">
          ${escHtml(t.title)}
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">
          👤 ${escHtml(t.assignee||'Unassigned')} &nbsp;•&nbsp; ${t.contact?'🔗 '+escHtml(t.contact):''}
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <span class="badge badge-${t.priority==='high'?'danger':t.priority==='medium'?'warning':'success'}">${t.priority}</span>
        <div style="font-size:11px;color:${overdue?'var(--danger)':'var(--text-muted)'};margin-top:4px">
          ${overdue?'⚠ Overdue':'📅 '+fmtDateShort(t.dueDate)}
        </div>
      </div>
      <button class="btn btn-icon btn-sm" onclick="App.delTask('${t.id}','${bizId}')">🗑️</button>
    </div>`;
  },
  init(biz) {}
};

// =============================================
// INVOICES & QUOTES
// =============================================
Modules.invoices = {
  label: 'Invoices & Quotes',
  render(biz) {
    const invs  = DB.bget(biz.id,'invoices');
    const quotes = DB.bget(biz.id,'quotes');
    
    const paid   = invs.filter(i=>i.status==='paid').reduce((a,b)=>a+(b.amount||0),0);
    const pending= invs.filter(i=>i.status==='pending').reduce((a,b)=>a+(b.amount||0),0);
    const overdue= invs.filter(i=>i.status==='overdue').reduce((a,b)=>a+(b.amount||0),0);
    const sColors = {paid:'success',pending:'warning',overdue:'danger',draft:'muted',accepted:'success',rejected:'danger',sent:'primary'};

    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left">
      <h2>Billing & Quotations</h2>
      <p>Manage invoices, collect payments, and send quotes</p>
    </div>
    <div class="page-header-actions">
      <div class="tabs" style="margin-right:8px">
        <button class="tab-btn active" id="tabInv" onclick="App.billingViewTab('inv')">🧾 Invoices</button>
        <button class="tab-btn" id="tabQuotes" onclick="App.billingViewTab('quotes')">📝 Quotations</button>
      </div>
      <button class="btn btn-secondary" onclick="App.exportCSV('invoices')">⬇ Export CSV</button>
      <button class="btn btn-primary" onclick="App.openModal('add-invoice','${biz.id}')">+ Create</button>
    </div>
  </div>

  <div id="viewInvoices">
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
      <div class="kpi-card" style="--kpi-color:#10B981"><div class="kpi-icon">✅</div><div class="kpi-value">${fmtINR(paid)}</div><div class="kpi-label">Collected</div></div>
      <div class="kpi-card" style="--kpi-color:#F59E0B"><div class="kpi-icon">⏳</div><div class="kpi-value">${fmtINR(pending)}</div><div class="kpi-label">Pending</div></div>
      <div class="kpi-card" style="--kpi-color:#EF4444"><div class="kpi-icon">⚠️</div><div class="kpi-value">${fmtINR(overdue)}</div><div class="kpi-label">Overdue</div></div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead><tr><th>Invoice #</th><th>Client</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Payment</th><th>Actions</th></tr></thead>
        <tbody>
          ${invs.map(inv=>`<tr>
            <td style="font-family:monospace;color:var(--accent);font-weight:bold">${escHtml(inv.number)}</td>
            <td style="font-weight:600">${escHtml(inv.client)}</td>
            <td style="font-weight:700;color:var(--text-primary)">${fmtINR(inv.amount)}</td>
            <td><span class="badge badge-${sColors[inv.status]||'muted'}">${inv.status}</span></td>
            <td style="color:${inv.status==='overdue'?'var(--danger)':'var(--text-secondary)'}">${fmtDate(inv.dueDate)}</td>
            <td style="font-size:11px;color:var(--text-muted)">
              ${inv.status==='paid' ? `<div>💰 ${inv.payMedium||'Bank Transfer'}</div><div>📅 ${fmtDateShort(inv.payDate)}</div>` : '—'}
            </td>
            <td><div style="display:flex;gap:6px">
              <button class="btn btn-sm btn-primary" onclick="App.viewInvoice('${inv.id}','${biz.id}')">View</button>
              ${inv.status !== 'paid' ? `<button class="btn btn-sm btn-success" onclick="App.recordPayment('${inv.id}','${biz.id}')">₹ Pay</button>` : ''}
              <button class="btn btn-icon btn-sm" onclick="App.delInvoice('${inv.id}','${biz.id}')">🗑️</button>
            </div></td>
          </tr>`).join('')}
          ${invs.length===0?`<tr><td colspan="7" style="text-align:center;padding:30px">No invoices generated yet.</td></tr>`:''}
        </tbody>
      </table>
    </div>
  </div>

  <div id="viewQuotes" class="hidden">
    <div class="table-wrapper">
      <table class="data-table">
        <thead><tr><th>Quote #</th><th>Client</th><th>Subject</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          ${quotes.map(q=>`<tr>
            <td style="font-family:monospace;color:var(--warning);font-weight:bold">${escHtml(q.number)}</td>
            <td style="font-weight:600">${escHtml(q.client)}</td>
            <td>${escHtml(q.subject||'—')}</td>
            <td style="font-weight:700;color:var(--text-primary)">${fmtINR(q.amount)}</td>
            <td><span class="badge badge-${sColors[q.status]||'muted'}">${q.status}</span></td>
            <td>${fmtDate(q.date)}</td>
            <td><div style="display:flex;gap:6px">
              <button class="btn btn-sm btn-primary" onclick="App.viewQuote('${q.id}','${biz.id}')">View</button>
              ${q.status==='accepted' ? `<button class="btn btn-sm btn-success" title="Convert to Invoice" onclick="App.convertQuoteToInvoice('${q.id}','${biz.id}')">Convert to Invoice</button>` : ''}
              <button class="btn btn-icon btn-sm" onclick="App.delQuote('${q.id}','${biz.id}')">🗑️</button>
            </div></td>
          </tr>`).join('')}
          ${quotes.length===0?`<tr><td colspan="7" style="text-align:center;padding:30px">No quotations created yet.</td></tr>`:''}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
  },
  init(biz) {}
};

// =============================================
// REPORTS
// =============================================
Modules.reports = {
  label: 'Reports',
  render(biz) {
    const contacts = DB.bget(biz.id,'contacts');
    const deals    = DB.bget(biz.id,'deals');
    const invoices = DB.bget(biz.id,'invoices');

    const srcMap={};
    contacts.forEach(c=>{ srcMap[c.source||'Unknown']=(srcMap[c.source||'Unknown']||0)+1; });
    const wonRate = deals.length?Math.round(deals.filter(d=>d.stage==='won').length/deals.length*100):0;

    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>Reports & Analytics</h2><p>Business performance overview</p></div>
  </div>

  <div class="kpi-grid mb-4">
    <div class="kpi-card" style="--kpi-color:#10B981"><div class="kpi-icon">🏆</div><div class="kpi-value">${wonRate}%</div><div class="kpi-label">Deal Win Rate</div></div>
    <div class="kpi-card" style="--kpi-color:#6366F1"><div class="kpi-icon">💼</div><div class="kpi-value">${deals.filter(d=>d.stage==='won').length}</div><div class="kpi-label">Deals Won</div></div>
    <div class="kpi-card" style="--kpi-color:#F59E0B"><div class="kpi-icon">📞</div><div class="kpi-value">${contacts.filter(c=>c.status==='qualified').length}</div><div class="kpi-label">Qualified Leads</div></div>
    <div class="kpi-card" style="--kpi-color:#06B6D4"><div class="kpi-icon">💰</div><div class="kpi-value">${fmtINR(invoices.filter(i=>i.status==='paid').reduce((a,b)=>a+(b.amount||0),0))}</div><div class="kpi-label">Revenue</div></div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title">Lead Sources</div></div>
      <div class="card-body"><div class="chart-wrap"><canvas id="sourceChart"></canvas></div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Monthly Revenue</div></div>
      <div class="card-body"><div class="chart-wrap"><canvas id="monthlyChart"></canvas></div></div>
    </div>
  </div>
</div>`;
  },
  init(biz) {
    const contacts = DB.bget(biz.id,'contacts');
    const srcMap={};
    contacts.forEach(c=>{ srcMap[c.source||'Unknown']=(srcMap[c.source||'Unknown']||0)+1; });

    const sc = document.getElementById('sourceChart');
    if(sc) new Chart(sc,{
      type:'bar',
      data:{
        labels:Object.keys(srcMap),
        datasets:[{data:Object.values(srcMap),backgroundColor:['#6366F1','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EC4899','#EF4444','#F97316'],borderRadius:6,borderWidth:0}]
      },
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#4A5568',font:{size:11}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#4A5568',font:{size:11}}}}}
    });

    const months=['Jan','Feb','Mar','Apr','May','Jun'];
    const mc = document.getElementById('monthlyChart');
    if(mc) new Chart(mc,{
      type:'bar',
      data:{
        labels:months,
        datasets:[
          {label:'Revenue',data:months.map(()=>Math.floor(30000+Math.random()*400000)),backgroundColor:'rgba(99,102,241,0.6)',borderRadius:6},
          {label:'Expenses',data:months.map(()=>Math.floor(10000+Math.random()*150000)),backgroundColor:'rgba(239,68,68,0.4)',borderRadius:6}
        ]
      },
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#8892B0',font:{size:11}}}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#4A5568',font:{size:11}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#4A5568',font:{size:11},callback:v=>fmtINR(v)}}}}
    });
  }
};


// =============================================
// SETTINGS

// =============================================
Modules.settings = {
  label: 'Settings',
  render(biz) {
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>Settings</h2><p>Configure ${escHtml(biz.name)}</p></div>
    <div class="page-header-actions"><button class="btn btn-primary" onclick="App.toast('Settings saved!','success')">Save Changes</button></div>
  </div>
  <div class="grid-2">
    <div>
      <div class="card mb-4">
        <div class="card-header"><div class="card-title">Business Profile</div></div>
        <div class="card-body">
          <div class="form-field"><label class="form-label">Business Name</label><input class="form-input" value="${escHtml(biz.name)}"></div>
          <div class="form-field"><label class="form-label">Tagline</label><input class="form-input" value="${escHtml(biz.tagline)}"></div>
          <div class="form-field"><label class="form-label">Email</label><input class="form-input" type="email" value="info@${biz.id}.in"></div>
          <div class="form-field"><label class="form-label">Phone</label><input class="form-input" value="+91 98765 43210"></div>
          <div class="form-field"><label class="form-label">Address</label><textarea class="form-textarea">Plot No. 45, Janpath, Bhubaneswar, Odisha 751001</textarea></div>
          <div class="form-field"><label class="form-label">GST Number</label><input class="form-input" value="21AABCU9603R1ZX"></div>
        </div>
      </div>
    </div>
    <div>
      <div class="card mb-4">
        <div class="card-header"><div class="card-title">Notifications</div></div>
        <div class="card-body">
          ${[['Email Notifications','Get notified via email for new leads'],['SMS Alerts','SMS for payment reminders'],['Task Reminders','Daily task digest'],['Deal Updates','Pipeline movement alerts']].map(([t,d],i)=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">
            <div><div style="font-size:13px;font-weight:600;color:var(--text-primary)">${t}</div><div style="font-size:12px;color:var(--text-muted)">${d}</div></div>
            <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer">
              <input type="checkbox" ${i!==3?'checked':''} style="opacity:0;width:0;height:0">
              <span style="position:absolute;inset:0;background:${i!==3?'var(--accent)':'rgba(255,255,255,0.1)'};border-radius:24px;transition:0.2s"></span>
              <span style="position:absolute;left:${i!==3?'22':'2'}px;top:2px;width:20px;height:20px;background:white;border-radius:50%;transition:0.2s"></span>
            </label>
          </div>`).join('')}
        </div>
      </div>
      <div class="card mb-4">
        <div class="card-header"><div class="card-title">Add-ons & Features</div></div>
        <div class="card-body">
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Enable or disable specific features for this business. Changes apply immediately.</div>
          ${Object.entries(ADDON_REGISTRY).map(([k,v])=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">
            <div>
              <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${v.icon} ${v.label}</div>
              <div style="font-size:12px;color:var(--text-muted)">${v.desc}</div>
            </div>
            <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer">
              <input type="checkbox" onchange="App.toggleAddon('${biz.id}','${k}',this.checked)" ${biz.addons?.includes(k)?'checked':''} style="opacity:0;width:0;height:0">
              <span style="position:absolute;inset:0;background:${biz.addons?.includes(k)?'var(--accent)':'rgba(255,255,255,0.1)'};border-radius:24px;transition:0.2s"></span>
              <span style="position:absolute;left:${biz.addons?.includes(k)?'22':'2'}px;top:2px;width:20px;height:20px;background:white;border-radius:50%;transition:0.2s"></span>
            </label>
          </div>`).join('')}
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0">
            <div>
              <div style="font-size:13px;font-weight:600;color:var(--text-primary)">🌐 Cross-Selling Network</div>
              <div style="font-size:12px;color:var(--text-muted)">Allow sharing contacts for cross-business marketing</div>
            </div>
            <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer">
              <input type="checkbox" onchange="App.toggleCrossSell('${biz.id}',this.checked)" ${biz.crossSell?'checked':''} style="opacity:0;width:0;height:0">
              <span style="position:absolute;inset:0;background:${biz.crossSell?'var(--success)':'rgba(255,255,255,0.1)'};border-radius:24px;transition:0.2s"></span>
              <span style="position:absolute;left:${biz.crossSell?'22':'2'}px;top:2px;width:20px;height:20px;background:white;border-radius:50%;transition:0.2s"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Invoice Settings</div></div>
        <div class="card-body">
          <div class="form-field"><label class="form-label">Currency</label>
            <select class="form-select"><option selected>₹ INR</option><option>$ USD</option><option>€ EUR</option></select>
          </div>
          <div class="form-field"><label class="form-label">Default Tax Rate</label><input class="form-input" value="18" type="number"></div>
          <div class="form-field"><label class="form-label">Payment Terms (days)</label><input class="form-input" value="30" type="number"></div>
          <div class="form-field"><label class="form-label">Invoice Prefix</label><input class="form-input" value="${biz.id.slice(0,3).toUpperCase()}-"></div>
        </div>
      </div>
    </div>
  </div>
</div>`;
  },
  init(biz) {}
};

// =============================================
// ===== TRAVEL MODULES ====================
// =============================================
Modules.itineraries = {
  label:'Itinerary Builder',
  render(biz) {
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🗓️ Itinerary Builder</h2><p>Create day-by-day trip plans for customers</p></div>
    <div class="page-header-actions"><button class="btn btn-primary" onclick="App.openModal('add-itinerary','${biz.id}')">+ New Itinerary</button></div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">Sample Itinerary — Bali Honeymoon 7 Days</div><span class="badge badge-success">Template</span></div>
    <div class="card-body">
      ${[
        {day:1,title:'Arrival & Check-in',activities:[{time:'14:00',act:'Arrive Ngurah Rai Airport'},{time:'16:00',act:'Check-in at Ubud Palace Resort'},{time:'19:00',act:'Welcome Dinner at Locavore'}]},
        {day:2,title:'Ubud Exploration',activities:[{time:'09:00',act:'Tegallalang Rice Terraces'},{time:'12:00',act:'Lunch at Warung Babi Guling'},{time:'15:00',act:'Monkey Forest Sanctuary'},{time:'19:00',act:'Kecak Dance Show'}]},
        {day:3,title:'Temple & Spa Day',activities:[{time:'08:00',act:'Sunrise at Mount Batur'},{time:'13:00',act:'Besakih Mother Temple'},{time:'16:00',act:'Balinese Spa & Massage'}]},
      ].map(d=>`
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:12px;overflow:hidden">
          <div style="padding:12px 16px;background:rgba(99,102,241,0.08);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
            <span style="background:var(--accent);color:white;font-size:11px;font-weight:700;padding:3px 10px;border-radius:var(--radius-full)">Day ${d.day}</span>
            <span style="font-size:14px;font-weight:600;color:var(--text-primary)">${d.title}</span>
          </div>
          <div style="padding:12px 16px;display:flex;flex-direction:column;gap:8px">
            ${d.activities.map(a=>`
              <div style="display:flex;align-items:center;gap:12px;padding:10px;background:rgba(255,255,255,0.03);border-radius:var(--radius-md);border:1px solid var(--border)">
                <span style="font-size:12px;font-weight:700;color:var(--accent);min-width:46px">${a.time}</span>
                <span style="font-size:13px;color:var(--text-primary)">${a.act}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
      <button class="btn btn-primary mt-3">+ Add Day</button>
    </div>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.bookings = {
  label:'Booking Manager',
  render(biz) {
    const bookings = DB.bget(biz.id,'bookings');
    const sColors={Confirmed:'success',Pending:'warning',Cancelled:'danger',Completed:'muted','On Trip':'info'};
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🎫 Booking Manager</h2><p>${bookings.length} bookings tracked</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ New Booking</button></div>
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Customer</th><th>Package</th><th>Travel Date</th><th>Pax</th><th>Amount</th><th>Paid</th><th>Hotel</th><th>Visa</th><th>Status</th></tr></thead>
    <tbody>${bookings.map(b=>`<tr>
      <td>${escHtml(b.customer)}</td>
      <td><div style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(b.package)}</div></td>
      <td>${fmtDateShort(b.travelDate)}</td>
      <td style="text-align:center">${b.pax}</td>
      <td style="color:var(--text-primary);font-weight:700">${fmtINR(b.amount)}</td>
      <td style="color:var(--success)">${fmtINR(b.paid)}</td>
      <td style="font-size:12px">${escHtml(b.hotel||'—')}</td>
      <td><span class="badge badge-${b.visa==='Approved'?'success':b.visa==='Pending'?'warning':b.visa==='Applied'?'info':'muted'}">${b.visa||'—'}</span></td>
      <td><span class="badge badge-${sColors[b.status]||'muted'}">${b.status}</span></td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.packages = {
  label:'Package Catalog',
  render(biz) {
    const pkgs = DB.bget(biz.id,'packages');
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🌴 Package Catalog</h2><p>${pkgs.length} tour packages</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Add Package</button></div>
  </div>
  <div class="grid-3">
    ${pkgs.map(p=>`
    <div class="pkg-card">
      <div class="pkg-card-thumb">${p.emoji||'🌍'}</div>
      <div class="pkg-card-body">
        <div class="pkg-card-name">${escHtml(p.name)}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">📍 ${escHtml(p.dest||'')} • ${p.days} Days • ${p.pax} Pax</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div class="pkg-card-price">${fmtINR(p.price)}<span style="font-size:11px;color:var(--text-muted);font-weight:400">/person</span></div>
          <button class="btn btn-primary btn-sm">Book Now</button>
        </div>
      </div>
    </div>`).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.visa = {
  label:'Visa Tracker',
  render(biz) {
    const bookings = DB.bget(biz.id,'bookings');
    const visaData = bookings.filter(b=>b.visa);
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>📋 Visa Tracker</h2><p>Track visa status for all customers</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Add Application</button></div>
  </div>
  <div class="kpi-grid mb-4">
    ${[{l:'Approved',v:visaData.filter(b=>b.visa==='Approved').length,c:'#10B981',i:'✅'},{l:'Pending',v:visaData.filter(b=>b.visa==='Pending').length,c:'#F59E0B',i:'⏳'},{l:'Applied',v:visaData.filter(b=>b.visa==='Applied').length,c:'#3B82F6',i:'📤'},{l:'Not Required',v:visaData.filter(b=>b.visa==='Not Required').length,c:'#6366F1',i:'ℹ️'}].map(k=>`
    <div class="kpi-card" style="--kpi-color:${k.c}"><div class="kpi-icon">${k.i}</div><div class="kpi-value">${k.v}</div><div class="kpi-label">${k.l}</div></div>`).join('')}
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Customer</th><th>Destination</th><th>Travel Date</th><th>Visa Status</th><th>Documents</th><th>Action</th></tr></thead>
    <tbody>${visaData.map(b=>`<tr>
      <td>${escHtml(b.customer)}</td>
      <td>${escHtml(b.package)}</td>
      <td>${fmtDate(b.travelDate)}</td>
      <td><span class="badge badge-${b.visa==='Approved'?'success':b.visa==='Pending'?'warning':'info'}">${b.visa}</span></td>
      <td>${['Passport ✅','Photo ✅','Bank Statement ⏳'].join(' ')}</td>
      <td><button class="btn btn-sm btn-secondary">Update</button></td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.groups = {
  label:'Group Tours',
  render(biz) {
    const grps = [
      {name:'Thailand Group Dec 2025',pax:24,seats:30,dep:'2025-12-20',price:55000,status:'Filling Fast',lead:'Ramesh Kumar'},
      {name:'Kerala Backwaters Jan 2026',pax:12,seats:20,dep:'2026-01-10',price:32000,status:'Open',lead:'Priya Sharma'},
      {name:'Rajasthan Heritage Feb 2026',pax:18,seats:18,dep:'2026-02-05',price:42000,status:'Full',lead:'Suresh Patel'},
    ];
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>👨‍👩‍👧‍👦 Group Tours</h2><p>Manage group bookings & manifests</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Create Group Tour</button></div>
  </div>
  <div class="grid-3">
    ${grps.map(g=>`
    <div class="card" style="padding:0;overflow:hidden">
      <div style="height:6px;background:${g.status==='Full'?'var(--success)':g.status==='Filling Fast'?'var(--warning)':'var(--info)'}"></div>
      <div style="padding:18px">
        <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:8px">${escHtml(g.name)}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">✈️ ${fmtDate(g.dep)} &nbsp;•&nbsp; Lead: ${g.lead}</div>
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px">
            <span>Seats Filled</span><span>${g.pax}/${g.seats}</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${Math.round(g.pax/g.seats*100)}%"></div></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:700;color:var(--success)">${fmtINR(g.price)}<span style="font-size:11px;color:var(--text-muted);font-weight:400">/person</span></div>
          <span class="badge badge-${g.status==='Full'?'success':g.status==='Filling Fast'?'warning':'info'}">${g.status}</span>
        </div>
        <button class="btn btn-secondary btn-sm w-full mt-3">View Manifest</button>
      </div>
    </div>`).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.suppliers = {
  label:'Supplier Directory',
  render(biz) {
    const suppliers=[
      {name:'Marriott Hotels',category:'Hotels',rating:5,contact:'98765-12345',cities:'Pan India',deals:'15% Corporate'},
      {name:'IndiGo Airlines',category:'Airlines',rating:4,contact:'011-234-5678',cities:'All Routes',deals:'Bulk Fares'},
      {name:'Meru Cabs',category:'Transport',rating:4,contact:'44422-11111',cities:'Metro Cities',deals:'10% Commission'},
      {name:'Tata Tours Guide',category:'Guides',rating:5,contact:'99887-65432',cities:'Rajasthan',deals:'Preferred Partner'},
      {name:'Thomas Cook',category:'Visa Agent',rating:4,contact:'98000-11234',cities:'All',deals:'Sub-agent'},
    ];
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🏨 Supplier Directory</h2><p>Hotels, airlines, guides & partners</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Add Supplier</button></div>
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Name</th><th>Category</th><th>Rating</th><th>Contact</th><th>Cities</th><th>Deal</th><th>Actions</th></tr></thead>
    <tbody>${suppliers.map(s=>`<tr>
      <td>${escHtml(s.name)}</td>
      <td><span class="badge badge-primary">${s.category}</span></td>
      <td>${'⭐'.repeat(s.rating)}</td>
      <td style="font-family:monospace;font-size:12px">${s.contact}</td>
      <td>${s.cities}</td>
      <td><span class="badge badge-success">${s.deals}</span></td>
      <td><button class="btn btn-icon btn-sm">✏️</button></td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

// =============================================
// ===== LOGISTICS MODULES ==================
// =============================================
Modules.shipments = {
  label:'Shipment Tracker',
  render(biz) {
    const shipments = DB.bget(biz.id,'shipments');
    const steps=['Booked','Pickup','In Transit','At Hub','Out for Delivery','Delivered'];
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🚛 Shipment Tracker</h2><p>${shipments.length} active shipments</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ New Shipment</button></div>
  </div>
  ${shipments.map(s=>`
  <div class="shipment-row">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--text-primary)">${escHtml(s.shipId)} — ${escHtml(s.customer)}</div>
        <div style="font-size:12px;color:var(--text-muted)">📍 ${escHtml(s.from)} → ${escHtml(s.to)} &nbsp;•&nbsp; ${s.weight} &nbsp;•&nbsp; ${s.items} &nbsp;•&nbsp; 🚗 ${escHtml(s.vehicle)}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700;color:var(--success)">${fmtINR(s.amount)}</div>
        <div style="font-size:11px;color:var(--text-muted)">Due ${fmtDateShort(s.deliveryDate)}</div>
      </div>
    </div>
    <div class="shipment-steps" style="margin-top:14px">
      ${steps.map((st,i)=>`
        <div class="step-dot ${i<s.statusIdx?'done':i===s.statusIdx?'active':''}">${i<s.statusIdx?'✓':i+1}</div>
        ${i<steps.length-1?`<div class="step-line ${i<s.statusIdx?'done':''}"></div>`:''}
      `).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:8px">
      ${steps.map((st,i)=>`<span style="font-size:9px;color:${i===s.statusIdx?'var(--accent)':'var(--text-muted)'};font-weight:${i===s.statusIdx?700:400}">${st}</span>`).join('')}
    </div>
  </div>`).join('')}
</div>`;
  },
  init(biz) {}
};

Modules.moveplanner = {
  label:'Move Planner',
  render(biz) {
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🗂️ Move Planner</h2><p>Plan and schedule customer moves</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ New Move Plan</button></div>
  </div>
  <div class="grid-2">
    ${DB.bget(biz.id,'shipments').slice(0,4).map((s,i)=>`
    <div class="card" style="padding:20px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div style="width:44px;height:44px;border-radius:12px;background:rgba(245,158,11,0.12);display:flex;align-items:center;justify-content:center;font-size:20px">🏠</div>
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text-primary)">${escHtml(s.customer)}</div>
          <div style="font-size:12px;color:var(--text-muted)">${escHtml(s.from)} → ${escHtml(s.to)}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        ${[['Pickup Date',fmtDate(s.pickupDate)],['Delivery',fmtDate(s.deliveryDate)],['Items',s.items],['Driver',s.driver]].map(([l,v])=>`
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:10px">
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">${l}</div>
          <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-top:2px">${v}</div>
        </div>`).join('')}
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary btn-sm" style="flex:1">View Survey</button>
        <button class="btn btn-primary btn-sm" style="flex:1">Update Status</button>
      </div>
    </div>`).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.fleet = {
  label:'Fleet Manager',
  render(biz) {
    const fleet = DB.bget(biz.id,'fleet');
    const sColors={Available:'success','On Trip':'info',Maintenance:'warning',Idle:'muted'};
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🚗 Fleet Manager</h2><p>${fleet.length} vehicles registered</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Add Vehicle</button></div>
  </div>
  <div class="kpi-grid mb-4">
    ${['Available','On Trip','Maintenance','Idle'].map((s,i)=>{
      const c=[fleet.filter(f=>f.status===s).length];
      const colors=['#10B981','#3B82F6','#F59E0B','#6366F1'];
      return `<div class="kpi-card" style="--kpi-color:${colors[i]}"><div class="kpi-icon">${['✅','🚛','🔧','💤'][i]}</div><div class="kpi-value">${fleet.filter(f=>f.status===s).length}</div><div class="kpi-label">${s}</div></div>`;
    }).join('')}
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Reg No.</th><th>Type</th><th>Driver</th><th>Phone</th><th>Status</th><th>Last Service</th><th>Next Service</th></tr></thead>
    <tbody>${fleet.map(v=>`<tr>
      <td style="font-family:monospace;color:var(--accent)">${escHtml(v.regNo)}</td>
      <td>${escHtml(v.type)}</td>
      <td>${escHtml(v.driver)}</td>
      <td style="font-size:12px">${escHtml(v.driverPhone)}</td>
      <td><span class="badge badge-${sColors[v.status]||'muted'}">${v.status}</span></td>
      <td>${fmtDate(v.lastService)}</td>
      <td style="color:${daysUntil(v.nextService)<7?'var(--danger)':'var(--text-secondary)'}">${fmtDate(v.nextService)}</td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.inventory = {
  label:'Inventory Checklist',
  render(biz) {
    const items=[
      {cat:'Furniture',items:['Sofa Set (1)','Dining Table (1)','Bed King Size (1)','Wardrobe (2)','TV Unit (1)','Study Table (1)']},
      {cat:'Electronics',items:['LED TV 55" (1)','Refrigerator 250L (1)','Washing Machine (1)','Microwave (1)','AC 1.5T (2)']},
      {cat:'Kitchen',items:['Utensils Set (1 box)','Mixer Grinder (1)','Water Purifier (1)','Gas Cylinder (2)']},
      {cat:'Miscellaneous',items:['Clothing (8 bags)','Books (4 cartons)','Decor Items (2 boxes)','Documents (1 bag)']},
    ];
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>📝 Inventory Checklist</h2><p>Items being moved — condition & count</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ New Checklist</button></div>
  </div>
  <div class="card mb-4">
    <div class="card-header">
      <div><div class="card-title">Move Checklist — Ramesh Kumar</div><div class="card-subtitle">Bhubaneswar → Cuttack • 24 items total</div></div>
      <button class="btn btn-secondary btn-sm">Print PDF</button>
    </div>
    <div class="card-body">
      <div class="grid-2">
        ${items.map(cat=>`
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">${cat.cat}</div>
          ${cat.items.map((item,i)=>`
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
            <input type="checkbox" ${i%3!==2?'checked':''} style="accent-color:var(--accent)">
            <span style="font-size:13px;color:var(--text-primary);flex:1">${item}</span>
            <span class="badge badge-${i%3===0?'success':i%3===1?'warning':'muted'}">${i%3===0?'Good':i%3===1?'Fair':'Check'}</span>
          </div>`).join('')}
        </div>`).join('')}
      </div>
    </div>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.ratecalc = {
  label:'Rate Calculator',
  render(biz) {
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>💰 Rate Calculator</h2><p>Estimate move costs instantly</p></div>
  </div>
  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title">Move Cost Estimator</div></div>
      <div class="card-body">
        <div class="form-field"><label class="form-label">From City</label><select class="form-select"><option>Bhubaneswar</option><option>Cuttack</option><option>Rourkela</option><option>Puri</option></select></div>
        <div class="form-field"><label class="form-label">To City</label><select class="form-select"><option>Kolkata</option><option>Hyderabad</option><option>Bengaluru</option><option>Mumbai</option></select></div>
        <div class="form-field"><label class="form-label">Volume (cubic feet)</label><input class="form-input" type="number" value="400" id="calcVolume"></div>
        <div class="form-field"><label class="form-label">Move Type</label><select class="form-select"><option>Residential</option><option>Commercial</option><option>Office</option></select></div>
        <div class="form-field"><label class="form-label">Vehicle Type</label><select class="form-select"><option>Mini Truck (1T)</option><option>Tempo (2T)</option><option>Truck (5T)</option></select></div>
        <button class="btn btn-primary w-full" onclick="App.calcRate()">Calculate Estimate</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Estimate Breakdown</div></div>
      <div class="card-body" id="calcResult">
        ${['Base Transport','Packing Materials','Loading & Unloading','Insurance (0.5%)','GST (18%)'].map((item,i)=>{
          const amounts=[12000,3500,4000,100,3510];
          return `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:13px;color:var(--text-secondary)">${item}</span>
            <span style="font-size:13px;font-weight:600;color:var(--text-primary)">${fmtINR(amounts[i])}</span>
          </div>`;
        }).join('')}
        <div style="display:flex;justify-content:space-between;padding:14px 0;margin-top:4px">
          <span style="font-size:15px;font-weight:700;color:var(--text-primary)">Total Estimate</span>
          <span style="font-size:18px;font-weight:800;color:var(--success);font-family:'Outfit',sans-serif">${fmtINR(23110)}</span>
        </div>
        <button class="btn btn-primary w-full">Generate Quote</button>
      </div>
    </div>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.pod = {
  label:'POD Manager',
  render(biz) {
    const shipments = DB.bget(biz.id,'shipments');
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>✍️ POD Manager</h2><p>Proof of Delivery — digital records</p></div>
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Shipment ID</th><th>Customer</th><th>Delivery Date</th><th>Delivered By</th><th>POD Status</th><th>Action</th></tr></thead>
    <tbody>${shipments.map(s=>`<tr>
      <td style="color:var(--accent);font-family:monospace">${escHtml(s.shipId)}</td>
      <td>${escHtml(s.customer)}</td>
      <td>${fmtDate(s.deliveryDate)}</td>
      <td>${escHtml(s.driver)}</td>
      <td><span class="badge badge-${s.statusIdx>=5?'success':s.statusIdx>=4?'info':'warning'}">${s.statusIdx>=5?'Received':s.statusIdx>=4?'Pending Signature':'Not Delivered'}</span></td>
      <td><button class="btn btn-sm btn-secondary">View POD</button></td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

// =============================================
// ===== AGENCY MODULES ====================
// =============================================
Modules.projects = {
  label:'Project Manager',
  render(biz) {
    const projects = DB.bget(biz.id,'projects');
    const sColors={Planning:'muted','In Progress':'info','On Hold':'warning',Completed:'success',Cancelled:'danger'};
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🎯 Project Manager</h2><p>${projects.length} projects • ${projects.filter(p=>p.status==='In Progress').length} active</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ New Project</button></div>
  </div>
  <div class="grid-2">
    ${projects.map(p=>`
    <div class="project-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
        <div>
          <div class="project-card-title">${escHtml(p.name)}</div>
          <div class="project-card-meta">👤 ${escHtml(p.client)} &nbsp;•&nbsp; 🏷️ ${escHtml(p.type||'')}</div>
        </div>
        <span class="badge badge-${sColors[p.status]||'muted'}">${p.status}</span>
      </div>
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px">
          <span>Progress</span><span>${p.progress}%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${p.progress}%"></div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">
        ${[['Budget',fmtINR(p.budget)],['Spent',fmtINR(p.spent)],['Due',fmtDateShort(p.dueDate)]].map(([l,v])=>`
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:10px;color:var(--text-muted)">${l}</div>
          <div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-top:2px">${v}</div>
        </div>`).join('')}
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-secondary btn-sm" style="flex:1">📋 Tasks</button>
        <button class="btn btn-primary btn-sm" style="flex:1">View Project</button>
      </div>
    </div>`).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.retainers = {
  label:'Retainer Tracker',
  render(biz) {
    const retainers = [
      {client:'Apex Fintech',hours:40,used:28,amount:80000,status:'Active',renewal:'2025-07-01'},
      {client:'BuildTech India',hours:30,used:30,amount:60000,status:'Hours Exhausted',renewal:'2025-06-15'},
      {client:'Orbis Infra',hours:20,used:12,amount:45000,status:'Active',renewal:'2025-08-01'},
      {client:'HealthFirst App',hours:50,used:15,amount:120000,status:'Active',renewal:'2025-09-01'},
    ];
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🔄 Retainer Tracker</h2><p>${retainers.filter(r=>r.status==='Active').length} active retainers</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Add Retainer</button></div>
  </div>
  <div class="grid-2">
    ${retainers.map(r=>`
    <div class="card" style="padding:20px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px">
        <div>
          <div style="font-size:15px;font-weight:700;color:var(--text-primary)">${escHtml(r.client)}</div>
          <div style="font-size:12px;color:var(--text-muted)">Renewal: ${fmtDate(r.renewal)}</div>
        </div>
        <span class="badge badge-${r.status==='Active'?'success':'danger'}">${r.status}</span>
      </div>
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px">
          <span>Hours Used</span><span>${r.used} / ${r.hours} hrs</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${Math.round(r.used/r.hours*100)}%;background:${r.used>=r.hours?'var(--danger)':'linear-gradient(90deg,var(--accent),var(--accent2))'}"></div>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-family:'Outfit',sans-serif;font-size:20px;font-weight:700;color:var(--text-primary)">${fmtINR(r.amount)}<span style="font-size:12px;color:var(--text-muted);font-weight:400">/mo</span></div>
        <button class="btn btn-secondary btn-sm">Log Hours</button>
      </div>
    </div>`).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.campaigns = {
  label:'Campaign Manager',
  render(biz) {
    const campaigns = DB.bget(biz.id,'campaigns');
    const sColors={Active:'success',Paused:'warning',Completed:'muted',Draft:'info'};
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>📣 Campaign Manager</h2><p>${campaigns.length} campaigns tracked</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ New Campaign</button></div>
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Campaign</th><th>Channel</th><th>Client</th><th>Status</th><th>Budget</th><th>Spent</th><th>Impressions</th><th>Leads</th><th>ROI</th></tr></thead>
    <tbody>${campaigns.map(c=>{
      const roi = c.spent>0?Math.round((c.leads*3000-c.spent)/c.spent*100):0;
      return `<tr>
        <td>${escHtml(c.name)}</td>
        <td><span class="badge badge-primary">${c.channel}</span></td>
        <td>${escHtml(c.client)}</td>
        <td><span class="badge badge-${sColors[c.status]||'muted'}">${c.status}</span></td>
        <td>${fmtINR(c.budget)}</td>
        <td>${fmtINR(c.spent)}</td>
        <td>${(c.impressions||0).toLocaleString('en-IN')}</td>
        <td style="color:var(--success);font-weight:700">${c.leads}</td>
        <td style="color:${roi>0?'var(--success)':'var(--danger)'};font-weight:700">${roi>0?'+':''}${roi}%</td>
      </tr>`;
    }).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.timetracker = {
  label:'Time Tracker',
  render(biz) {
    const projects = DB.bget(biz.id,'projects');
    const logs = [
      {proj:'Website Redesign',user:'Ranjit Sahoo',date:'2025-06-01',hours:3.5,desc:'Homepage design and wireframing',billable:true},
      {proj:'SEO Campaign Q3',user:'Priya Mohanty',date:'2025-06-01',hours:2.0,desc:'Keyword research and competitor analysis',billable:true},
      {proj:'Social Media Retainer',user:'Suresh Kumar',date:'2025-05-31',hours:4.5,desc:'Content calendar planning',billable:true},
      {proj:'Website Redesign',user:'Ranjit Sahoo',date:'2025-05-31',hours:5.0,desc:'Backend API development',billable:true},
      {proj:'Brand Identity Pack',user:'Priya Mohanty',date:'2025-05-30',hours:6.0,desc:'Logo design iterations',billable:false},
    ];
    const total = logs.reduce((a,b)=>a+b.hours,0);
    const billable = logs.filter(l=>l.billable).reduce((a,b)=>a+b.hours,0);
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>⏱️ Time Tracker</h2><p>${total.toFixed(1)} hours logged this week</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Log Time</button></div>
  </div>
  <div class="kpi-grid mb-4">
    <div class="kpi-card" style="--kpi-color:#6366F1"><div class="kpi-icon">⏱️</div><div class="kpi-value">${total.toFixed(0)}h</div><div class="kpi-label">Total Hours</div></div>
    <div class="kpi-card" style="--kpi-color:#10B981"><div class="kpi-icon">💰</div><div class="kpi-value">${billable.toFixed(0)}h</div><div class="kpi-label">Billable Hours</div></div>
    <div class="kpi-card" style="--kpi-color:#F59E0B"><div class="kpi-icon">📊</div><div class="kpi-value">${Math.round(billable/total*100)}%</div><div class="kpi-label">Billable Rate</div></div>
    <div class="kpi-card" style="--kpi-color:#EC4899"><div class="kpi-icon">💵</div><div class="kpi-value">${fmtINR(billable*1500)}</div><div class="kpi-label">Revenue (₹1500/hr)</div></div>
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Project</th><th>Team Member</th><th>Date</th><th>Hours</th><th>Description</th><th>Billable</th></tr></thead>
    <tbody>${logs.map(l=>`<tr>
      <td>${escHtml(l.proj)}</td>
      <td>${escHtml(l.user)}</td>
      <td>${fmtDate(l.date)}</td>
      <td style="color:var(--accent);font-weight:700">${l.hours}h</td>
      <td style="font-size:12px;color:var(--text-secondary)">${escHtml(l.desc)}</td>
      <td><span class="badge badge-${l.billable?'success':'muted'}">${l.billable?'Yes':'No'}</span></td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.contracts = {
  label:'SOW & Contracts',
  render(biz) {
    const contracts=[
      {client:'Apex Fintech',type:'SOW',title:'Mobile App Development',value:350000,status:'Signed',date:'2025-04-15',exp:'2025-09-30'},
      {client:'BuildTech India',type:'Retainer',title:'Digital Marketing Services',value:80000,status:'Active',date:'2025-03-01',exp:'2025-08-31'},
      {client:'Orbis Infra',type:'Project',title:'Brand Identity & Website',value:150000,status:'Pending Signature',date:'2025-05-20',exp:'2025-07-20'},
      {client:'HealthFirst App',type:'SOW',title:'UI/UX Design & Development',value:280000,status:'Draft',date:'2025-06-01',exp:'2025-11-30'},
    ];
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>📄 SOW & Contracts</h2><p>${contracts.length} contracts</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ New Contract</button></div>
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Client</th><th>Type</th><th>Title</th><th>Value</th><th>Status</th><th>Start</th><th>End</th><th>Action</th></tr></thead>
    <tbody>${contracts.map(c=>`<tr>
      <td>${escHtml(c.client)}</td>
      <td><span class="badge badge-primary">${c.type}</span></td>
      <td>${escHtml(c.title)}</td>
      <td style="font-weight:700;color:var(--text-primary)">${fmtINR(c.value)}</td>
      <td><span class="badge badge-${c.status==='Signed'||c.status==='Active'?'success':c.status==='Draft'?'muted':'warning'}">${c.status}</span></td>
      <td>${fmtDate(c.date)}</td>
      <td>${fmtDate(c.exp)}</td>
      <td><div style="display:flex;gap:6px">
        <button class="btn btn-sm btn-secondary">View</button>
        <button class="btn btn-sm btn-primary">Sign</button>
      </div></td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

// =============================================
// ===== FINANCE MODULES ===================
// =============================================
Modules.cases = {
  label:'Case Manager',
  render(biz) {
    const cases = DB.bget(biz.id,'cases');
    const sColors={Open:'info','In Progress':'primary','Pending Docs':'warning',Filed:'success',Closed:'muted'};
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>📁 Case Manager</h2><p>${cases.length} cases • ${cases.filter(c=>c.status==='Open'||c.status==='In Progress').length} active</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ New Case</button></div>
  </div>
  <div class="kpi-grid mb-4">
    ${['Open','In Progress','Pending Docs','Filed'].map((s,i)=>{
      const icons=['📂','⚙️','📎','✅'];
      const colors=['#3B82F6','#6366F1','#F59E0B','#10B981'];
      return `<div class="kpi-card" style="--kpi-color:${colors[i]}"><div class="kpi-icon">${icons[i]}</div><div class="kpi-value">${cases.filter(c=>c.status===s).length}</div><div class="kpi-label">${s}</div></div>`;
    }).join('')}
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Client</th><th>Case Type</th><th>FY</th><th>Status</th><th>Due Date</th><th>Fee</th><th>Paid</th><th>Assignee</th></tr></thead>
    <tbody>${cases.map(c=>`<tr>
      <td>${escHtml(c.client)}</td>
      <td><span class="badge badge-primary">${c.type}</span></td>
      <td>${c.fy}</td>
      <td><span class="badge badge-${sColors[c.status]||'muted'}">${c.status}</span></td>
      <td style="color:${daysUntil(c.dueDate)<3?'var(--danger)':'var(--text-secondary)'}">${fmtDate(c.dueDate)}</td>
      <td>${fmtINR(c.fee)}</td>
      <td><span class="badge badge-${c.feePaid?'success':'danger'}">${c.feePaid?'Paid':'Pending'}</span></td>
      <td>${escHtml(c.assignee)}</td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.loanpipeline = {
  label:'Loan Pipeline',
  render(biz) {
    const loans = DB.bget(biz.id,'loans');
    const stageLabels=['Applied','Docs Collected','Sanctioned','Disbursed','Rejected'];
    const stageColors=['#6366F1','#F59E0B','#3B82F6','#10B981','#EF4444'];
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>💳 Loan Pipeline</h2><p>${loans.length} loan applications</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ New Application</button></div>
  </div>
  <div class="kanban-board">
    ${stageLabels.map((stage,si)=>{
      const stageLoanList = loans.filter(l=>l.stage===stage);
      return `
      <div class="kanban-col">
        <div class="kanban-col-header" style="border-top:3px solid ${stageColors[si]}">
          <span class="kanban-col-title">${stage}</span>
          <span class="kanban-col-count">${stageLoanList.length}</span>
        </div>
        <div class="kanban-col-body">
          ${stageLoanList.map(l=>`
          <div class="deal-card" style="--deal-color:${stageColors[si]}">
            <div class="deal-card-name">${escHtml(l.applicant)}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">🏦 ${l.bank} &nbsp;•&nbsp; ${l.type}</div>
            <div class="deal-card-meta">
              <span class="deal-card-value">${fmtINR(l.amount)}</span>
              <span style="font-size:11px">${fmtDateShort(l.appliedDate)}</span>
            </div>
          </div>`).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.docvault = {
  label:'Document Vault',
  render(biz) {
    const contacts = DB.bget(biz.id,'contacts');
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🔒 Document Vault</h2><p>Secure client document storage</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Upload Document</button></div>
  </div>
  <div class="grid-2">
    ${contacts.slice(0,6).map(c=>`
    <div class="card" style="padding:18px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div class="avatar" style="background:${randomColor(c.name)}">${initials(c.name)}</div>
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text-primary)">${escHtml(c.name)}</div>
          <div style="font-size:12px;color:var(--text-muted)">${escHtml(c.phone||'')}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${[['PAN Card','✅ Verified'],['Aadhaar Card','✅ Verified'],['ITR Copy','⏳ Pending'],['Bank Statement','✅ Uploaded'],['Form 16','❌ Missing']].map(([doc,status])=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--bg-card);border:1px solid var(--border);border-radius:8px">
          <span style="font-size:12px;color:var(--text-secondary)">📄 ${doc}</span>
          <span style="font-size:11px;font-weight:600;color:${status.startsWith('✅')?'var(--success)':status.startsWith('⏳')?'var(--warning)':'var(--danger)'}">${status}</span>
        </div>`).join('')}
      </div>
    </div>`).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.compliance = {
  label:'Compliance Calendar',
  render(biz) {
    const deadlines = DB.bget(biz.id,'compliance');
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>📅 Compliance Calendar</h2><p>Never miss a filing deadline</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Add Deadline</button></div>
  </div>
  <div class="kpi-grid mb-4">
    <div class="kpi-card" style="--kpi-color:#EF4444"><div class="kpi-icon">🔴</div><div class="kpi-value">${deadlines.filter(d=>d.urgency==='urgent').length}</div><div class="kpi-label">Urgent (< 7 days)</div></div>
    <div class="kpi-card" style="--kpi-color:#F59E0B"><div class="kpi-icon">🟡</div><div class="kpi-value">${deadlines.filter(d=>d.urgency==='soon').length}</div><div class="kpi-label">Coming Soon</div></div>
    <div class="kpi-card" style="--kpi-color:#10B981"><div class="kpi-icon">🟢</div><div class="kpi-value">${deadlines.filter(d=>d.urgency==='ok').length}</div><div class="kpi-label">On Track</div></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
    ${deadlines.map(d=>{
      const days = daysUntil(d.dueDate);
      return `<div class="deadline-card ${d.urgency}">
        <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px">${d.type}</div>
        <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:8px">${d.title}</div>
        <div style="font-size:13px;color:var(--text-secondary)">📅 ${fmtDate(d.dueDate)}</div>
        <div style="font-size:12px;font-weight:700;margin-top:6px;color:${d.urgency==='urgent'?'var(--danger)':d.urgency==='soon'?'var(--warning)':'var(--success)'}">
          ${days<0?`${Math.abs(days)} days overdue`:days===0?'Due today':`${days} days left`}
        </div>
      </div>`;
    }).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.fees = {
  label:'Fee Tracker',
  render(biz) {
    const cases = DB.bget(biz.id,'cases');
    const total = cases.reduce((a,b)=>a+(b.fee||0),0);
    const paid  = cases.filter(c=>c.feePaid).reduce((a,b)=>a+(b.fee||0),0);
    const due   = total - paid;
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>💵 Fee Tracker</h2><p>Professional fees collection</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Record Payment</button></div>
  </div>
  <div class="kpi-grid mb-4">
    <div class="kpi-card" style="--kpi-color:#10B981"><div class="kpi-icon">✅</div><div class="kpi-value">${fmtINR(paid)}</div><div class="kpi-label">Collected</div></div>
    <div class="kpi-card" style="--kpi-color:#EF4444"><div class="kpi-icon">⏳</div><div class="kpi-value">${fmtINR(due)}</div><div class="kpi-label">Pending</div></div>
    <div class="kpi-card" style="--kpi-color:#6366F1"><div class="kpi-icon">💼</div><div class="kpi-value">${fmtINR(total)}</div><div class="kpi-label">Total Billed</div></div>
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Client</th><th>Service</th><th>Fee</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${cases.map(c=>`<tr>
      <td>${escHtml(c.client)}</td>
      <td>${escHtml(c.type)}</td>
      <td style="font-weight:700;color:var(--text-primary)">${fmtINR(c.fee)}</td>
      <td><span class="badge badge-${c.feePaid?'success':'danger'}">${c.feePaid?'Paid':'Due'}</span></td>
      <td><button class="btn btn-sm ${c.feePaid?'btn-secondary':'btn-success'}">${c.feePaid?'View Receipt':'Collect Fee'}</button></td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.referrals = {
  label:'Referral Network',
  render(biz) {
    const refs=[
      {from:'CA Deepak Mishra',referred:'Ramesh Kumar',type:'ITR Filing',fee:8000,commission:800,status:'Closed'},
      {from:'Bank Manager Patra',referred:'Sunita Das',type:'Business Loan',fee:15000,commission:2250,status:'In Progress'},
      {from:'CA Deepak Mishra',referred:'Anjali Singh',type:'GST Registration',fee:5000,commission:500,status:'Closed'},
      {from:'Advocate Rout',referred:'Vikram Nair',type:'Audit',fee:25000,commission:2500,status:'Open'},
    ];
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🤝 Referral Network</h2><p>Track referrals and commissions</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Log Referral</button></div>
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Referred By</th><th>Client</th><th>Service</th><th>Fees</th><th>Commission (10%)</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${refs.map(r=>`<tr>
      <td style="color:var(--accent)">${escHtml(r.from)}</td>
      <td>${escHtml(r.referred)}</td>
      <td>${escHtml(r.type)}</td>
      <td>${fmtINR(r.fee)}</td>
      <td style="color:var(--success);font-weight:700">${fmtINR(r.commission)}</td>
      <td><span class="badge badge-${r.status==='Closed'?'success':r.status==='Open'?'info':'warning'}">${r.status}</span></td>
      <td><button class="btn btn-sm btn-secondary">Pay Commission</button></td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

// =============================================
// ===== CONSTRUCTION MODULES ==============
// =============================================
Modules.sites = {
  label:'Site Tracker',
  render(biz) {
    const sites = DB.bget(biz.id,'sites');
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🏗️ Site / Project Tracker</h2><p>${sites.length} sites • ${sites.filter(s=>!['Completed','Handover'].includes(s.status)).length} active</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Add Site</button></div>
  </div>
  <div class="grid-3">
    ${sites.map(s=>`
    <div class="site-card">
      <div class="site-thumb">${s.emoji||'🏗️'}</div>
      <div class="site-body">
        <div class="site-name">${escHtml(s.name)}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">📍 ${escHtml(s.location)} &nbsp;•&nbsp; 👤 ${escHtml(s.client)}</div>
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:5px">
            <span>${s.status}</span><span>${s.progress}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${s.progress}%"></div></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:12px">
          <span>Budget: <strong style="color:var(--text-primary)">${fmtINR(s.budget)}</strong></span>
          <span>Spent: <strong style="color:${s.spent/s.budget>0.9?'var(--danger)':'var(--success)'}">${fmtINR(s.spent)}</strong></span>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">🏁 Target: ${fmtDate(s.completionDate)}</div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" style="flex:1">📋 Details</button>
          <button class="btn btn-primary btn-sm" style="flex:1">Update</button>
        </div>
      </div>
    </div>`).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.properties = {
  label:'Property Listings',
  render(biz) {
    const props = DB.bget(biz.id,'properties');
    const sColors={Available:'success',Reserved:'warning',Sold:'muted','Under Construction':'info'};
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🏠 Property Listings</h2><p>${props.length} properties • ${props.filter(p=>p.status==='Available').length} available</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Add Property</button></div>
  </div>
  <div class="grid-3">
    ${props.map(p=>`
    <div class="site-card">
      <div class="site-thumb" style="background:linear-gradient(135deg,rgba(20,184,166,0.15),rgba(99,102,241,0.1))">${p.emoji||'🏠'}</div>
      <div class="site-body">
        <div class="site-name">${escHtml(p.title)}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">📍 ${escHtml(p.location)}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          <span class="badge badge-muted">${p.area}</span>
          ${p.bhk?`<span class="badge badge-muted">${p.bhk}</span>`:''}
          <span class="badge badge-muted">${p.facing} Facing</span>
          ${p.parking?`<span class="badge badge-muted">🅿️ Parking</span>`:''}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:var(--success)">${fmtINR(p.price)}</div>
          <span class="badge badge-${sColors[p.status]||'muted'}">${p.status}</span>
        </div>
        <button class="btn btn-primary btn-sm w-full mt-3">View Details</button>
      </div>
    </div>`).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.procurement = {
  label:'Material Procurement',
  render(biz) {
    const pos=[
      {po:'PO-2025-001',material:'M-Sand (50 Tons)',vendor:'Sahoo Sand Supplies',qty:'50T',rate:4500,total:225000,status:'Delivered',order:'2025-05-15'},
      {po:'PO-2025-002',material:'Cement OPC 53 Grade',vendor:'UltraTech Cement',qty:'200 Bags',rate:380,total:76000,status:'In Transit',order:'2025-05-28'},
      {po:'PO-2025-003',material:'TMT Steel 500D',vendor:'SAIL Steel Odisha',qty:'5 MT',rate:58000,total:290000,status:'Ordered',order:'2025-06-01'},
      {po:'PO-2025-004',material:'Ceramic Tiles 2x2',vendor:'Kajaria Tiles',qty:'2000 sqft',rate:85,total:170000,status:'Delivered',order:'2025-04-20'},
    ];
    const sColors={Delivered:'success','In Transit':'info',Ordered:'warning',Cancelled:'danger'};
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🛒 Material Procurement</h2><p>${pos.length} purchase orders</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ New PO</button></div>
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>PO #</th><th>Material</th><th>Vendor</th><th>Qty</th><th>Total</th><th>Status</th><th>Order Date</th><th>Action</th></tr></thead>
    <tbody>${pos.map(po=>`<tr>
      <td style="color:var(--accent);font-family:monospace">${po.po}</td>
      <td>${escHtml(po.material)}</td>
      <td>${escHtml(po.vendor)}</td>
      <td>${po.qty}</td>
      <td style="font-weight:700;color:var(--text-primary)">${fmtINR(po.total)}</td>
      <td><span class="badge badge-${sColors[po.status]||'muted'}">${po.status}</span></td>
      <td>${fmtDate(po.order)}</td>
      <td><button class="btn btn-sm btn-secondary">View</button></td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.labour = {
  label:'Labour Manager',
  render(biz) {
    const workers=[
      {name:'Raju Behera',role:'Mason',daily:700,present:22,month:'May 2025',site:'3BHK Villa Patia'},
      {name:'Sunil Sahu',role:'Helper',daily:500,present:25,month:'May 2025',site:'Commercial Complex'},
      {name:'Pradip Nayak',role:'Electrician',daily:900,present:18,month:'May 2025',site:'Office Renovation'},
      {name:'Bharat Das',role:'Plumber',daily:800,present:20,month:'May 2025',site:'Apartment Block B'},
      {name:'Kiran Swain',role:'Painter',daily:600,present:24,month:'May 2025',site:'3BHK Villa Patia'},
    ];
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>👷 Labour Manager</h2><p>Attendance, wages & contractor payments</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Add Worker</button></div>
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Worker</th><th>Role</th><th>Site</th><th>Daily Rate</th><th>Days Present</th><th>Wages (May)</th><th>Status</th></tr></thead>
    <tbody>${workers.map(w=>`<tr>
      <td><div style="display:flex;align-items:center;gap:8px">
        <div class="avatar" style="background:${randomColor(w.name)};width:30px;height:30px;font-size:11px">${initials(w.name)}</div>
        <span>${escHtml(w.name)}</span>
      </div></td>
      <td><span class="badge badge-muted">${w.role}</span></td>
      <td style="font-size:12px">${escHtml(w.site)}</td>
      <td>${fmtINR(w.daily)}/day</td>
      <td style="text-align:center">${w.present}/26</td>
      <td style="font-weight:700;color:var(--success)">${fmtINR(w.daily*w.present)}</td>
      <td><span class="badge badge-${w.present>=22?'success':'warning'}">${w.present>=22?'Regular':'Irregular'}</span></td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.visits = {
  label:'Visit Scheduler',
  render(biz) {
    const contacts = DB.bget(biz.id,'contacts');
    const visits=[
      {client:contacts[0]?.name||'Ramesh Kumar',site:'3BHK Villa – Patia',date:new Date(Date.now()+2*86400000).toISOString().split('T')[0],time:'10:30 AM',type:'Site Inspection',agent:'Ranjit Sahoo',status:'Confirmed'},
      {client:contacts[1]?.name||'Priya Sharma',site:'Commercial Complex – Saheed Nagar',date:new Date(Date.now()+1*86400000).toISOString().split('T')[0],time:'3:00 PM',type:'Show Flat',agent:'Admin User',status:'Pending'},
      {client:contacts[2]?.name||'Suresh Patel',site:'Apartment Block B',date:new Date(Date.now()+5*86400000).toISOString().split('T')[0],time:'11:00 AM',type:'Follow-up',agent:'Priya Mohanty',status:'Confirmed'},
    ];
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>📅 Visit Scheduler</h2><p>Upcoming client site visits</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Schedule Visit</button></div>
  </div>
  <div style="display:flex;flex-direction:column;gap:12px">
    ${visits.map(v=>`
    <div class="card" style="padding:18px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:56px;height:56px;border-radius:12px;background:rgba(99,102,241,0.12);display:flex;flex-direction:column;align-items:center;justify-content:center">
            <div style="font-size:16px;font-weight:700;color:var(--accent)">${new Date(v.date).getDate()}</div>
            <div style="font-size:10px;color:var(--text-muted)">${new Date(v.date).toLocaleString('en',{month:'short'})}</div>
          </div>
          <div>
            <div style="font-size:14px;font-weight:700;color:var(--text-primary)">${escHtml(v.client)}</div>
            <div style="font-size:12px;color:var(--text-muted)">📍 ${escHtml(v.site)} &nbsp;•&nbsp; ⏰ ${v.time}</div>
            <div style="font-size:12px;color:var(--text-muted)">👤 Agent: ${v.agent} &nbsp;•&nbsp; 🏷️ ${v.type}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="badge badge-${v.status==='Confirmed'?'success':'warning'}">${v.status}</span>
          <button class="btn btn-secondary btn-sm">Reschedule</button>
          <button class="btn btn-primary btn-sm">View</button>
        </div>
      </div>
    </div>`).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.boq = {
  label:'BOQ / Estimation',
  render(biz) {
    const items=[
      {desc:'RCC Foundation',unit:'Sqft',qty:1200,rate:450,amt:540000},
      {desc:'Brick Masonry',unit:'Sqft',qty:2400,rate:180,amt:432000},
      {desc:'RCC Slab',unit:'Sqft',qty:1200,rate:280,amt:336000},
      {desc:'Plaster (Int+Ext)',unit:'Sqft',qty:5000,rate:60,amt:300000},
      {desc:'Flooring (Tiles)',unit:'Sqft',qty:1200,rate:120,amt:144000},
      {desc:'Electrical Works',unit:'LS',qty:1,rate:180000,amt:180000},
      {desc:'Plumbing Works',unit:'LS',qty:1,rate:120000,amt:120000},
      {desc:'Painting (2 coats)',unit:'Sqft',qty:4800,rate:45,amt:216000},
      {desc:'Doors & Windows',unit:'LS',qty:1,rate:250000,amt:250000},
      {desc:'Miscellaneous (5%)',unit:'LS',qty:1,rate:125900,amt:125900},
    ];
    const total = items.reduce((a,b)=>a+b.amt,0);
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>📐 BOQ / Estimation</h2><p>Bill of Quantities builder</p></div>
    <div class="page-header-actions">
      <button class="btn btn-secondary">Print PDF</button>
      <button class="btn btn-primary">+ New BOQ</button>
    </div>
  </div>
  <div class="card">
    <div class="card-header">
      <div><div class="card-title">3BHK Villa – Patia, Bhubaneswar (1200 sqft)</div><div class="card-subtitle">Client: Ramesh Kumar &nbsp;•&nbsp; Generated: ${fmtDate(new Date())}</div></div>
    </div>
    <div class="table-wrapper" style="border:none;border-radius:0">
      <table class="data-table">
        <thead><tr><th>#</th><th>Description</th><th>Unit</th><th>Qty</th><th>Rate (₹)</th><th>Amount (₹)</th></tr></thead>
        <tbody>
          ${items.map((it,i)=>`<tr>
            <td style="color:var(--text-muted)">${i+1}</td>
            <td>${escHtml(it.desc)}</td>
            <td>${it.unit}</td>
            <td style="text-align:center">${it.qty.toLocaleString('en-IN')}</td>
            <td style="text-align:right">${it.rate.toLocaleString('en-IN')}</td>
            <td style="text-align:right;font-weight:700;color:var(--text-primary)">${fmtINR(it.amt)}</td>
          </tr>`).join('')}
          <tr style="background:rgba(99,102,241,0.06)">
            <td colspan="5" style="text-align:right;font-size:15px;font-weight:700;color:var(--text-primary)">Grand Total</td>
            <td style="text-align:right;font-size:18px;font-weight:800;color:var(--success);font-family:'Outfit',sans-serif">${fmtINR(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>`;
  },
  init(biz) {}
};

// =============================================
// ===== PEST CONTROL MODULES ==============
// =============================================
Modules.jobs = {
  label:'Job Cards',
  render(biz) {
    const jobs = DB.bget(biz.id,'jobs');
    const sColors={Scheduled:'info','In Progress':'warning',Completed:'success',Cancelled:'danger'};
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>📋 Job Cards</h2><p>${jobs.length} jobs • ${jobs.filter(j=>j.status==='Scheduled').length} scheduled today</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ New Job</button></div>
  </div>
  <div class="kpi-grid mb-4">
    ${['Scheduled','In Progress','Completed','Cancelled'].map((s,i)=>{
      const icons=['📋','⚙️','✅','❌'];
      const colors=['#3B82F6','#F59E0B','#10B981','#EF4444'];
      return `<div class="kpi-card" style="--kpi-color:${colors[i]}"><div class="kpi-icon">${icons[i]}</div><div class="kpi-value">${jobs.filter(j=>j.status===s).length}</div><div class="kpi-label">${s}</div></div>`;
    }).join('')}
  </div>
  ${jobs.map(j=>`
  <div class="job-item">
    <div class="tech-avatar">${initials(j.technician)}</div>
    <div style="flex:1;overflow:hidden">
      <div style="font-size:13px;font-weight:700;color:var(--text-primary)">${escHtml(j.customer)} &nbsp;<span class="badge badge-primary">${j.pestType}</span></div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:2px">📍 ${escHtml(j.address)}</div>
      <div style="font-size:12px;color:var(--text-muted)">👨‍🔧 ${escHtml(j.technician)} &nbsp;•&nbsp; 🧪 ${j.chemical} &nbsp;•&nbsp; 📐 ${j.area}</div>
    </div>
    <div style="text-align:right;flex-shrink:0">
      <span class="badge badge-${sColors[j.status]||'muted'}">${j.status}</span>
      <div style="font-weight:700;color:var(--success);font-size:13px;margin-top:4px">${fmtINR(j.amount)}</div>
      <div style="font-size:11px;color:var(--text-muted)">📅 ${fmtDateShort(j.date)}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px">
      <button class="btn btn-icon btn-sm">✏️</button>
      <button class="btn btn-icon btn-sm">🖨️</button>
    </div>
  </div>`).join('')}
</div>`;
  },
  init(biz) {}
};

Modules.amc = {
  label:'AMC Contracts',
  render(biz) {
    const amcs = DB.bget(biz.id,'amc');
    const sColors={Active:'success',Expired:'danger','Due for Renewal':'warning'};
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🔄 AMC Contracts</h2><p>${amcs.length} contracts • ${amcs.filter(a=>a.status==='Active').length} active</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ New AMC</button></div>
  </div>
  <div class="kpi-grid mb-4">
    <div class="kpi-card" style="--kpi-color:#10B981"><div class="kpi-icon">✅</div><div class="kpi-value">${amcs.filter(a=>a.status==='Active').length}</div><div class="kpi-label">Active</div></div>
    <div class="kpi-card" style="--kpi-color:#F59E0B"><div class="kpi-icon">🔔</div><div class="kpi-value">${amcs.filter(a=>a.status==='Due for Renewal').length}</div><div class="kpi-label">Due Renewal</div></div>
    <div class="kpi-card" style="--kpi-color:#6366F1"><div class="kpi-icon">💰</div><div class="kpi-value">${fmtINR(amcs.filter(a=>a.status==='Active').reduce((s,a)=>s+(a.amount||0),0))}</div><div class="kpi-label">Active Value</div></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
    ${amcs.map(a=>`
    <div class="amc-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text-primary)">${escHtml(a.customer)}</div>
          <div style="font-size:12px;color:var(--text-muted)">📍 ${escHtml(a.address)}</div>
        </div>
        <span class="badge badge-${sColors[a.status]||'muted'}">${a.status}</span>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
        <span class="badge badge-muted">${a.type}</span>
        <span class="badge badge-info">${a.services}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:8px">
          <div style="font-size:10px;color:var(--text-muted)">Contract Value</div>
          <div style="font-size:13px;font-weight:700;color:var(--success)">${fmtINR(a.amount)}</div>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:8px">
          <div style="font-size:10px;color:var(--text-muted)">Next Service</div>
          <div style="font-size:13px;font-weight:700;color:${daysUntil(a.nextService)<3?'var(--danger)':'var(--text-primary)'}">${fmtDateShort(a.nextService)}</div>
        </div>
      </div>
      <button class="btn btn-${a.status==='Active'?'secondary':'primary'} btn-sm w-full">${a.status==='Active'?'Schedule Service':'Renew AMC'}</button>
    </div>`).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.tschedule = {
  label:'Treatment Scheduler',
  render(biz) {
    const jobs = DB.bget(biz.id,'jobs');
    const amcs = DB.bget(biz.id,'amc');
    const scheduled = [...jobs.filter(j=>j.status==='Scheduled'), ...amcs.map(a=>({customer:a.customer,date:a.nextService,pestType:'AMC Service',technician:'',status:'AMC',amount:0}))];
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>📅 Treatment Scheduler</h2><p>${scheduled.length} upcoming treatments</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Schedule Treatment</button></div>
  </div>
  <div style="display:flex;flex-direction:column;gap:10px">
    ${scheduled.sort((a,b)=>new Date(a.date)-new Date(b.date)).map(s=>`
    <div style="display:flex;align-items:center;gap:14px;padding:14px 18px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);transition:var(--transition)">
      <div style="width:52px;height:52px;border-radius:12px;background:rgba(34,197,94,0.12);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0">
        <div style="font-size:16px;font-weight:700;color:var(--success)">${new Date(s.date||Date.now()).getDate()}</div>
        <div style="font-size:10px;color:var(--text-muted)">${new Date(s.date||Date.now()).toLocaleString('en',{month:'short'})}</div>
      </div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--text-primary)">${escHtml(s.customer)}</div>
        <div style="font-size:12px;color:var(--text-muted)">🐛 ${escHtml(s.pestType||'')} ${s.technician?'&nbsp;•&nbsp; 👨‍🔧 '+escHtml(s.technician):''}</div>
      </div>
      <span class="badge badge-${s.status==='AMC'?'info':s.status==='Scheduled'?'primary':'success'}">${s.status}</span>
      <button class="btn btn-secondary btn-sm">Confirm</button>
    </div>`).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.chemicals = {
  label:'Chemical Inventory',
  render(biz) {
    const chemicals = DB.bget(biz.id,'chemicals');
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🧪 Chemical Inventory</h2><p>${chemicals.length} chemicals tracked</p></div>
    <div class="page-header-actions">
      <button class="btn btn-secondary">📊 Stock Report</button>
      <button class="btn btn-primary">+ Add Stock</button>
    </div>
  </div>
  <div class="kpi-grid mb-4">
    <div class="kpi-card" style="--kpi-color:#EF4444"><div class="kpi-icon">⚠️</div><div class="kpi-value">${chemicals.filter(c=>c.stock<=c.reorderLevel).length}</div><div class="kpi-label">Low Stock Alert</div></div>
    <div class="kpi-card" style="--kpi-color:#10B981"><div class="kpi-icon">🧪</div><div class="kpi-value">${chemicals.filter(c=>c.stock>c.reorderLevel).length}</div><div class="kpi-label">Adequate Stock</div></div>
    <div class="kpi-card" style="--kpi-color:#6366F1"><div class="kpi-icon">💰</div><div class="kpi-value">${fmtINR(chemicals.reduce((a,c)=>a+c.stock*c.pricePerUnit,0))}</div><div class="kpi-label">Inventory Value</div></div>
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Chemical</th><th>Stock</th><th>Unit</th><th>Reorder Level</th><th>Last Purchase</th><th>Rate</th><th>Value</th><th>Status</th></tr></thead>
    <tbody>${chemicals.map(c=>`<tr>
      <td style="font-weight:600">${escHtml(c.name)}</td>
      <td style="color:${c.stock<=c.reorderLevel?'var(--danger)':'var(--success)'};font-weight:700">${c.stock}</td>
      <td>${c.unit}</td>
      <td>${c.reorderLevel}</td>
      <td>${fmtDate(c.lastPurchase)}</td>
      <td>${fmtINR(c.pricePerUnit)}</td>
      <td>${fmtINR(c.stock*c.pricePerUnit)}</td>
      <td><span class="badge badge-${c.stock<=c.reorderLevel?'danger':'success'}">${c.stock<=c.reorderLevel?'Reorder':'OK'}</span></td>
    </tr>`).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.technicians = {
  label:'Technician Tracking',
  render(biz) {
    const jobs = DB.bget(biz.id,'jobs');
    const techs = [...new Set(jobs.map(j=>j.technician))].filter(Boolean);
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>👨‍🔧 Technician Tracking</h2><p>${techs.length} technicians</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Add Technician</button></div>
  </div>
  <div class="grid-2">
    ${techs.map(tech=>{
      const techJobs = jobs.filter(j=>j.technician===tech);
      const completed = techJobs.filter(j=>j.status==='Completed').length;
      const revenue = techJobs.filter(j=>j.status==='Completed').reduce((a,b)=>a+(b.amount||0),0);
      return `
      <div class="card" style="padding:20px">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
          <div class="tech-avatar" style="width:52px;height:52px;font-size:18px">${initials(tech)}</div>
          <div>
            <div style="font-size:15px;font-weight:700;color:var(--text-primary)">${escHtml(tech)}</div>
            <div style="font-size:12px;color:var(--text-muted)">Pest Control Technician</div>
          </div>
          <span class="badge badge-success" style="margin-left:auto">Active</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">
          ${[['Total Jobs',techJobs.length],['Completed',completed],['Revenue',fmtINR(revenue)]].map(([l,v])=>`
          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:10px;text-align:center">
            <div style="font-size:10px;color:var(--text-muted)">${l}</div>
            <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-top:2px">${v}</div>
          </div>`).join('')}
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">Today's Jobs:</div>
        ${techJobs.slice(0,2).map(j=>`
        <div style="font-size:12px;padding:8px 10px;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;margin-bottom:6px;display:flex;justify-content:space-between">
          <span>${escHtml(j.customer)} — ${j.pestType}</span>
          <span class="badge badge-${j.status==='Completed'?'success':'info'} text-xs">${j.status}</span>
        </div>`).join('')}
      </div>`;
    }).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.warranty = {
  label:'Warranty Manager',
  render(biz) {
    const jobs = DB.bget(biz.id,'jobs').filter(j=>j.status==='Completed');
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🛡️ Warranty Manager</h2><p>Track warranty periods and follow-ups</p></div>
    <div class="page-header-actions"><button class="btn btn-secondary">📋 Expiry Report</button></div>
  </div>
  <div class="table-wrapper">
    <table class="data-table"><thead><tr><th>Job ID</th><th>Customer</th><th>Treatment</th><th>Completed Date</th><th>Warranty</th><th>Expiry Date</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${jobs.map(j=>{
      const expiry = new Date(new Date(j.date).getTime() + j.warranty*86400000).toISOString().split('T')[0];
      const dLeft = daysUntil(expiry);
      return `<tr>
        <td style="color:var(--accent);font-family:monospace">${j.jobId}</td>
        <td>${escHtml(j.customer)}</td>
        <td>${j.pestType}</td>
        <td>${fmtDate(j.date)}</td>
        <td>${j.warranty} days</td>
        <td>${fmtDate(expiry)}</td>
        <td><span class="badge badge-${dLeft>30?'success':dLeft>0?'warning':'danger'}">${dLeft>0?dLeft+' days left':'Expired'}</span></td>
        <td><button class="btn btn-sm btn-secondary">Schedule Follow-up</button></td>
      </tr>`;
    }).join('')}</tbody></table>
  </div>
</div>`;
  },
  init(biz) {}
};

// =============================================
// REAL ESTATE & COWORKING
// =============================================
Modules.properties = {
  label: 'Properties',
  render(biz) {
    const props = DB.bget(biz.id, 'properties');
    // Construction type: show buy/sell listings with price, BHK, facing
    if (biz.type === 'construction') {
      const sColors={Available:'success',Reserved:'warning',Sold:'muted','Under Construction':'info'};
      return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🏠 Property Listings</h2><p>${props.length} properties • ${props.filter(p=>p.status==='Available').length} available</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Add Property</button></div>
  </div>
  <div class="grid-3">
    ${props.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">🏠</div><h3>No Properties Yet</h3><p>Add your first property listing</p></div>' : props.map(p=>`
    <div class="site-card">
      <div class="site-thumb" style="background:linear-gradient(135deg,rgba(20,184,166,0.15),rgba(99,102,241,0.1))">${p.emoji||'🏠'}</div>
      <div class="site-body">
        <div class="site-name">${escHtml(p.title)}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">📍 ${escHtml(p.location)}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          <span class="badge badge-muted">${p.area}</span>
          ${p.bhk?`<span class="badge badge-muted">${p.bhk}</span>`:''}
          ${p.facing?`<span class="badge badge-muted">${p.facing} Facing</span>`:''}
          ${p.parking?`<span class="badge badge-muted">🅿️ Parking</span>`:''}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:var(--success)">${fmtINR(p.price)}</div>
          <span class="badge badge-${sColors[p.status]||'muted'}">${p.status}</span>
        </div>
        <button class="btn btn-primary btn-sm w-full mt-3">View Details</button>
      </div>
    </div>`).join('')}
  </div>
</div>`;
    }
    // Real estate / coworking / default: show rent/unit view
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🏢 Properties &amp; Units</h2><p>${props.length} units listed</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Add Unit</button></div>
  </div>
  <div class="grid-3">
    ${props.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">🏢</div><h3>No Units Yet</h3><p>Add your first property or unit</p></div>' : props.map(p=>`
    <div class="card" style="padding:16px">
      <div style="font-size:32px;margin-bottom:8px">${p.emoji||'🏢'}</div>
      <div style="font-size:14px;font-weight:700;color:var(--text-primary)">${escHtml(p.title)}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">${p.type||''} • ${p.area||''}</div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:16px;font-weight:700;color:var(--success)">${fmtINR(p.rent)}<span style="font-size:10px;font-weight:400;color:var(--text-muted)">/mo</span></div>
        <span class="badge badge-${p.status==='Occupied'?'primary':p.status==='Vacant'?'success':'warning'}">${p.status}</span>
      </div>
    </div>`).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.spaces = {
  label: 'Space Inventory',
  render(biz) {
    const spaces = DB.bget(biz.id, 'spaces');
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🪑 Space Inventory</h2><p>${spaces.length} coworking spaces available</p></div>
    <div class="page-header-actions"><button class="btn btn-primary">+ Add Space</button></div>
  </div>
  <div class="grid-3">
    ${spaces.map(s=>`
    <div class="card" style="padding:16px">
      <div style="font-size:32px;margin-bottom:8px">${s.emoji}</div>
      <div style="font-size:14px;font-weight:700;color:var(--text-primary)">${escHtml(s.title)}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Capacity: ${s.capacity} persons</div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:16px;font-weight:700;color:var(--success)">${fmtINR(s.price)}<span style="font-size:10px;font-weight:400;color:var(--text-muted)">/mo</span></div>
        <span class="badge badge-${s.status==='Booked'?'primary':s.status==='Available'?'success':'warning'}">${s.status}</span>
      </div>
    </div>`).join('')}
  </div>
</div>`;
  },
  init(biz) {}
};

// =============================================
// GLOBAL ADD-ONS
// =============================================
Modules.quotation_gen = {
  label: 'Quotation Gen',
  render(biz) {
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>📄 Quotation Generator</h2><p>Build and send dynamic quotes to clients</p></div>
    <div class="page-header-actions"><button class="btn btn-primary" onclick="App.toast('New quote builder coming soon','info')">+ New Quote</button></div>
  </div>
  <div class="card" style="padding:24px;text-align:center;border-style:dashed">
    <div style="font-size:40px;margin-bottom:12px">📄</div>
    <h3 style="margin-bottom:8px">Quotation Engine Activated</h3>
    <p style="color:var(--text-muted);font-size:14px;max-width:400px;margin:0 auto">Use this add-on to generate complex estimates with multiple line items, tax brackets, and digital signature capabilities.</p>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.electricity_bill = {
  label: 'Electric Bills',
  render(biz) {
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>⚡ Utility Billing</h2><p>Generate electricity and water bills</p></div>
    <div class="page-header-actions"><button class="btn btn-primary" onclick="App.toast('Meter reading modal','info')">+ Enter Meter Reading</button></div>
  </div>
  <div class="card" style="padding:24px;text-align:center;border-style:dashed">
    <div style="font-size:40px;margin-bottom:12px">⚡</div>
    <h3 style="margin-bottom:8px">Utility Billing Active</h3>
    <p style="color:var(--text-muted);font-size:14px;max-width:400px;margin:0 auto">Automatically calculate utility charges based on meter readings and per-unit rates for your tenants.</p>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.rent_invoice = {
  label: 'Rent Invoices',
  render(biz) {
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>🧾 Rent Invoicing</h2><p>Automate monthly rent collection</p></div>
    <div class="page-header-actions"><button class="btn btn-primary" onclick="App.toast('Generating cycle...','success')">Run Monthly Cycle</button></div>
  </div>
  <div class="card" style="padding:24px;text-align:center;border-style:dashed">
    <div style="font-size:40px;margin-bottom:12px">🧾</div>
    <h3 style="margin-bottom:8px">Rent Automation Active</h3>
    <p style="color:var(--text-muted);font-size:14px;max-width:400px;margin:0 auto">Automatically generate and dispatch rent invoices to all active tenants on the 1st of every month.</p>
  </div>
</div>`;
  },
  init(biz) {}
};

Modules.whatsapp_api = {
  label: 'WhatsApp Tools',
  render(biz) {
    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left"><h2>💬 WhatsApp Marketing</h2><p>Bulk messaging & automated follow-ups</p></div>
    <div class="page-header-actions"><button class="btn btn-primary" onclick="App.toast('Syncing API...','success')">Sync Templates</button></div>
  </div>
  <div class="card" style="padding:24px;text-align:center;border-style:dashed">
    <div style="font-size:40px;margin-bottom:12px">📱</div>
    <h3 style="margin-bottom:8px">WhatsApp Cloud API Connected</h3>
    <p style="color:var(--text-muted);font-size:14px;max-width:400px;margin:0 auto">Send promotional blasts, booking confirmations, and payment links directly to customer WhatsApp numbers.</p>
  </div>
</div>`;
  },
  init(biz) {}
};

// =============================================
// CROSS-SELL NETWORK
// =============================================
Modules.cross_sell = {
  label: 'Cross-Sell Network',
  render(biz) {
    // Get contacts from ALL opted-in businesses EXCEPT current one
    const globalContacts = [];
    BUSINESSES.filter(b => b.crossSell && b.id !== biz.id).forEach(b => {
      const contacts = DB.bget(b.id, 'contacts');
      contacts.forEach(c => {
        globalContacts.push({ ...c, sourceBizName: b.name, sourceBizColor: b.color });
      });
    });

    return `
<div class="page-content">
  <div class="page-header">
    <div class="page-header-left">
      <h2>🌐 Cross-Sell Network</h2>
      <p>Access ${globalContacts.length} verified leads from sister companies for cross-promotion.</p>
    </div>
    <div class="page-header-actions">
      <button class="btn btn-primary" onclick="App.toast('Campaign initiated for selected contacts!','success')">🚀 Send WhatsApp Blast</button>
    </div>
  </div>

  ${globalContacts.length === 0 ? `
    <div class="card" style="padding:40px;text-align:center">
      <div style="font-size:40px;margin-bottom:16px">🕵️</div>
      <h3>No Global Leads Found</h3>
      <p style="color:var(--text-muted);max-width:400px;margin:0 auto">There are no contacts available from other opted-in businesses right now.</p>
    </div>
  ` : `
    <div class="table-wrapper">
      <table class="data-table">
        <thead><tr>
          <th style="width:40px"><input type="checkbox" checked style="accent-color:var(--accent)"></th>
          <th>Lead Name</th>
          <th>Originating Business</th>
          <th>Contact Info</th>
          <th>Lead Value</th>
          <th>Action</th>
        </tr></thead>
        <tbody>
          ${globalContacts.map(c => `
            <tr>
              <td><input type="checkbox" checked style="accent-color:var(--accent)"></td>
              <td><div style="font-weight:600">${escHtml(c.name)}</div><div style="font-size:11px;color:var(--text-muted)">${escHtml(c.city||'')}</div></td>
              <td><span class="badge" style="background:${c.sourceBizColor}22;color:${c.sourceBizColor}">${escHtml(c.sourceBizName)}</span></td>
              <td><div style="font-size:12px">📞 ${escHtml(c.phone)}<br/>📧 ${escHtml(c.email)}</div></td>
              <td style="color:var(--success);font-weight:600">${fmtINR(c.value)}</td>
              <td><button class="btn btn-secondary btn-sm" onclick="App.toast('Message sent to ${escHtml(c.name)}!','success')">Message</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `}
</div>`;
  },
  init(biz) {}
};

Modules.team = {
  render(biz) {
    const isManager = (App.state.user.permissions || []).includes('manage_team');
    
    const userRows = USERS.map(u => {
      let allowed = u.allowedBusinesses || [];
      let bizList = allowed.includes('all') ? '<span class="badge badge-success">All Businesses</span>' : 
        allowed.map(id => {
          const b = BUSINESSES.find(x => x.id === id);
          return b ? `<span class="badge" style="background:${b.color}22;color:${b.color};margin-bottom:4px">${escHtml(b.name)}</span>` : '';
        }).join(' ');

      return `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:32px;height:32px;border-radius:8px;background:${u.color};color:white;display:flex;align-items:center;justify-content:center;font-weight:bold">${u.avatar}</div>
            <div>
              <div style="font-weight:600">${escHtml(u.name)}</div>
              <div style="font-size:11px;color:var(--text-muted)">${escHtml(u.email)}</div>
            </div>
          </div>
        </td>
        <td><code style="background:var(--bg-secondary);padding:2px 6px;border-radius:4px">${escHtml(u.username)}</code></td>
        <td><span class="badge badge-${u.role==='Admin'?'primary':(u.role==='Manager'?'success':'muted')}">${u.role}</span></td>
        <td><div style="display:flex;gap:4px;flex-wrap:wrap;max-width:300px">${bizList}</div></td>
        <td>
          ${isManager ? `<button class="btn btn-sm btn-secondary" onclick="App.openUserModal('${u.id}')">Edit</button>` : ''}
        </td>
      </tr>`;
    }).join('');

    return `
<div class="module-header">
  <div class="module-title">
    <h1>Team & Resources</h1>
    <p>Manage users, roles, and business access permissions.</p>
  </div>
  <div class="module-actions">
    ${isManager ? `<button class="btn btn-primary" onclick="App.openUserModal()">+ Create User</button>` : ''}
  </div>
</div>
<div class="table-wrapper">
  <table class="data-table">
    <thead>
      <tr>
        <th>User Profile</th>
        <th>Username</th>
        <th>Role</th>
        <th>Business Access</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${userRows}
    </tbody>
  </table>
</div>
`;
  },
  init(biz) {}
};
