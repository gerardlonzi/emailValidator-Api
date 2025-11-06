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
  
    // Paramètres
    const delayBetweenSlides = 3000;   // temps entre chaque déplacement (ms)
    const transitionTime = 800;        // durée du déplacement (ms)
  
    // 1) on capture le nombre d'items d'origine
    const originalItems = Array.from(track.children);
    const originalCount = originalItems.length;
  
    // 2) dupliquer le contenu pour permettre un défilement "infini" fluide
    track.innerHTML += track.innerHTML; // maintenant track contient 2 * originalCount items
  
    // 3) récupérer la NodeList des items APRÈS duplication
    let items = Array.from(track.querySelectorAll('.testimonial-item'));
  
    // 4) largeur d'un item (calculée dynamiquement)
    function getItemWidth() {
      // utiliser la largeur réelle du premier item (utile en responsive)
      return items[0].getBoundingClientRect().width;
    }
  
    let index = 0;                     // position actuelle (en items)
    const maxIndex = originalCount;    // quand index atteint originalCount -> reset invisible
    let intervalId = null;
    let isPaused = false;
  
    // applique la transition pour le track
    function setTransition(enabled) {
      track.style.transition = enabled ? `transform ${transitionTime}ms ease-in-out` : 'none';
    }
  
    // déplacement vers l'index courant
    function goToIndex(i) {
      const w = getItemWidth();
      track.style.transform = `translateX(-${i * w}px)`;
    }
  
    // fonction qui bouge d'un item
    function moveOnce() {
      if (isPaused) return;
      index++;
      setTransition(true);
      goToIndex(index);
  
      // si on atteint la fin des items originaux, on reset proprement après la transition
      if (index >= maxIndex) {
        // attendre la fin de la transition puis remettre sans transition à l'origine
        const onTransitionEnd = () => {
          // détacher l'écouteur pour éviter multiples appels
          track.removeEventListener('transitionend', onTransitionEnd);
  
          // désactiver transition et remettre l'index à 0 (position identique visuellement)
          setTransition(false);
          index = 0;
          goToIndex(index);
  
          // forcer reflow pour que la prochaine transition soit appliquée correctement
          // (lecture de offsetWidth force le navigateur à appliquer les changements)
          void track.offsetWidth;
        };
        track.addEventListener('transitionend', onTransitionEnd);
      }
    }
  
    // démarre l'auto-play
    function startAuto() {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(moveOnce, delayBetweenSlides);
    }
  
    function stopAuto() {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
    }
  
    // Pause au survol
    carousel.addEventListener('mouseenter', () => {
      isPaused = true;
      stopAuto();
    });
    carousel.addEventListener('mouseleave', () => {
      isPaused = false;
      // petit délai pour éviter double déclenchement immédiat
      setTimeout(() => startAuto(), 200);
    });
  
    // Recalculer items et largeur si la fenêtre change (responsive)
    window.addEventListener('resize', () => {
      // recomposer la liste d'items (au cas où le DOM a changé) et recaler la translate
      items = Array.from(track.querySelectorAll('.testimonial-item'));
      // recalculer la position visuelle actuelle
      goToIndex(index);
    });
  
    // Kick-off
    // S'assurer qu'on part de la position 0 sans transition
    setTransition(false);
    goToIndex(0);
    // Forcer reflow
    void track.offsetWidth;
  
    // démarrer l'auto-play
    startAuto();
  })();

  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const toggle = item.querySelector('.faq-toggle');
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      // Fermer les autres FAQ avant d'ouvrir la sélectionnée
      faqItems.forEach(i => {
        if (i !== item) i.classList.remove('active');
      });

      // Basculer l'état de celle cliquée
      item.classList.toggle('active');
    });
  });