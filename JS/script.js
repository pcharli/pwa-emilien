//Form elements
const $searchForm = document.querySelector(".search__form");
const $dayInput = document.querySelector("#day");
const $monthInput = document.querySelector("#month");
const $yearInput = document.querySelector("#year");

//zones pour afficher le nombre de résultats
const $nb_result = document.querySelector(".nbr");
const $resultTitle = document.querySelector(".result__title");
const $resultContainer = document.querySelector(".result__container");

// fonction pour mettre la première lettre en majuscule
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

//gestion de la non connexion
handleOffline();

// gestion de la mise offline
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("js/sw.js");
}

//soumission du formulaire
$searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Sauvegarder la date de recherche dans le localStorage
  const searchDate = {
    day: $dayInput.value,
    month: $monthInput.value,
    year: $yearInput.value,
  };
  localStorage.setItem("searchDate", JSON.stringify(searchDate));

  //lancement de la requête sur Wikipedia
  let events = await fetchEvents();
  //stockage des events en cache
  localStorage.setItem("events", JSON.stringify(events));
  //affciahe des events
  displayEvents(events);
});


//Displays the events in the result div and an error message if there is no events
async function displayEvents(events) {
  // Récupérer les valeurs des inputs
  let day = $dayInput.value;
  let month = $monthInput.value;
  let year = $yearInput.value;

  // Si les inputs sont vides (cas offline), on utilise la date stockée
  if (!day || !month) {
    const storedDate = localStorage.getItem("searchDate");
    if (storedDate) {
      const dateObj = JSON.parse(storedDate);
      day = dateObj.day;
      month = dateObj.month;
      year = dateObj.year;
    }
  }

  // Mettre à jour le titre avec la date (si année est présente)
  $resultTitle.innerHTML = `${events.length} résultats pour ${day}/${month}${year ? '/' + year : ''} :`;
  // affichage du titre
  $resultTitle.classList.remove("hidden");

  //si pas d'event, affichage d'un message
  if (events == undefined || events.length == 0) {
    $resultContainer.innerHTML = `<i class="fa-solid fa-face-sad-tear arrow"></i> Aucun événement trouvé pour cette date.`;
    return;
  }

  //si events, on les trie par année
  events.sort((a, b) => a.year - b.year);
  $resultContainer.innerHTML = "";
  for (const eventData of events) {
    // on va créer une carte par event
    createEventcard(eventData);
  }
}



//Wrapper method to fetch the events
async function fetchEvents() {
  //requête
  const result = await fetch(
    `${API_ENDPOINT}/${$monthInput.value}/${$dayInput.value}`
  );
  //traitement de la réponse
  let events = (await result.json()).events;

  //si une année est fournie
  if ($yearInput.value !== "" && events != undefined) {
    //on la converti en nombre (c'est du texte sinon)
    const year = Number.parseInt($yearInput.value);
    //??
    events = events.filter((article) => year == article.year);
  }

  return events;
}

//Create a single event card
async function createEventcard(eventData) {
  const pages = eventData.pages;
  const image = pages[0].thumbnail?.source;
  const imageAlt = pages[0].title;
  const articleLink = pages[0].content_urls.desktop.page;
  pages.splice(0, 1);

  let links = pages.map(
    (page) =>
      `<a href="${page.content_urls.desktop.page}">${page.displaytitle}</a>`
  );

  if (links.length == 0) {
    links = "Pas d'articles liés";
  } else {
    //transforme un tableau de lien en une phrase ??
    links = links.reduce((a, value) => (a = a + ", " + value));
  }

  $resultContainer.innerHTML += `
    <details class="card">
      <summary class="card__title">
        ${eventData.year} - ${imageAlt.replace(/_/g, ' ')}
      </summary>
      <div>
        <div class="card__more">
          <img class="card__image" src="${image}" alt="${imageAlt}"/>
          <div class="card__info">
            <p class="card__text">${capitalizeFirstLetter(eventData.text)}</p>
          </div> 
        </div>
        <div class="card__links">
          <a class="card__article" href="${articleLink}">🔗 Lire l'article complet</a>
          <p class="card__also">Voir aussi : ${links}</p>
        </div>
      </div>
    </details>
    `;
}
//
//Fetch the api to check online status
async function isOnline() {
  try {
    const result = await fetch(`${API_ENDPOINT}/1/1`);
    return result.ok;
  } catch (Exception) {
    return false;
  }
}

//Handle offline connection load last fetched data
//and remove the forms
//Add a listener to refresh the page when the connexion comes back
async function handleOffline() {
  if (!(await isOnline())) {
    const loadedEvents = JSON.parse(localStorage.getItem("events"));
    if (loadedEvents) {
      displayEvents(loadedEvents);
    }

    window.addEventListener("online", (e) => {
      location.reload();
    });

    $searchForm.innerHTML =
      `<p><i class="fa-solid fa-triangle-exclamation text-red-100"></i> Aucune connexion au réseau. Impossible d'envoyer une requête, veuillez réessayer <i class="fa-solid fa-triangle-exclamation"></i></p>`;
  }
}
