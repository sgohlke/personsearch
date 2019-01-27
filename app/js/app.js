function start() {
		let currentURI = window.location.hash;
		changeText();

		if ("onhashchange" in window) {
			console.log("This browser supports hashchange events!");
			window.onhashchange = locationHashChanged;
		}
}

function locationHashChanged() {
		console.log('Location Hashbang: ' + location.hash);
		changeText();
	}

function changeText() {
	let siteHTML ="";

	switch (window.location.hash) {
		case "#!search":
			siteHTML = getSearchPage();
			break;
		case "#!start":
			siteHTML = "Welcome to our start page!";
			document.getElementById('content').innerHTML = siteHTML;
			break;
		default:
			siteHTML = "A default text!";
			document.getElementById('content').innerHTML = siteHTML;
	}
}


function getSearchPage() {
  let siteHTML ="";
  document.getElementById('content').innerHTML = "<section id='searchform'></section><aside id='additionalInfo'></aside><section id='trefferliste'></section>";
  let result = Promise.all([appendToHTMLPage('templates/search/searchform.html', 'searchform'), appendToHTMLPage('templates/search/fruits.html', 'additionalInfo'), appendToHTMLPage('templates/search/trefferliste.html', 'trefferliste') ])
  .then((response) => {
    document.getElementById('suchfeld').addEventListener('keyup', triggerSearch);
  }, false);
}

function triggerSearch() {
  searchForText(document.getElementById('suchfeld').value);
}

function searchForText(text) {
  console.log("searchForText with text: ", text)
  document.getElementById('searchQuery').innerHTML = text ;
  
  if(!text) {
    document.getElementById('searchResults').classList.add("hidden");
    document.getElementById('searchResultsLoadMessage').classList.add("hidden");

    if (document.getElementById('fruitsHasMore')) {
    	document.getElementById('fruitsHasMore').classList.add("hidden");
    }
    document.getElementById('fruitsList').classList.add("hidden");
    document.getElementById('fruitsLoadMessage').classList.add("hidden");
    return;
  }

  //Set search query view
  
  searchDocuments(text);
  searchFruits(text);
}

function searchDocuments(text) {
  document.getElementById('searchResults').classList.add("hidden");
  document.getElementById('searchResultsLoadMessage').classList.remove("hidden");

  return fetch(`http://192.168.99.100:3000/person/search/${text}`, { headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
        'Connection': 'keep-alive',
        'Host': 'localhost:3000',
        'Origin': 'http://localhost:8000',
        'Referer': 'http://localhost:8000/'
      }, method: 'GET', mode: 'cors', cache: 'default' })
      .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' + response.status);
          return;
        }

        response.json().then(function(data) {
        console.log("JSON-Data für Namen ist: " , data);
        let siteHTML = '';
        if (data) {
          data.forEach(function(entryData, index) {
            siteHTML = siteHTML + createSearchResultEntry(entryData);
          });
        } else {
          siteHTML = "Es wurden leider keine Treffer für die gewünschten Suchanfrage gefunden!"
        }


        document.getElementById('searchResults').classList.remove("hidden");
        document.getElementById('searchResults').innerHTML = siteHTML;
        document.getElementById('searchResultsLoadMessage').classList.add("hidden");
        });
      })
      .catch(function(err) {
      console.log('Fetch Error :-S', err);
      });
}

function searchFruits(text) {
  document.getElementById('fruitsList').classList.add("hidden");
  document.getElementById('fruitsLoadMessage').classList.remove("hidden");
  return fetch(`http://192.168.99.100:3000/person/fruit/${text}`, { headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
        'Connection': 'keep-alive',
        'Host': 'localhost:3000',
        'Origin': 'http://localhost:8000',
        'Referer': 'http://localhost:8000/'
      }, method: 'GET', mode: 'cors', cache: 'default' })
      .then(
      function(response) {
        if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
        }

        response.json().then(function(data) {
        console.log("JSON-Data fuer Fruits ist: " , data);

        if (data) {
          if (data.length > 0) {
            let siteHTML = '';
            data.forEach(function(entryData, index) {
              siteHTML = siteHTML + creatFruitsResultEntry(entryData);
            });
            document.getElementById('fruitsList').classList.remove("hidden");
            document.getElementById('fruitsList').innerHTML = siteHTML;
            document.getElementById('fruitsLoadMessage').classList.add("hidden");
            if (document.getElementById('fruitsHasMore') && data.length > 10) {
              document.getElementById('fruitsHasMore').classList.remove("hidden");
            }
          } else {
            document.getElementById('fruitsList').classList.add("hidden");
            document.getElementById('fruitsLoadMessage').classList.add("hidden");
            if (document.getElementById('fruitsHasMore')) {
              document.getElementById('fruitsHasMore').classList.add("hidden");
            }
          }
        }
        });
      })
      .catch(function(err) {
      console.log('Fetch Error :-S', err);
      });
}

function appendToHTMLPage(pageURL, targetContainer) {
  return fetch(pageURL)
    .then(
    function(response) {
      if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
        response.status);
      return;
      }
      response.text().then(function(data) {
        document.getElementById(targetContainer || 'content').innerHTML = document.getElementById(targetContainer || 'content').innerHTML + data;
      });
    }
    )
    .catch(function(err) {
    console.log('Fetch Error :-S', err);
    });
}

function createSearchResultEntry(givenEntry) {
  let entryHTML = '<article class="searchResultEntry">';

  entryHTML = entryHTML + `<h5><a href="#">${givenEntry.name.last}, ${givenEntry.name.first}</a></h5>`
  entryHTML = entryHTML +  `<span class="quelle">${givenEntry.email}`
  
  if (givenEntry.tags) {
	  entryHTML = entryHTML + " | Tags: "
	  givenEntry.tags.forEach(function(element) {
		//console.log(element);
		entryHTML = entryHTML + `<span>${element}</span>, `;
		});
  }
  entryHTML = entryHTML + "</span><br>"

  if (givenEntry.registered) {
    entryHTML = entryHTML + `<span>${givenEntry.registered}</span>`
  }

  if (givenEntry.about) {
    entryHTML = entryHTML + `<span> - ${givenEntry.about}</span>`
  }
  return entryHTML + '</article>'
}

function creatFruitsResultEntry(givenEntry) {
  return `<li><span class="addInfoName">${givenEntry}</span><span class="addInfoCount">1</span></li>`;
}