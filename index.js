(function() {
  'use strict';

  // navbar scroll
  var nav = document.getElementById('navbar');
  window.addEventListener('scroll', function() {
    nav.style.boxShadow = window.scrollY > 50 ? '0 4px 24px rgba(0,0,0,.15)' : '';
  }, { passive: true });

  // hamburger
  var burger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', function() {
    navLinks.classList.toggle('open');
  });
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    a.addEventListener('click', function() { navLinks.classList.remove('open'); });
  });

  // smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var t = document.querySelector(this.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
  });

  // reveal
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(function(el) { io.observe(el); });

  // tabs
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById('tab-' + btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  // stats counter
  function animateCount(el) {
    var target = parseInt(el.dataset.target, 10);
    var decimal = el.dataset.decimal === 'true';
    var start = 0;
    var duration = 1600;
    var step = 16;
    var increments = Math.ceil(duration / step);
    var inc = target / increments;
    var count = 0;
    var timer = setInterval(function() {
      count = Math.min(count + inc, target);
      el.textContent = decimal ? (count / 10).toFixed(1) : Math.floor(count).toLocaleString();
      if (count >= target) clearInterval(timer);
    }, step);
  }

  var statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        document.querySelectorAll('.stat-num').forEach(animateCount);
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  var statsBar = document.querySelector('.stats-bar');
  if (statsBar) statsObserver.observe(statsBar);

  // phone formatter
  var ph = document.getElementById('hvacPhone');
  if (ph) {
    ph.addEventListener('input', function() {
      var v = this.value.replace(/\D/g, '').slice(0, 10);
      if (v.length >= 7) v = '(' + v.slice(0,3) + ') ' + v.slice(3,6) + '-' + v.slice(6);
      else if (v.length >= 4) v = '(' + v.slice(0,3) + ') ' + v.slice(3);
      else if (v.length) v = '(' + v;
      this.value = v;
    });
  }

  // date dropdown
  var dateSel = document.getElementById('hvacDate');
  if (dateSel) {
    var now = new Date(), added = 0, i = 1;
    var dNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var mNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    while (added < 28) {
      var d = new Date(now);
      d.setDate(now.getDate() + i++);
      if (d.getDay() === 0) continue;
      var o = document.createElement('option');
      o.value = d.toISOString().slice(0, 10);
      o.textContent = dNames[d.getDay()] + ' ' + mNames[d.getMonth()] + ' ' + d.getDate();
      dateSel.appendChild(o);
      added++;
    }
  }

  // form submit
  var form = document.getElementById('hvacForm');
  var succ = document.getElementById('hvacSuccess');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      form.style.display = 'none';
      succ.style.display = 'block';
      notify('Appointment requested — we\'ll call to confirm within 1 hour.');
    });
  }

  // notification
  function notify(msg) {
    var n = document.getElementById('notification');
    n.textContent = msg;
    n.classList.add('show');
    clearTimeout(n._t);
    n._t = setTimeout(function() { n.classList.remove('show'); }, 4000);
  }

  // chatbot
  var toggle = document.getElementById('chatToggle');
  var box = document.getElementById('chatBox');
  var closeBtn = document.getElementById('chatClose');
  var msgs = document.getElementById('chatMessages');
  var input = document.getElementById('chatInput');
  var sendBtn = document.getElementById('chatSend');
  var icon = document.getElementById('chatIcon');

  var replies = {
    'ac repair': 'We offer same-day AC repair for most makes and models. Would you like to schedule a service call?',
    'heating': 'Our certified technicians handle all heating and furnace issues. Shall I help you book an appointment?',
    'maintenance': 'Our maintenance plans include bi-annual visits, priority scheduling, and parts discounts. Would you like details?',
    'emergency': 'For emergencies, please call us directly at (555) 000-5678. We have techs available 24/7.',
    'price': 'Our pricing is flat-rate and upfront — no surprises. You can request a free quote using the form above.',
    'hours': 'We are open Monday–Saturday 7am–7pm. Emergency service is available 24/7.',
    'default': 'Thank you for your message. A member of our team will follow up shortly. For immediate assistance, please call (555) 000-5678.'
  };

  function getReply(msg) {
    var m = msg.toLowerCase();
    if (m.includes('ac') || m.includes('air') || m.includes('cool') || m.includes('repair')) return replies['ac repair'];
    if (m.includes('heat') || m.includes('furnac') || m.includes('warm')) return replies['heating'];
    if (m.includes('mainten') || m.includes('plan') || m.includes('tune')) return replies['maintenance'];
    if (m.includes('emerg')) return replies['emergency'];
    if (m.includes('price') || m.includes('cost') || m.includes('quote') || m.includes('how much')) return replies['price'];
    if (m.includes('hour') || m.includes('open') || m.includes('close')) return replies['hours'];
    return replies['default'];
  }

  function addMsg(text, who) {
    var div = document.createElement('div');
    div.className = 'cm ' + who;
    var bub = document.createElement('div');
    bub.className = 'cm-bubble';
    bub.textContent = text;
    div.appendChild(bub);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function sendMsg(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    input.value = '';
    var opts = document.getElementById('chatOptions');
    if (opts) opts.remove();
    setTimeout(function() { addMsg(getReply(text), 'bot'); }, 600);
  }

  if (toggle) {
    toggle.addEventListener('click', function() {
      var open = box.classList.toggle('open');
      icon.className = open ? 'fas fa-times' : 'fas fa-comment-dots';
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      box.classList.remove('open');
      icon.className = 'fas fa-comment-dots';
    });
  }
  if (sendBtn) {
    sendBtn.addEventListener('click', function() { sendMsg(input.value); });
  }
  if (input) {
    input.addEventListener('keypress', function(e) { if (e.key === 'Enter') sendMsg(input.value); });
  }
  document.querySelectorAll('.co-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { sendMsg(btn.dataset.msg); });
  });

})();
