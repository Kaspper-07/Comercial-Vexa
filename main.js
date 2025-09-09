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
const onScrollHeader = throttle(()=>{
  if(window.scrollY > 10){ header?.classList.add('is-scrolled'); }
  else { header?.classList.remove('is-scrolled'); }
}, 100);
window.addEventListener('scroll', onScrollHeader);

// ===== Menú móvil =====
const navToggle = document.getElementById('nav-toggle');
const menu = document.querySelector('.menu');
navToggle?.addEventListener('click', ()=> menu?.classList.toggle('open'));
// Cerrar menú al seleccionar un link
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=> menu.classList.remove('open')));

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
function animateCounter(el, to){
  const dur = 1200; const start = performance.now();
  function step(now){
    const p = Math.min((now - start)/dur, 1);
    el.textContent = Math.floor(p * to).toLocaleString('es-MX');
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const statMap = new Map();
document.querySelectorAll('.hero-stats strong').forEach(str=>{
  const raw = (str.textContent||'').replace(/[^0-9]/g, '');
  const val = Number(raw||0) || 0;
  str.textContent = '0';
  statMap.set(str, val);
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

      // Medición para transición suave
      const measure = ()=> {
        panel.style.maxHeight = panel.hidden ? '0px' : panel.scrollHeight + 'px';
      };
      // Estado inicial
      panel.hidden = true;
      panel.style.maxHeight = '0px';

      trigger.addEventListener('click', ()=>{
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        // Cerrar otros (acordeón exclusivo)
        items.forEach(other=>{
          if(other !== item){
            const t2 = other.querySelector('.acc-trigger');
            const p2 = other.querySelector('.acc-panel');
            if(t2 && p2){
              t2.setAttribute('aria-expanded','false');
              p2.hidden = true;
              p2.style.maxHeight = '0px';
            }
          }
        });
        // Toggle actual
        trigger.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
        measure();
      });

      // Recalcular al redimensionar
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
  if(e.key === 'Escape'){ menu?.classList.remove('open'); }
});
