"use strict";

const $showsList = $("#shows-list");
const $episodesList = $("#episodes-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $episodeButton = $(".getEpisodes");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`);
  const data = res.data;
  // console.log(data); sanity check

  let shows = data.map(function(obj){
    let show = obj.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : `https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300`
    };
  })
  // console.log(shows); sanity check
  return shows;
  
  // return [
  //   {
  //     id: 1767,
  //     name: "The Bletchley Circle",
  //     summary:
  //       `<p><b>The Bletchley Circle</b> follows the journey of four ordinary 
  //          women with extraordinary skills that helped to end World War II.</p>
  //        <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their 
  //          normal lives, modestly setting aside the part they played in 
  //          producing crucial intelligence, which helped the Allies to victory 
  //          and shortened the war. When Susan discovers a hidden code behind an
  //          unsolved murder she is met by skepticism from the police. She 
  //          quickly realises she can only begin to crack the murders and bring
  //          the culprit to justice with her former friends.</p>`,
  //     image:
  //         "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
  //   }
  // ]
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="getEpisodes" id="${show.id}">Episodes</button>
           </div>
         </div>  
       </div>
      `);
    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
  document.querySelector(`#search-query`).value = '';
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
// async function getEpisodesOfShow(id) { }

async function getEpisodes(showId){
  const res = await axios.get(`https://api.tvmaze.com/shows/${showId}/episodes`);
  const data = res.data;

  let episodes = data.map(function(episode){
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }
  })
  return episodes;
}

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }
function populateEpisodes(episodes){
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
    $episodesList.append($episode);
  }
  $episodesArea.show()
}

$showsList.on("click", "button", async function(){
  $showsList.empty();

  const res = await axios.get(`https://api.tvmaze.com/shows/${this.id}`)
  const data = res.data;
  const show = {
      id: data.id,
      name: data.name,
      summary: data.summary,
      image: data.image ? data.image.medium : `https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300`
    };

  const $show = $(
    `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
     <div class="media">
       <img 
          src="${show.image}" 
          alt="${show.name}" 
          class="w-25 mr-3">
       <div class="media-body">
         <h5 class="text-primary">${show.name}</h5>
         <div><small>${show.summary}</small></div>
         <button class="getEpisodes" id="${show.id}">Episodes</button>
       </div>
     </div>  
   </div>
  `);
  $showsList.append($show);

  const episodesArr = await getEpisodes(parseInt(this.id));
  populateEpisodes(episodesArr);
});
