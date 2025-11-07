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
});