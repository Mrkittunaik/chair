/* Swipeable image carousel: native scroll-snap (touch swipe + trackpad) + mouse drag, dots, arrows, auto-advance.
   Markup: .cx[data-carousel][data-auto] > .cx-track > .cx-slide*, optional .cx-dots > i*, .cx-nav.prev/.next */
(function(){
  const REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const INTERVAL = 3500, RESUME = 5000;
  function setup(cx){
    if(cx.__cx) return;
    const track = cx.querySelector(".cx-track"); if(!track) return;
    const slides = [...track.children], n = slides.length;
    const dots = [...cx.querySelectorAll(".cx-dots i")];
    let idx = 0, timer = null, paused = false, visible = false, resumeAt = 0, dragged = false;
    const auto = cx.dataset.auto === "1" && n > 1 && !REDUCED;
    const w = () => track.clientWidth || 1;
    function mark(i){
      if(i === idx) return; idx = i;
      dots.forEach((d,k)=>d.classList.toggle("on", k===i));
      cx.dispatchEvent(new CustomEvent("cx:change",{detail:{index:i}}));
    }
    function go(i, smooth){
      i = (i + n) % n;
      track.scrollTo({left: i*w(), behavior: smooth===false ? "auto" : "smooth"});
      mark(i);
    }
    track.addEventListener("scroll", ()=>{ mark(Math.max(0,Math.min(n-1,Math.round(track.scrollLeft/w())))); }, {passive:true});
    const hold = ()=>{ resumeAt = Date.now() + RESUME; };
    ["touchstart","pointerdown","wheel","keydown"].forEach(ev=>cx.addEventListener(ev,hold,{passive:true}));
    cx.addEventListener("mouseenter",()=>{ paused = true; });
    cx.addEventListener("mouseleave",()=>{ paused = false; hold(); });
    cx.addEventListener("focusin",()=>{ paused = true; });
    cx.addEventListener("focusout",()=>{ paused = false; });

    /* mouse drag (touch already swipes natively) */
    let sx = 0, sl = 0, down = false;
    track.addEventListener("pointerdown", e=>{
      if(e.pointerType !== "mouse" || e.button) return;
      down = true; dragged = false; sx = e.clientX; sl = track.scrollLeft;
    });
    window.addEventListener("pointermove", e=>{
      if(!down) return;
      const dx = e.clientX - sx;
      if(Math.abs(dx) > 4){ dragged = true; track.classList.add("dragging"); }
      if(dragged) track.scrollLeft = sl - dx;
    });
    window.addEventListener("pointerup", ()=>{
      if(!down) return; down = false;
      if(dragged){ track.classList.remove("dragging"); go(Math.round(track.scrollLeft/w())); }
    });
    track.addEventListener("click", e=>{ if(dragged){ e.preventDefault(); e.stopPropagation(); dragged = false; } }, true);
    track.addEventListener("dragstart", e=>e.preventDefault());

    const prev = cx.querySelector(".cx-nav.prev"), next = cx.querySelector(".cx-nav.next");
    if(prev) prev.addEventListener("click", e=>{ e.preventDefault(); e.stopPropagation(); hold(); go(idx-1); });
    if(next) next.addEventListener("click", e=>{ e.preventDefault(); e.stopPropagation(); hold(); go(idx+1); });
    window.addEventListener("resize", ()=>track.scrollTo({left: idx*w(), behavior:"auto"}));

    if(auto){
      const io = new IntersectionObserver(es=>{ visible = es[0].isIntersecting; }, {threshold:.4});
      io.observe(cx);
      /* stagger so a grid of cards doesn't all flip at once */
      const offset = Math.random()*1200;
      setTimeout(()=>{ timer = setInterval(()=>{
        if(!cx.isConnected){ clearInterval(timer); io.disconnect(); return; }
        if(paused || !visible || document.hidden || Date.now() < resumeAt) return;
        go(idx+1);
      }, INTERVAL); }, offset);
    }
    cx.__cx = {go};
  }
  function scan(root){ (root||document).querySelectorAll("[data-carousel]").forEach(setup); }
  window.initCarousels = scan;
  const start = ()=>{
    scan();
    const app = document.getElementById("app") || document.body;
    new MutationObserver(()=>scan(app)).observe(app,{childList:true,subtree:true});
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : start();
})();
