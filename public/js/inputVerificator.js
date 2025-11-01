
const form = document.getElementById('validateFormAjax');
const fileInput = document.getElementById('emailFile');
const textarea = document.getElementById('manualEmails');
const btn = document.getElementById('validateBtn');
const processing = document.getElementById('processing');
const messageBox = document.getElementById('formMessage');

form.addEventListener('submit', async function (e) {

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
  else{
    const fd = new FormData(form);
    await fetch(form.action, { method: 'POST', body: fd });

    fileInput.disabled = true;
  textarea.disabled = true;
  btn.disabled = true;
  processing.classList.remove('hidden');

  }



 
});

