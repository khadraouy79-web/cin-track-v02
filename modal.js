import { fetchComments, addComment } from "./api.js";
const moviePopup = document.getElementById("moviePopup");
const closePopup = document.getElementById("closePopup");
const popupImage = document.getElementById("popupImage");
const popupTitele = document.getElementById("popupTitle");
const popupInfo = document.getElementById("popupInfo");

export function openMoviePopup(film) {
  popupImage.src = film.image;
  popupImage.alt = film.title;
  popupTitele.textContent = film.title;
  popupInfo.innerHTML = "";

   Object.entries(film).forEach(([key, value]) => {
    if (["id", "image", "title"].includes(key)) return;

    const line = document.createElement("p");
    const label = document.createElement("strong");

    label.textContent = `${key} : `;

    const text = Array.isArray(value)
      ? value.join(", ")
      : value !== null && typeof value === "object"
        ? JSON.stringify(value)
        : String(value ?? "Non renseigné");

    line.append(label, document.createTextNode(text));
    popupInfo.append(line);
  });

  moviePopup.classList.remove("hidden");
  loadComments(film.id);
}

function hideMoviePopup() {
  moviePopup.classList.add("hidden");
  viewNumber++;
}

closePopup.addEventListener("click", hideMoviePopup);

moviePopup.addEventListener("click", (event) => {
  if (event.target === moviePopup) {
    hideMoviePopup();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideMoviePopup();
  }
});

const commentForm = document.getElementById("commentForm");
const commentText = document.getElementById("commentText");
const rating = document.getElementById("rating");
const commentsList = document.getElementById("commentsList");
const average = document.getElementById("average");
const commentStatus = document.getElementById("commentStatus");
const publish = commentForm.querySelector("button");
let currentFilmId;
let viewNumber = 0;
let comments = [];

function displayComments() {
  const notes = comments.map(comment => Number(comment.rating))
    .filter(note => Number.isInteger(note) && note >= 1 && note <= 5);
  const total = notes.reduce((sum, note) => sum + note, 0);
  average.textContent = notes.length ? "Note moyenne : " + (total / notes.length).toFixed(1) + "/5" : "Aucune note";
  commentsList.replaceChildren();
  comments.forEach(comment => {
    if (!comment.text) return;
    const item = document.createElement("li");
    item.textContent = comment.text;
    commentsList.append(item);
  });
  if (!commentsList.children.length) commentsList.textContent = "Aucun commentaire.";
}

async function loadComments(filmId) {
  const view = ++viewNumber;
  currentFilmId = filmId;
  commentsList.replaceChildren();
  average.textContent = "";
  commentForm.reset();
  publish.disabled = true;
  commentStatus.textContent = "Chargement des commentaires…";
  try {
    const results = await fetchComments(filmId);
    if (view !== viewNumber) return;
    comments = results;
    displayComments();
    commentStatus.textContent = "";
    publish.disabled = false;
  } catch (error) {
    if (view === viewNumber) commentStatus.textContent = error.message;
  }
}

commentForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (publish.disabled) return;
  const text = commentText.value.trim();
  const note = Number(rating.value);
  if (!text && !note) {
    commentStatus.textContent = "Écrivez un commentaire ou choisissez une note.";
    return;
  }
  const view = viewNumber;
  publish.disabled = true;
  commentStatus.textContent = "Publication…";
  try {
    const saved = await addComment({ filmId: String(currentFilmId), text, rating: note || null });
    if (view !== viewNumber) return;
    comments.push(saved);
    displayComments();
    commentForm.reset();
    commentStatus.textContent = "Avis publié.";
  } catch (error) {
    if (view === viewNumber) commentStatus.textContent = error.message;
  } finally {
    if (view === viewNumber) publish.disabled = false;
  }
});
