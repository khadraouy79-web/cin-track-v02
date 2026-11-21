const apiUrl = "https://6afaf147730c1d152f32ce46.mockapi.io/api/cineTrack";

async function request(path, method = "GET", data) {
  const options = { method };
  if (data) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(apiUrl + path, options);
    if (!response.ok) {
      throw new Error("Erreur HTTP " + response.status);
    }
    if (method !== "DELETE") return await response.json();
  } catch (error) {
    throw new Error("Impossible de contacter l’API. " + error.message);
  }
}

export function fetchFilms() {
  return request("/CineTrack");
}

export function saveFilm(film, id) {
  if (id == null) return request("/CineTrack", "POST", film);
  return request("/CineTrack/" + id, "PUT", film);
}

export function deleteFilm(id) {
  return request("/CineTrack/" + id, "DELETE");
}

export async function fetchComments(filmId) {
  const comments = await request("/comments");
  return comments.filter(comment => String(comment.filmId) === String(filmId));
}

export function addComment(comment) {
  return request("/comments", "POST", comment);
}
