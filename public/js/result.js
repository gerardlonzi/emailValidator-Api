document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".clickable-row").forEach(row => {
    row.addEventListener("click", () => {
      const index = row.getAttribute("data-index");
      const dropdown = document.getElementById(`dropdown-${index}`);

      if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
      } else {
        document.querySelectorAll(".dropdown-row").forEach(d => d.classList.remove("show"));
        dropdown.classList.add("show");
      }
    });
  });

  const popup = document.getElementById('popup');
  const closeBtn = document.getElementById('popup-close');

  // Sélectionne uniquement les liens de téléchargement que tu veux contrôler
  const downloadLinks = document.querySelectorAll('.download-link');

  downloadLinks.forEach(link => {
    link.addEventListener('click', e => {
      if (link.dataset.missing === 'true') { // si le fichier est supprimé
        e.preventDefault(); // empêche le téléchargement
        popup.style.display = 'flex'; // affiche le popup
      }
    });
  });

  // Fermer le popup en cliquant sur la croix
  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });

  // Fermer le popup si clic en dehors du contenu
  popup.addEventListener('click', e => {
    if (e.target === popup) popup.style.display = 'none';
  });
});