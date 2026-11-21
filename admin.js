import { fetchFilms, saveFilm, deleteFilm } from "./api.js";
import { refreshPagination, debounce } from "./cabin.js";

const status = document.getElementById("status");
const form = document.getElementById("filmForm");
const fields = document.getElementById("filmFields");
const formTitle = document.getElementById("formTitle");
const preview = document.getElementById("preview");
let data = [];
let busy = false;
const adminCard = document.getElementById("adminCard");
const typeCard = document.getElementById("typeCard");
const dateCard = document.getElementById("dateCard");
const admiButton = document.getElementById("admiButton");
const deleteButton = document.getElementById("deleteButton");
const searshBar = document.getElementById("searshBar");
const selectType = document.getElementById("selectType");
const saveButton = document.getElementById("ajoutModify");

const filmTitle = document.getElementById("filmTitle");
const filmType = document.getElementById("filmType");
const filmYear = document.getElementById("filmYear");
const filmImage = document.getElementById("filmImage");
const filmDescription = document.getElementById("filmDescription");

let selectedFilm = null;

function displayFilms(films) {
  adminCard.replaceChildren();
  typeCard.replaceChildren();
  dateCard.replaceChildren();
  admiButton.replaceChildren();
  deleteButton.replaceChildren();

  films.forEach(film => {
    const rowClasses =
      "flex h-28 items-center border-b border-zinc-700 px-4";

    const card = document.createElement("article");
    card.className = `card movie-card ${rowClasses} gap-4 py-2`;

    const image = document.createElement("img");
    image.src = film.image ?? "";
    image.alt = film.title ?? "";
    image.className = "w-10 h-10 object-cover";

    const title = document.createElement("div");
    title.textContent = film.title ?? "";
    title.className = "text-xl font-bold text-white";

    const type = document.createElement("div");
    type.textContent = film.type ?? "";
    type.className = `${rowClasses} text-xl font-bold text-white`;

    const date = document.createElement("div");
    date.textContent = film.releaseYear ?? "";
    date.className = `${rowClasses} text-xl font-bold text-white`;

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Modifier";
    editButton.className = `${rowClasses} rounded-xl border border-solid border-blue-600 bg-blue-400/20 px-1 text-xl font-bold text-blue-600 transition-transform duration-150 active:scale-95`;

    editButton.addEventListener("click", () => {
      if (busy) return;
      selectedFilm = film;

      filmTitle.value = film.title ;
      filmType.value = film.type ;
      filmYear.value = film.releaseYear ;
      filmImage.value = film.image ;
      filmDescription.value = film.description ;

      saveButton.textContent = "Modifier";
      formTitle.textContent = "Modifier un contenu";
      updatePreview();
      filmTitle.focus();
    });

    const adminDelete = document.createElement("button");
    adminDelete.type = "button";
    adminDelete.textContent = "Delete";
    adminDelete.className = `${rowClasses} text-xl rounded-xl border border-solid border-red-600 bg-red-400/20 px-1 text-xl font-bold text-red-600 transition-transform duration-150 active:scale-95`;

    card.append(image, title);
    adminCard.append(card);
    typeCard.append(type);
    dateCard.append(date);
    admiButton.append(editButton);
    deleteButton.append(adminDelete);

    adminDelete.addEventListener("click", async () => {
      if (busy || !confirm("Supprimer « " + film.title + " » ?")) return;
      setBusy(true, "Suppression…");
      try {
        await deleteFilm(film.id);
        data = data.filter(item => item.id !== film.id);
        if (selectedFilm?.id === film.id) resetForm();
        showSearchResults();
        status.textContent = "Contenu supprimé.";
      } catch (error) {
        status.textContent = error.message;
      } finally {
        setBusy(false);
      }
    });
  });
  refreshPagination();
}

function setBusy(value, message) {
  busy = value;
  fields.disabled = value;
  if (message) status.textContent = message;
}

function showSearchResults() {
  const search = searshBar.value.trim().toLowerCase();
  const results = data.filter(film =>
    film.title.toLowerCase().includes(search) &&
    (!selectType.value || film.type === selectType.value)
  );
  displayFilms(results);
}

function updatePreview() {
  preview.hidden = !filmImage.value || !filmImage.validity.valid;
  if (preview.hidden) preview.removeAttribute("src");
  else preview.src = filmImage.value.trim();
}

function resetForm() {
  selectedFilm = null;
  form.reset();
  updatePreview();
  formTitle.textContent = "Ajouter un contenu";
  saveButton.textContent = "Ajouter";
}

filmImage.addEventListener("input", updatePreview);
document.getElementById("anuler").addEventListener("click", resetForm);
searshBar.addEventListener("input", debounce(showSearchResults));
selectType.addEventListener("change", showSearchResults);

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (busy) return;
  const film = {
    title: filmTitle.value.trim(),
    type: filmType.value,
    releaseYear: Number(filmYear.value),
    image: filmImage.value.trim(),
    description: filmDescription.value.trim()
  };
  if (!film.title || !film.description) {
    status.textContent = "Saisissez un titre et une description.";
    return;
  }

  const id = selectedFilm?.id;
  setBusy(true, "Enregistrement…");
  try {
    const saved = await saveFilm(film, id);
    if (id == null) data.push(saved);
    else data = data.map(item => item.id === id ? { ...item, ...saved } : item);
    resetForm();
    showSearchResults();
    status.textContent = id == null ? "Contenu ajouté." : "Contenu modifié.";
  } catch (error) {
    status.textContent = error.message;
  } finally {
    setBusy(false);
  }
});

async function loadFilms() {
  setBusy(true, "Chargement…");
  try {
    data = await fetchFilms();
    showSearchResults();
    status.textContent = "";
  } catch (error) {
    status.textContent = error.message;
  } finally {
    setBusy(false);
  }
}

loadFilms();
