const adminCard = document.getElementById("adminCard");
const container = adminCard ?? document.getElementById("cardsContainer");
const cardsPerPage = adminCard ? 5 : 6;
const prevButton = document.getElementById("prevBtn");
const nextButton = document.getElementById("nextBtn");
const pageNumbers = document.getElementById("page-numbers");
let currentPage = 1;

function displayPage() {
  const cards = Array.from(container.getElementsByClassName("card"));
  const totalPages = Math.ceil(cards.length / cardsPerPage);
  const start = (currentPage - 1) * cardsPerPage;
  const columns = document.querySelectorAll("#typeCard, #dateCard, #admiButton, #deleteButton");

  cards.forEach((card, index) => {
    const display = index >= start && index < start + cardsPerPage ? "" : "none";
    card.style.display = display;
    columns.forEach(column => {
      column.children[index].style.display = display;
    });
  });

  pageNumbers.textContent = totalPages ? `Page ${currentPage} of ${totalPages}` : "Aucun résultat";
  prevButton.disabled = currentPage <= 1;
  nextButton.disabled = currentPage >= totalPages;
}

prevButton.addEventListener("click", () => {
  currentPage--;
  displayPage();
});

nextButton.addEventListener("click", () => {
  currentPage++;
  displayPage();
});

export function refreshPagination() {
  currentPage = 1;
  displayPage();
}

export function debounce(callback, delay = 250) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(callback, delay);
  };
}
