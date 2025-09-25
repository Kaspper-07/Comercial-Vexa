/* ==========================================
   Grupo Comercial Vexa – Interactividad
   - Header sticky on scroll
   - Menú móvil toggle
   - Smooth scroll + active section
   - Reveal on scroll (IntersectionObserver)
   - Counters (hero)
   - Parallax orbs (hero)
   - Back to top
   - Acordeones (Servicios)
   - Form handler (demo)
   ========================================== */

// Helper: throttle
function throttle(fn, wait){
  let t = 0; return function(...args){
    const now = Date.now(); if(now - t >= wait){ t = now; fn.apply(this,args); }
  }
}

// ===== Header sticky + sombra =====
const header = document.querySelector('.header');
let scrollProgress;
if(header){
  scrollProgress = document.createElement('span');
  scrollProgress.id = 'scroll-progress';
  header.appendChild(scrollProgress);
}

function updateScrollProgress(){
  if(!scrollProgress) return;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
  scrollProgress.style.width = `${ratio * 100}%`;
}

const onScrollHeader = throttle(()=>{
  if(window.scrollY > 10){ header?.classList.add('is-scrolled'); }
  else { header?.classList.remove('is-scrolled'); }
  updateScrollProgress();
}, 100);
window.addEventListener('scroll', onScrollHeader);
updateScrollProgress();

// ===== Menú móvil =====
const navToggle = document.getElementById('nav-toggle');
const menu = document.querySelector('.menu');
const closeMenu = ()=>{
  menu?.classList.remove('open');
  if(navToggle){
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
  }
};

if(navToggle){
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.addEventListener('click', ()=>{
    const isOpen = !!menu?.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });
}
// Cerrar menú al seleccionar un link
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click', closeMenu));

// ===== Smooth scroll (offset header) =====
const OFFSET = 90; // coincide con header alto
function smoothScrollTo(target){
  const el = document.querySelector(target);
  if(!el) return;
  const y = el.getBoundingClientRect().top + window.pageYOffset - OFFSET;
  window.scrollTo({top:y, behavior:'smooth'});
}
document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click', (e)=>{
    const href = link.getAttribute('href');
    if(href && href.length > 1){
      e.preventDefault();
      smoothScrollTo(href);
    }
  })
});

// ===== Active section on scroll =====
const sections = [...document.querySelectorAll('section[id]')];
const navLinks = [...document.querySelectorAll('.menu a[href^="#"]')];
const setActive = throttle(()=>{
  let current = sections[0]?.id;
  sections.forEach(sec=>{
    const top = sec.getBoundingClientRect().top - OFFSET - 20;
    if(top <= 0) current = sec.id;
  });
  navLinks.forEach(a=>{
    const href = a.getAttribute('href')?.slice(1);
    a.classList.toggle('active', href === current);
  })
}, 150);
window.addEventListener('scroll', setActive);
setActive();

// ===== Reveal on scroll =====
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){ entry.target.classList.add('is-visible'); io.unobserve(entry.target);} 
  })
},{ rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

// ===== Counters (stats del hero) =====
function animateCounter(el, cfg){
  const { value, prefix = '', suffix = '' } = cfg;
  const dur = 1400; const start = performance.now();
  function step(now){
    const p = Math.min((now - start)/dur, 1);
    const current = Math.floor(p * value).toLocaleString('es-MX');
    el.textContent = `${prefix}${current}${suffix}`;
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const statMap = new Map();
document.querySelectorAll('.hero-stats strong').forEach(str=>{
  const original = (str.textContent || '').trim();
  const digits = original.match(/[0-9]+/g);
  if(!digits){
    str.dataset.static = original;
    return;
  }
  const numericValue = Number(digits.join(''));
  if(!Number.isFinite(numericValue)){
    str.dataset.static = original;
    return;
  }
  const firstIdx = original.indexOf(digits[0]);
  const lastChunk = digits[digits.length - 1];
  const lastIdx = original.lastIndexOf(lastChunk) + lastChunk.length;
  const prefix = original.slice(0, firstIdx);
  const suffix = original.slice(lastIdx);
  str.textContent = `${prefix}0${suffix}`;
  statMap.set(str, { value:numericValue, prefix, suffix });
});
const statsObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const strong = entry.target.querySelector('strong');
      if(strong && statMap.has(strong)){
        animateCounter(strong, statMap.get(strong));
        statsObserver.unobserve(entry.target);
      }
    }
  })
},{ threshold: 0.4 });
document.querySelectorAll('.hero-stats li').forEach(li=> statsObserver.observe(li));

// ===== Parallax orbs en hero =====
const orbs = document.querySelectorAll('.hero-orb');
window.addEventListener('mousemove', throttle((e)=>{
  const cx = window.innerWidth/2; const cy = window.innerHeight/2;
  const dx = (e.clientX - cx)/cx; const dy = (e.clientY - cy)/cy;
  orbs.forEach((orb, i)=>{
    const strength = (i+1) * 6;
    orb.style.transform = `translate(${dx*strength}px, ${dy*strength}px)`;
  })
}, 40));

// ===== Back to top =====
const backToTop = document.createElement('button');
backToTop.id = 'backToTop';
backToTop.innerHTML = '↑';
document.body.appendChild(backToTop);
backToTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
window.addEventListener('scroll', throttle(()=>{
  if(window.scrollY > 600) backToTop.classList.add('show');
  else backToTop.classList.remove('show');
}, 100));

// ===== Acordeones (Servicios) =====
function setupAccordions(root=document){
  const groups = root.querySelectorAll('[data-accordion]');
  groups.forEach(group=>{
    const items = group.querySelectorAll('.acc-item');
    items.forEach(item=>{
      const trigger = item.querySelector('.acc-trigger');
      const panel = item.querySelector('.acc-panel');
      if(!trigger || !panel) return;

      const measure = ()=> {
        panel.style.maxHeight = panel.hidden ? '0px' : panel.scrollHeight + 'px';
      };

      panel.hidden = true;
      panel.style.maxHeight = '0px';

      trigger.addEventListener('click', ()=>{
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
        measure();
      });

      new ResizeObserver(()=> measure()).observe(panel);
    });
  });
}
setupAccordions();

// ===== Form handler (demo) =====
const form = document.getElementById('contact-form');
function toast(msg, ok=true){
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position='fixed'; t.style.left='50%'; t.style.bottom='24px'; t.style.transform='translateX(-50%)';
  t.style.padding='12px 16px'; t.style.borderRadius='12px';
  t.style.color= ok? '#155724':'#721c24';
  t.style.background= ok? '#d4edda': '#f8d7da';
  t.style.boxShadow='0 8px 24px rgba(0,0,0,.15)'; t.style.zIndex='2000';
  document.body.appendChild(t); setTimeout(()=> t.remove(), 3200);
}
form?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if(!data.nombre || !data.correo || !data.mensaje){ toast('Por favor completa todos los campos', false); return; }
  try{
    // Reemplazar por tu endpoint real
    // await fetch('/api/contact', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(data) });
    toast('¡Mensaje enviado! Te contactaremos pronto.');
    form.reset();
  }catch(err){ toast('No se pudo enviar. Intenta más tarde.', false); }
});

// ===== Accesibilidad extra =====
window.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){ closeMenu(); }
});
