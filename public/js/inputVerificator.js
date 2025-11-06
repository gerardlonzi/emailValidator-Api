const form = document.getElementById('validateFormAjax');
const fileInput = document.getElementById('emailFile');
const textarea = document.getElementById('manualEmails');
const btn = document.getElementById('validateBtn');
const processing = document.getElementById('processing');
const messageBox = document.getElementById('formMessage');

form?.addEventListener('submit', async function (e) {

  messageBox.textContent = "";
  messageBox.classList.add("hidden");

  const fileSelected = fileInput.files.length > 0;
  const manualText = textarea.value.trim();

  if (!fileSelected && !manualText) {
    e.preventDefault();
    messageBox.textContent = "⚠️ Veuillez importer un fichier CSV ou renseigner au moins une adresse e-mail.";
    messageBox.classList.remove("hidden");
    messageBox.classList.add("error");
    return;
  } else {
    const fd = new FormData(form);
    await fetch(form.action, { method: 'POST', body: fd });

    fileInput.disabled = true;
    textarea.disabled = true;
    btn.disabled = true;
    processing.classList.remove('hidden');
  }
});

const fileInputs = document.getElementById('emailFile');
const label = document.getElementById('uploadLabel');
const uploadAnim = document.getElementById('uploadAnimation');
const loader = uploadAnim.querySelector('.circle-loader');
const checkmark = uploadAnim.querySelector('.checkmark');
const message = document.getElementById('uploadMessage');
const fileNameDisplay = document.getElementById('fileNameDisplay');

fileInputs.addEventListener('change', () => {
  if (fileInputs.files.length > 0) {
    const fileName = fileInputs.files[0].name;

    btn.disabled = true;
    btn.textContent="chargement..."
    message.textContent = "⏳ Téléversement du fichier en cours...";
    message.classList.remove('hidden');
    checkmark.style.opacity = 0;
    uploadAnim.style.display = 'flex';
    label.querySelector('span').textContent = 'Téléversement...';
    fileNameDisplay.textContent = ''; 

    setTimeout(() => {
      loader.style.animation = 'none';
      checkmark.style.opacity = 1;
      label.querySelector('span').textContent = 'Importer un fichier CSV';

      fileNameDisplay.innerHTML = `<i class="bi bi-file-earmark-check-fill"></i> Fichier importé : ${fileName}`;
      message.textContent = `✅ Téléversement terminé. Cliquez sur "Vérifier" pour continuer.`;

      btn.textContent="Vérifier"

      btn.disabled = false;
    }, 3000);
  }
});


window.addEventListener('load', ()=>{
  fileInputs.value = ''; 

});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    fileInputs.value = ''; 
  }
});

const header = document.querySelector('header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) { 
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });


  (function () {
    const track = document.getElementById('track');
    const carousel = document.getElementById('carousel');
  
    const delayBetweenSlides = 3000;   
    const transitionTime = 800;       
  
    const originalItems = Array.from(track.children);
    const originalCount = originalItems.length;
  
    track.innerHTML += track.innerHTML; 
  
    let items = Array.from(track.querySelectorAll('.testimonial-item'));
  
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