const form = document.getElementById('validateFormAjax');
const fileInput = document.getElementById('emailFile');
const textarea = document.getElementById('manualEmails');
const btn = document.getElementById('validateBtn');
const messageBox = document.getElementById('formMessage');

form?.addEventListener('submit', function (e) {

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
  }

  textarea.readOnly = true;    
  btn.disabled = true;         
  btn.disabled = true;         
  btn.textContent = "Validation"
});

const fileInputs = document.getElementById('emailFile');
const label = document.getElementById('uploadLabel');
const uploadAnim = document.getElementById('uploadAnimation');
const loader = uploadAnim.querySelector('.circle-loader');
const checkmark = uploadAnim.querySelector('.checkmark');
let message = document.getElementById('uploadMessage');
const fileNameDisplay = document.getElementById('fileNameDisplay');

fileInputs?.addEventListener('change', () => {
  if (fileInputs.files.length > 0) {
    const fileName = fileInputs.files[0].name;

    btn.disabled = true;
    messageBox.textContent=""
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
  fileInput.disabled = false;
  textarea.disabled = false;
  btn.disabled = false;



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
  const menuBtn = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");
  
  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("open");
    navMenu.classList.toggle("open");
  });
