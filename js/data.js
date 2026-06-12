/* =============================================
   AGRANI CRM — DATA LAYER & CONFIGURATION
   ============================================= */

const BUSINESSES = [
  { id:'superia-travel',      name:'Superia Travel',                  type:'travel',       icon:'✈️',  color:'#6366F1', tagline:'Premium Holiday Experiences', addons:[], crossSell:true },
  { id:'odisha-travels',      name:'Odisha Travels',                  type:'travel',       icon:'🗺️',  color:'#8B5CF6', tagline:'Explore Odisha & Beyond', addons:[], crossSell:false },
  { id:'global-voyage',       name:'Global Voyage Tours',             type:'travel',       icon:'🌍',  color:'#06B6D4', tagline:'World Tour Specialists', addons:[], crossSell:false },
  { id:'agrani-movers',       name:'Agrani Packers & Movers',         type:'logistics',    icon:'📦',  color:'#F59E0B', tagline:'Safe & Reliable Moving', addons:[], crossSell:false },
  { id:'urbanride-unit3',     name:'UrbanRide Unit-3',                type:'logistics',    icon:'🚗',  color:'#14B8A6', tagline:'City Rides & Transport', addons:[], crossSell:true },
  { id:'urbanride-patia',     name:'UrbanRide Patia',                 type:'logistics',    icon:'🚗',  color:'#0EA5E9', tagline:'City Rides & Transport', addons:[], crossSell:true },
  { id:'urbanride-kalinganagar', name:'UrbanRide Kalinganagar',       type:'logistics',    icon:'🚗',  color:'#3B82F6', tagline:'City Rides & Transport', addons:[], crossSell:true },
  { id:'zerohour',            name:'ZeroHour Solutions',              type:'agency',       icon:'⚡',  color:'#10B981', tagline:'Tech Solutions at Speed', addons:['whatsapp_api'], crossSell:true },
  { id:'growthverse',         name:'Growthverse AI Media',            type:'agency',       icon:'🚀',  color:'#EC4899', tagline:'AI-Powered Growth Marketing', addons:[], crossSell:false },
  { id:'skilltechx',          name:'SkilltechX',                      type:'education',    icon:'🎓',  color:'#8B5CF6', tagline:'Next-Gen Tech Education', addons:[], crossSell:true },
  { id:'bharat-tax',          name:'Bharat Tax Solutions',            type:'finance',      icon:'📊',  color:'#F59E0B', tagline:'GST, ITR & Compliance', addons:[], crossSell:false },
  { id:'agrani-fincorp',      name:'Agrani Fincorp',                  type:'finance',      icon:'🏦',  color:'#3B82F6', tagline:'Loans, Insurance & Wealth', addons:[], crossSell:false },
  { id:'tulsi-constructions', name:'Tulsi Constructions',             type:'construction', icon:'🏗️',  color:'#F97316', tagline:'Building Dreams Since 2010', addons:['quotation_gen'], crossSell:false },
  { id:'utkal-makeover',      name:'Utkal Make Over Masters',         type:'construction', icon:'🔨',  color:'#84CC16', tagline:'Interior Renovation Experts', addons:['quotation_gen'], crossSell:false },
  { id:'odisha-supplies',     name:'Odisha Construction Supplies',    type:'construction', icon:'🧱',  color:'#EAB308', tagline:'Quality Building Materials', addons:[], crossSell:false },
  { id:'agrani-properties',   name:'Agrani Properties',               type:'construction', icon:'🏢',  color:'#14B8A6', tagline:'Real Estate Solutions', addons:[], crossSell:false },
  { id:'agrani-pest',         name:'Agrani Pest Control',             type:'pestcontrol',  icon:'🛡️',  color:'#22C55E', tagline:'Safe & Effective Pest Management', addons:[], crossSell:false },
  { id:'mallick-complex',     name:'Mallick Complex',                 type:'realestate',   icon:'🏢',  color:'#3B82F6', tagline:'Premium Office Rentals', addons:['electricity_bill','rent_invoice'], crossSell:true },
  { id:'nestworks-coworking', name:'Nestworks Coworking',             type:'coworking',    icon:'🛋️',  color:'#F43F5E', tagline:'Modern Coworking Spaces', addons:['rent_invoice'], crossSell:true },
  { id:'costays',             name:'Costays',                         type:'coworking',    icon:'🏨',  color:'#8B5CF6', tagline:'Co-living & Co-working', addons:['electricity_bill'], crossSell:false },
  { id:'electroplumb',        name:'Electroplumb',                    type:'maintenance',  icon:'🔧',  color:'#EAB308', tagline:'Electrical & Plumbing Solutions', addons:['quotation_gen'], crossSell:false },
  { id:'agrani-prop-exp',     name:'Agrani Properties Expansion',     type:'realestate',   icon:'📈',  color:'#10B981', tagline:'Expanding Real Estate Horizons', addons:[], crossSell:true },
  { id:'agrani-fincop-loan',  name:'Agrani Fincop Loan',              type:'finance',      icon:'💸',  color:'#3B82F6', tagline:'Quick & Easy Loans', addons:[], crossSell:true },
  { id:'suretrust-labs',      name:'SureTrust Labs',                  type:'health',       icon:'🔬',  color:'#06B6D4', tagline:'Trusted Diagnostic Services', addons:[], crossSell:true },
  { id:'neelachal-astro',     name:'Neelachal Astro',                 type:'astrology',    icon:'✨',  color:'#8B5CF6', tagline:'Guiding Light for Your Future', addons:[], crossSell:true },
  { id:'heavy-machinery',     name:'Heavy Machinery',                 type:'equipment',    icon:'🚜',  color:'#F59E0B', tagline:'Equipment Rentals & Sales', addons:['quotation_gen'], crossSell:false },
  { id:'media-classes',       name:'Media Classes',                   type:'education',    icon:'🎥',  color:'#EC4899', tagline:'Learn Media & Production', addons:[], crossSell:true },
  { id:'digital-marketing-classes', name:'Digital Marketing Classes', type:'education',    icon:'📱',  color:'#3B82F6', tagline:'Master Digital Marketing', addons:[], crossSell:true },
  { id:'ai-classes',          name:'AI Classes',                      type:'education',    icon:'🤖',  color:'#10B981', tagline:'Artificial Intelligence Training', addons:[], crossSell:true },
  { id:'devops-classes',      name:'DevOps Classes',                  type:'education',    icon:'⚙️',  color:'#6366F1', tagline:'Cloud & DevOps Mastery', addons:[], crossSell:true },
  { id:'data-science-classes',name:'Data Science Classes',            type:'education',    icon:'📊',  color:'#8B5CF6', tagline:'Data Science Bootcamp', addons:[], crossSell:true },
  { id:'ccna-networking',     name:'CCNA/Networking',                 type:'education',    icon:'🌐',  color:'#0EA5E9', tagline:'Networking Certifications', addons:[], crossSell:true },
  { id:'datacenter-networking',name:'Datacenter Networking',          type:'education',    icon:'🗄️',  color:'#3B82F6', tagline:'Advanced Datacenter Training', addons:[], crossSell:true },
  { id:'device-driver',       name:'Device Driver',                   type:'education',    icon:'💻',  color:'#14B8A6', tagline:'System Level Programming', addons:[], crossSell:true },
  { id:'kinabikabhada',       name:'Kinabikabhada',                   type:'realestate',   icon:'🏠',  color:'#F43F5E', tagline:'Buy, Sell & Rent properties', addons:[], crossSell:true },
  { id:'franchiseeindia',     name:'Franchiseeindia',                 type:'consulting',   icon:'🤝',  color:'#F59E0B', tagline:'Business Franchise Opportunities', addons:[], crossSell:true },
  { id:'discountclub',        name:'Discountclub',                    type:'retail',       icon:'🏷️',  color:'#EC4899', tagline:'Exclusive Discounts & Offers', addons:[], crossSell:true },
  { id:'urbanreach-adv',      name:'Urbanreach Advertising',          type:'agency',       icon:'📢',  color:'#8B5CF6', tagline:'Outdoor & Digital Ads', addons:[], crossSell:true },
];

const INDUSTRY_LABELS = {
  travel:       '✈️ Travel & Tourism',
  logistics:    '📦 Logistics & Moving',
  agency:       '💻 Tech / Digital Agency',
  finance:      '💰 Financial Services',
  construction: '🏗️ Construction & Real Estate',
  pestcontrol:  '🐛 Pest Control Services',
  realestate:   '🏢 Office Space & Rentals',
  coworking:    '🛋️ Coworking & Co-living',
  education:    '🎓 Education & Training',
  maintenance:  '🔧 Maintenance & Repairs',
  health:       '🔬 Health & Diagnostics',
  astrology:    '✨ Astrology Services',
  equipment:    '🚜 Equipment & Machinery',
  consulting:   '🤝 Consulting Services',
  retail:       '🏷️ Retail & Commerce'
};

// =============================================
// GLOBAL ADD-ONS & FEATURES
// =============================================
const ADDON_REGISTRY = {
  quotation_gen:   { label: 'Quotation Gen',  icon: '📄', desc: 'Create complex project quotes' },
  electricity_bill:{ label: 'Electric Bills', icon: '⚡', desc: 'Generate utility bills for tenants' },
  rent_invoice:    { label: 'Rent Invoices',  icon: '🧾', desc: 'Automate monthly rent billing' },
  whatsapp_api:    { label: 'WhatsApp Tools', icon: '💬', desc: 'Bulk messaging & templates' }
};

const BASE_NAV = [
  { id:'dashboard', label:'Dashboard',        icon:'📊' },
  { id:'contacts',  label:'Contacts & Leads', icon:'👥' },
  { id:'deals',     label:'Deals Pipeline',   icon:'💼' },
  { id:'tickets',   label:'Support Desk',     icon:'🎫' },
  { id:'tasks',     label:'Tasks & Calendar', icon:'✅' },
  { id:'invoices',  label:'Invoices & Quotes',icon:'🧾' },
  { id:'reports',   label:'Reports',          icon:'📈' },
];

const INDUSTRY_NAV = {
  travel: [
    { id:'itineraries', label:'Itinerary Builder', icon:'🗓️' },
    { id:'bookings',    label:'Booking Manager',   icon:'🎫' },
    { id:'packages',    label:'Package Catalog',   icon:'🌴' },
    { id:'visa',        label:'Visa Tracker',      icon:'📋' },
    { id:'groups',      label:'Group Tours',       icon:'👨‍👩‍👧‍👦' },
    { id:'suppliers',   label:'Supplier Directory',icon:'🏨' },
  ],
  logistics: [
    { id:'shipments',   label:'Shipment Tracker',  icon:'🚛' },
    { id:'moveplanner', label:'Move Planner',       icon:'🗂️' },
    { id:'fleet',       label:'Fleet Manager',      icon:'🚗' },
    { id:'inventory',   label:'Inventory Checklist',icon:'📝' },
    { id:'ratecalc',    label:'Rate Calculator',    icon:'💰' },
    { id:'pod',         label:'POD Manager',        icon:'✍️' },
  ],
  agency: [
    { id:'projects',    label:'Project Manager',   icon:'🎯' },
    { id:'retainers',   label:'Retainer Tracker',  icon:'🔄' },
    { id:'campaigns',   label:'Campaign Manager',  icon:'📣' },
    { id:'timetracker', label:'Time Tracker',       icon:'⏱️' },
    { id:'contracts',   label:'SOW & Contracts',   icon:'📄' },
  ],
  finance: [
    { id:'cases',       label:'Case Manager',       icon:'📁' },
    { id:'loanpipeline',label:'Loan Pipeline',       icon:'💳' },
    { id:'docvault',    label:'Document Vault',      icon:'🔒' },
    { id:'compliance',  label:'Compliance Calendar', icon:'📅' },
    { id:'fees',        label:'Fee Tracker',         icon:'💵' },
    { id:'referrals',   label:'Referral Network',    icon:'🤝' },
  ],
  construction: [
    { id:'sites',       label:'Site Tracker',         icon:'🏗️' },
    { id:'properties',  label:'Property Listings',    icon:'🏠' },
    { id:'procurement', label:'Material Procurement', icon:'🛒' },
    { id:'labour',      label:'Labour Manager',       icon:'👷' },
    { id:'visits',      label:'Visit Scheduler',      icon:'📅' },
    { id:'boq',         label:'BOQ / Estimation',     icon:'📐' },
  ],
  pestcontrol: [
    { id:'jobs',        label:'Job Cards',            icon:'📋' },
    { id:'amc',         label:'AMC Contracts',        icon:'🔄' },
    { id:'tschedule',   label:'Treatment Scheduler',  icon:'📅' },
    { id:'chemicals',   label:'Chemical Inventory',   icon:'🧪' },
    { id:'technicians', label:'Technician Tracking',  icon:'👨‍🔧' },
    { id:'warranty',    label:'Warranty Manager',     icon:'🛡️' },
  ],
  realestate: [
    { id:'properties',  label:'Properties/Units',     icon:'🏢' },
    { id:'tenants',     label:'Tenant Directory',     icon:'👥' },
    { id:'leases',      label:'Lease Contracts',      icon:'📄' },
    { id:'rentroll',    label:'Rent Roll',            icon:'💰' },
    { id:'maintenance', label:'Maintenance Requests', icon:'🔧' },
  ],
  coworking: [
    { id:'spaces',      label:'Space Inventory',      icon:'🪑' },
    { id:'members',     label:'Members Directory',    icon:'🧑‍💻' },
    { id:'plans',       label:'Membership Plans',     icon:'💳' },
    { id:'bookings',    label:'Meeting Room Bookings',icon:'📅' },
    { id:'events',      label:'Community Events',     icon:'🎉' },
  ],
  education: [
    { id:'courses',     label:'Course Catalog',       icon:'📚' },
    { id:'students',    label:'Student Directory',    icon:'👨‍🎓' },
    { id:'batches',     label:'Batch Manager',        icon:'🗓️' },
    { id:'attendance',  label:'Attendance Tracker',   icon:'✅' },
    { id:'assignments', label:'Assignments',          icon:'📝' },
  ],
  maintenance: [
    { id:'workorders',  label:'Work Orders',          icon:'📋' },
    { id:'inventory',   label:'Parts Inventory',      icon:'🔩' },
    { id:'scheduling',  label:'Dispatch Scheduler',   icon:'📅' },
  ],
  health: [
    { id:'patients',    label:'Patient Records',      icon:'📁' },
    { id:'appointments',label:'Appointments',         icon:'📅' },
    { id:'tests',       label:'Test Reports',         icon:'🔬' },
  ],
  astrology: [
    { id:'clients',     label:'Client Profiles',      icon:'👤' },
    { id:'charts',      label:'Birth Charts',         icon:'✨' },
    { id:'consultations',label:'Consultations',       icon:'🔮' },
  ],
  equipment: [
    { id:'inventory',   label:'Equipment Inventory',  icon:'🚜' },
    { id:'rentals',     label:'Rental Contracts',     icon:'📄' },
    { id:'maintenance', label:'Service Log',          icon:'🔧' },
  ],
  consulting: [
    { id:'clients',     label:'Client Portfolio',     icon:'💼' },
    { id:'projects',    label:'Project Tracker',      icon:'📊' },
    { id:'contracts',   label:'Agreements',           icon:'📝' },
  ],
  retail: [
    { id:'products',    label:'Product Catalog',      icon:'📦' },
    { id:'orders',      label:'Order Manager',        icon:'🛒' },
    { id:'inventory',   label:'Stock Tracker',        icon:'📉' },
  ],
};

const BOTTOM_NAV = [
  { id:'team',     label:'Team',     icon:'👤' },
  { id:'timesheets', label:'Timesheets', icon:'⏱️' },
  { id:'settings', label:'Settings', icon:'⚙️' },
];

// =============================================
// ROLES & PERMISSIONS
// =============================================
const PERMISSIONS = {
  view_all_businesses: 'View All Businesses',
  manage_businesses: 'Create/Edit Businesses',
  manage_business_info: 'Edit Business Details (Phone, Email, Address)',
  manage_team: 'Add/Edit Team Members',
  view_contacts: 'View Contacts',
  edit_contacts: 'Edit Contacts',
  manage_tickets: 'Manage Tickets',
  view_reports: 'View Reports',
  view_financials: 'View Financials (Invoices/Deals)'
};

const DEFAULT_ROLES = {
  Admin: Object.keys(PERMISSIONS),
  Manager: ['view_contacts', 'edit_contacts', 'manage_tickets', 'view_reports', 'view_financials', 'manage_business_info'],
  Staff: ['view_contacts', 'manage_tickets']
};

let USERS = [];
try {
  const savedUsers = localStorage.getItem('agrani_users');
  if (savedUsers) USERS = JSON.parse(savedUsers);
} catch(e) {}

if (!USERS || USERS.length === 0) {
  USERS = [
    { id: 'u1', username: 'admin',  password: 'Zero@12345', name: 'Ashok Admin',   role: 'Admin',   email: 'ashok@agranigroup.in',  avatar: 'A', color: '#6366F1', permissions: DEFAULT_ROLES.Admin,   allowedBusinesses: ['all'] },
    { id: 'u2', username: 'ranjit', password: 'ranjit123',  name: 'Ranjit Sahoo',  role: 'Manager', email: 'ranjit@agranigroup.in', avatar: 'R', color: '#10B981', permissions: DEFAULT_ROLES.Manager, allowedBusinesses: ['all'] },
    { id: 'u3', username: 'priya',  password: 'priya123',   name: 'Priya Mohanty', role: 'Staff',   email: 'priya@agranigroup.in',  avatar: 'P', color: '#EC4899', permissions: DEFAULT_ROLES.Staff,   allowedBusinesses: ['all'] },
    { id: 'u4', username: 'suresh', password: 'suresh123',  name: 'Suresh Kumar',  role: 'Staff',   email: 'suresh@agranigroup.in', avatar: 'S', color: '#F59E0B', permissions: DEFAULT_ROLES.Staff,   allowedBusinesses: ['all'] },
    { id: 'u5', username: 'user1',  password: 'Zero@123',   name: 'Normal User',   role: 'Staff',   email: 'user1@agranigroup.in',  avatar: 'U', color: '#8B5CF6', permissions: DEFAULT_ROLES.Staff,   allowedBusinesses: ['superia-travel'] },
  ];
  localStorage.setItem('agrani_users', JSON.stringify(USERS));
} else {
  // Migrate: hydrate any users missing permissions or allowedBusinesses
  let needsSave = false;
  USERS.forEach(u => {
    if (!u.permissions || u.role === 'Admin' || u.role === 'Manager') { 
      u.permissions = DEFAULT_ROLES[u.role] || []; 
      needsSave = true; 
    }
    if (!u.allowedBusinesses) { u.allowedBusinesses = ['all']; needsSave = true; }
  });
  if (needsSave) localStorage.setItem('agrani_users', JSON.stringify(USERS));
}

// =============================================
// LOCALSTORAGE HELPERS
// =============================================
const DB = {
  get(k) { try { return JSON.parse(localStorage.getItem('agrani_'+k)); } catch { return null; } },
  set(k,v) { localStorage.setItem('agrani_'+k, JSON.stringify(v)); },
  del(k) { localStorage.removeItem('agrani_'+k); },
  bget(biz,k) { return this.get(biz+'_'+k) || []; },
  bset(biz,k,v) { this.set(biz+'_'+k,v); },
  bpush(biz,k,item) {
    const arr = this.bget(biz,k);
    const newItem = { ...item, id: item.id || uid(), createdAt: new Date().toISOString() };
    arr.push(newItem);
    this.bset(biz,k,arr);
    return newItem;
  },
  bupdate(biz,k,id,updates) {
    const arr = this.bget(biz,k);
    const i = arr.findIndex(x=>x.id===id);
    if(i!==-1) arr[i]={ ...arr[i], ...updates, updatedAt:new Date().toISOString() };
    this.bset(biz,k,arr);
    return arr;
  },
  bdel(biz,k,id) {
    const arr = this.bget(biz,k).filter(x=>x.id!==id);
    this.bset(biz,k,arr);
    return arr;
  },
  bgetAll(k) {
    let all = [];
    BUSINESSES.forEach(biz => {
      let items = this.bget(biz.id, k);
      items.forEach(item => item._bizId = biz.id);
      all = all.concat(items);
    });
    return all;
  },
  logActivity(bizId, action, target, user = null) {
    if (!user && typeof App !== 'undefined' && App.state.user) user = App.state.user;
    if (!user) return;
    const act = {
      id: uid(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userColor: user.color,
      action: action,     // e.g. "created lead"
      target: target,     // e.g. "Ramesh Kumar"
      timestamp: new Date().toISOString()
    };
    const acts = this.bget(bizId, 'activities');
    acts.unshift(act);
    // keep only last 50 activities per biz to save space
    this.bset(bizId, 'activities', acts.slice(0, 50));
  },
  addBusiness(biz) {
    const saved = JSON.parse(localStorage.getItem('agrani_businesses') || '[]');
    if(!saved.length) saved.push(...BUSINESSES);
    saved.push(biz);
    localStorage.setItem('agrani_businesses', JSON.stringify(saved));
    BUSINESSES.length = 0;
    BUSINESSES.push(...saved);
    seedBusiness(biz);
  },
  updateBusiness(bizId, updates) {
    const saved = JSON.parse(localStorage.getItem('agrani_businesses') || '[]');
    let b = saved.find(x => x.id === bizId);
    if (b) {
      Object.assign(b, updates);
      localStorage.setItem('agrani_businesses', JSON.stringify(saved));
      BUSINESSES.length = 0;
      BUSINESSES.push(...saved);
    }
  }
};

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

// =============================================
// FORMAT HELPERS
// =============================================
function fmtINR(n) {
  if (!n && n !== 0) return '—';
  n = Number(n);
  if (n >= 10000000) return '₹' + (n/10000000).toFixed(2) + ' Cr';
  if (n >= 100000) return '₹' + (n/100000).toFixed(1) + ' L';
  if (n >= 1000) return '₹' + (n/1000).toFixed(1) + 'K';
  return '₹' + n.toLocaleString('en-IN');
}

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function fmtDateShort(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
}

function daysUntil(d) {
  if (!d) return null;
  const diff = new Date(d) - new Date();
  return Math.ceil(diff / 86400000);
}

function initials(name) {
  return (name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
}

function randomColor(seed) {
  const colors = ['#6366F1','#8B5CF6','#EC4899','#10B981','#F59E0B','#3B82F6','#06B6D4','#F97316','#84CC16'];
  let h = 0;
  for (let c of (seed||'?')) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[Math.abs(h)];
}

function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// =============================================
// SEED MOCK DATA FOR EACH BUSINESS
// =============================================
const CONTACT_NAMES = [
  'Ramesh Kumar','Priya Sharma','Suresh Patel','Anjali Singh','Vikram Nair',
  'Sunita Das','Mahesh Rao','Kavita Joshi','Deepak Verma','Rekha Mishra',
  'Arjun Reddy','Meera Pillai','Santosh Gupta','Lalita Devi','Rajesh Mohanty',
];

const DEAL_NAMES = {
  travel:       ['Bali Honeymoon Package','Kerala Backwaters Tour','Europe Grand Tour','Thailand Group Trip','Dubai Business Tour','Rajasthan Heritage','Sri Lanka Budget','Maldives Premium','Char Dham Yatra','Northeast Explorer'],
  logistics:    ['Home Move – Bhubaneswar','Office Relocation Cuttack','Corporate HQ Shifting','Interstate Move Kolkata','Storage Contract 6M','Residential Move Puri','Furniture Transport','Warehouse Relocation','Lab Equipment Move','Commercial Shifting'],
  agency:       ['Website Redesign 2025','SEO Campaign Q3','Social Media Retainer','Android App Dev','Brand Identity Pack','E-commerce Portal','CRM Integration','PPC Management','YouTube Growth','Email Marketing'],
  finance:      ['ITR Filing FY25','GST Registration','Business Loan ₹25L','Audit FY24-25','Tax Planning 2025','GST Return Filing','MSME Loan','Home Loan Assist','Insurance Advisory','Payroll Compliance'],
  construction: ['3BHK Villa – Patia','Commercial Complex','Office Interior Reno','Apartment Block B','Plot Dev – Jatni','Warehouse Construction','School Building','Factory Shed','Showroom Interior','Roads & Drainage'],
  pestcontrol:  ['Apartment Block AMC','Restaurant Cockroach Ctrl','Warehouse Fumigation','Office Pest Control','Termite Treatment','Hotel Pest Mgmt','Hospital AMC','Factory Rodent Ctrl','Mall Fumigation','Housing Society AMC'],
  realestate:   ['Office Space Lease 1500sqft','Retail Shop Rental','IT Park Floor Lease','Commercial Plaza Shop','Warehouse Rental','Corporate Office Setup'],
  coworking:    ['Private Cabin 6 Seater','Dedicated Desk 3M','Meeting Room Package','Event Space Booking','Day Pass Bulk','Virtual Office 1Y'],
};

const STAGES_CONTACTS = ['new','qualified','proposal','closed-won','closed-lost'];
const SOURCES = ['Website','Referral','Walk-in','Social Media','Cold Call','Exhibition','Google Ads','JustDial'];
const CITIES = ['Bhubaneswar','Cuttack','Puri','Rourkela','Sambalpur','Berhampur','Balasore','Koraput'];
const PRIORITIES = ['high','medium','low'];

function seedBusiness(biz) {
  if (DB.bget(biz.id,'_seeded').length > 0) return;
  DB.bpush(biz.id, '_seeded', { status: true });
  // False data generation removed as requested
}

// One-time purge script to clear existing false data
if (!localStorage.getItem('agrani_purge_falsedata_v2')) {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('agrani_') && key !== 'agrani_businesses' && key !== 'agrani_users' && key !== 'agrani_lastBiz') {
      localStorage.removeItem(key);
    }
  });
  localStorage.setItem('agrani_purge_falsedata_v2', 'done');
  console.log("Purged false data from localStorage.");
}

function initData() {
  let savedBiz = [];
  try {
    savedBiz = JSON.parse(localStorage.getItem('agrani_businesses') || '[]');
  } catch(e) {}

  if (savedBiz.length > 0) {
    // Merge new hardcoded businesses that might not be in localStorage
    BUSINESSES.forEach(b => {
      if (!savedBiz.find(sb => sb.id === b.id)) {
        savedBiz.push(b);
      }
    });
    BUSINESSES.length = 0;
    BUSINESSES.push(...savedBiz);
    localStorage.setItem('agrani_businesses', JSON.stringify(savedBiz));
  } else {
    localStorage.setItem('agrani_businesses', JSON.stringify(BUSINESSES));
  }

  // Migrate: ensure active flag and contact info exists on all businesses
  let needsBizSave = false;
  BUSINESSES.forEach(b => {
    if (b.active === undefined) { b.active = true; needsBizSave = true; }
    if (b.phone === undefined) { b.phone = ''; needsBizSave = true; }
    if (b.email === undefined) { b.email = ''; needsBizSave = true; }
    if (b.address === undefined) { b.address = ''; needsBizSave = true; }
    if (b.gst === undefined) { b.gst = ''; needsBizSave = true; }
    if (b.website === undefined) { b.website = ''; needsBizSave = true; }
    if (b.altPhone === undefined) { b.altPhone = ''; needsBizSave = true; }
  });
  if (needsBizSave) localStorage.setItem('agrani_businesses', JSON.stringify(BUSINESSES));

  BUSINESSES.forEach(b => seedBusiness(b));
}
