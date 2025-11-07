(function () {
    const track = document.getElementById('track');
    const carousel = document.getElementById('carousel');
  
    const delayBetweenSlides = 3000;   
    const transitionTime = 800;       
  
    const originalItems = Array.from(track.children);
    const originalCount = originalItems?.length;
  
    track.innerHTML += track.innerHTML; 
  
    let items = Array.from(track?.querySelectorAll('.testimonial-item'));
  
    function getItemWidth() {
      return items[0].getBoundingClientRect().width;
    }
  
    let index = 0;                     
    const maxIndex = originalCount;    
    let intervalId = null;
    let isPaused = false;
  
    function setTransition(enabled) {
      track.style.transition = enabled ? `transform ${transitionTime}ms ease-in-out` : 'none';
    }
  
    function goToIndex(i) {
      const w = getItemWidth();
      track.style.transform = `translateX(-${i * w}px)`;
    }
  
    function moveOnce() {
      if (isPaused) return;
      index++;
      setTransition(true);
      goToIndex(index);
  
      if (index >= maxIndex) {
        const onTransitionEnd = () => {
          track.removeEventListener('transitionend', onTransitionEnd);
  
          setTransition(false);
          index = 0;
          goToIndex(index);
  
          void track.offsetWidth;
        };
        track.addEventListener('transitionend', onTransitionEnd);
      }
    }
  
    function startAuto() {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(moveOnce, delayBetweenSlides);
    }
  
    function stopAuto() {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
    }
  
    carousel.addEventListener('mouseenter', () => {
      isPaused = true;
      stopAuto();
    });
    carousel.addEventListener('mouseleave', () => {
      isPaused = false;
      setTimeout(() => startAuto(), 200);
    });
  
    window.addEventListener('resize', () => {
      items = Array.from(track.querySelectorAll('.testimonial-item'));
      goToIndex(index);
    });
  
    setTransition(false);
    goToIndex(0);
    void track.offsetWidth;
  
    startAuto();
  })();

  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const toggle = item.querySelector('.faq-toggle');
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      faqItems.forEach(i => {
        if (i !== item) i.classList.remove('active');
      });

      item.classList.toggle('active');
    });
  });

  document.getElementById("year").textContent = new Date().getFullYear();

const scrollBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  scrollBtn.style.display = window.scrollY > 300 ? "flex" : "none";
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});



