async function getRecommendItems(url, itemType, recommendType) {
  var recommendItems = {};
  if (url) {
    recommendItems = await fetch(
      'localhost:8000' + "/dimadb/get-list-recommend/?" + url,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    )
      .then((result) => result.json())
      .then((result) => {
         return {
            'itemType': itemType,
            'recommendType': recommendType,
            'items': result.items
        }
        })
      .catch((err) => []);
  }

  return recommendItems;
}


function getListView(containerId, res) {
    const recommendItems = res.items;
    const itemType = res.itemType;
    const recommendType = res.recommendType;
    if (recommendItems.length) {
      title = `Les ${itemType == "events" ? "événements" : "articles"}`;

      if (recommendType == "Most popular") {
        title += " les plus populaires";
      } else if (recommendType == "Upcoming") {
        title += " à venir";
      } else {
        title += " connexes";
      }

      document.getElementById(containerId).innerHTML += `
                <div class="recommend">
                    <h2 class="recommend-title">${title}</h2>
                    <div class="recommend-content" id="${title}">
                    </div>
                </div>
            `;

      for (item of recommendItems) {
        document.getElementById(title).innerHTML += `
                    <div class="recommend-container">
                        <img src="${item.img}" class="recommend-image"/>
                        <p class="recommend-name">
                            ${
                              itemType == "events"
                                ? item.event_name
                                : item.product_name
                            }
                        </p>
                        ${
                          itemType == "events"
                            ? `<div class="recommend-time">
                            <div>${item.next_date ? item.next_date.substring(0, 10) + "-" + item.location_name : item.location_name}</div>
                        </div>`
                            : ""
                        }
                        <div class="recommend-type">
                            <div>${
                              itemType == "events"
                                ? item.event_type.toUpperCase()
                                : item.product_type.toUpperCase()
                            }</div>
                        </div>
                        <a href="${item.url}" class="zoom">
                            En savoir plus &#x2192;
                        </a>
                    </div>
                `;
      }
    }
}

function generateRecommendAPI(
  itemType = "",
  level = "",
  domain = "",
  itemId = "",
  recommendType = "",
  quantity = 0
) {
  var api = "";

  api += "itemType=" + itemType;
  api += "&level=" + level;
  api += "&quantity=" + quantity;

  if (domain) api += "&domain=" + domain;
  if (itemId) api += "&itemId=" + itemId;

  if (recommendType != "Similar") api = api + "&recommendType=" + recommendType;

  return api;
}

function getItemType(locationUrl) {
  const articleTags = ["magazine", "product"];
  const eventTags = ["evenements", "event"];
  const locationParts = locationUrl.split("/");
  var itemType = "";

  for (const tag of articleTags) {
    if (locationParts.includes(tag)) {
      itemType = "products";
      break;
    }
  }

  for (const tag of eventTags) {
    if (locationParts.includes(tag)) {
      itemType = "events";
      break;
    }
  }

  return itemType;
}

function getDomain(itemType, locationUrl) {
  const articleTypes = [
    "arts-de-la-scene",
    "arts-mediatiques",
    "arts-visuels",
    "litterature",
    "metiers-dart",
    "musees",
    "patrimoine",
  ];
  const eventTypes = ["chanson", "humour", "cinema", "musique", "varietes"];
  const locationParts = locationUrl.split("/");
  var domain = "";

  if (itemType == "products") {
    for (const type of articleTypes) {
      if (locationParts.includes(type)) {
        domain = type;
        break;
      }
    }
  } else if (itemType == "events") {
    for (const type of eventTypes) {
      if (locationParts.includes(type)) {
        domain = type;
        break;
      }
    }
  }
  return domain;
}

function getRecommendLevel(domain, locationUrl) {
  const articleTags = ["magazine", "product"];
  const eventTags = ["evenements", "event"];
  const locationParts = locationUrl.split("/");
  const lastLocationPart = locationParts[locationParts.length - 1];
  var level = "";

  if (lastLocationPart == domain && domain != "") {
    level = "Domain";
  } else if (
    lastLocationPart != "" &&
    !eventTags.includes(lastLocationPart) &&
    !articleTags.includes(lastLocationPart)
  ) {
    level = "Item";
  } else {
    level = "Homepage";
  }
  return level;
}

function getItemId(level, locationUrl) {
  const locationParts = locationUrl.split("/");
  const lastLocationPart = locationParts[locationParts.length - 1];
  var itemId = "";

  if (level == "Item") itemId = lastLocationPart;

  return itemId;
}

function getMostPopularItems(
  itemType = "",
  level = "",
  domain = "",
  quantity = 0
) {
  const recommendType = "Most popular";
  const api = generateRecommendAPI(
    itemType,
    level,
    domain,
    "",
    recommendType,
    quantity
  );
  const items = getRecommendItems(api, itemType, recommendType);

  return items;
}

function getUpComingItems(
  itemType = "",
  level = "",
  domain = "",
  quantity = 0
) {
  const recommendType = "Upcoming";
  const api = generateRecommendAPI(
    itemType,
    level,
    domain,
    "",
    recommendType,
    quantity
  );
  const items = getRecommendItems(api, itemType, recommendType);

  return items;
}

function getSimilarItems(itemType = "", itemId = "", quantity = 0) {
  const recommendType = "Similar";
  const api = generateRecommendAPI(
    itemType,
    "Item",
    "",
    "",
    recommendType,
    quantity
  );
  const items = getRecommendItems(api);

  return items;
}

async function getRecommend(url, bearerToken) {
  var recommendItems = {};
  if (url) {
    recommendItems = await fetch(url,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    )
      .then((result) => result.json())
      .then((result) => {
          return {
            'itemType': result.itemType,
            'recommendType': result.recommendType,
            'items': result.items
        }
        })
      .catch((err) => []);
  }

  return recommendItems;
}


async function getRecommendation(url, bearerToken) {
  var recommendItems = [];
  if (url) {
    recommendItems = await fetch(url + '/?url=' + window.location.href,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    )
      .then((result) => result.json())
      .then((result) => {return result})
      .catch((err) => []);
  }

  return recommendItems;
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function generateUserToken(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function checkCookie() {
  let user = getCookie("recommender_cookie");
  if (user != "") {
    return user
  } else {
    user = generateUserToken(16);
    setCookie("recommender_cookie", user, 365);
    //send to db
    console.log('token',user)
  }
}

function getListViews(recommendations) {
  if (Array.isArray(recommendations)) {
    for (var idx=0; idx < recommendations.length; idx++) {
      const res = recommendations[idx];
      const recommendItems = res.items;
      const itemType = res.itemType;
      const recommendType = res.recommendType;
      if (recommendItems.length) {
        title = `Les ${itemType == "events" ? "événements" : "articles"}`;
  
        if (recommendType == "Most popular") {
          title += " les plus populaires";
        } else if (recommendType == "Upcoming") {
          title += " à venir";
        } else {
          title += " similaires";
        }
        var recommendDivId = `recommendation-${idx}`
        document.getElementById("recommendations").innerHTML+= `<div id=${recommendDivId}></div>`
        document.getElementById(recommendDivId).innerHTML += `
                  <div class="recommend">
                      <h2 class="recommend-title">${title}</h2>
                      <div class="recommend-content" id="${title}">
                      </div>
                  </div>
              `;
  
        for (item of recommendItems) {
          document.getElementById(title).innerHTML += `
                      <div class="recommend-container">
                          <img src="${item.img}" class="recommend-image"/>
                          <p class="recommend-name">
                              ${
                                itemType == "events"
                                  ? item.event_name
                                  : item.product_name
                              }
                          </p>
                          ${
                            itemType == "events"
                              ? `<div class="recommend-time">
                              <div>${item.next_date ? item.next_date.substring(0, 10) + "-" + item.location_name : item.location_name}</div>
                          </div>`
                              : ""
                          }
                          <div class="recommend-type">
                              <div>${
                                itemType == "events"
                                  ? item.event_type.toUpperCase()
                                  : item.product_type.toUpperCase()
                              }</div>
                          </div>
                          <a href="${item.url}" class="zoom">
                              En savoir plus &#x2192;
                          </a>
                      </div>
                  `;
        }
      }
    }
  }
}

const debounce = (func, delay=100) => {
  let debounceTimer
  return function() {
      const context = this
      const args = arguments
          clearTimeout(debounceTimer)
              debounceTimer
          = setTimeout(() => func.apply(context, args), delay)
  }
} 

async function send_capture(token, path, product_href,current_page) {
  console.log(path, token);
  console.log('localhost:8000' + "/dimadb/get-capture/");
  console.log(JSON.stringify({
    token: token,
    path : path,
  }));
  try{
    response_api = await fetch(
      // `http://localhost:8000/dimadb/get-capture?token=${token}&path=${path}`,
      'http://localhost:8000/dimadb/get-capture/',
      {
        method: "POST",
        body: JSON.stringify({
          token: token,
          path : path,
          product_href: product_href,
          current_page: current_page
        })
      }
    )
    .then((result) => result.json())
    .then((result) => {
      console.log(result)
       return result
      
      })
    .catch((err) => []);
  }
    // console.log("api",response_api.json());
  catch (error){
    console.log(error)
  }
    
  return []
}

function capture_event(e) {
  var evt = e || window.event;
  if (evt) {
    if (evt.isPropagationStopped && evt.isPropagationStopped()) {
      return;
    }
    var et = evt.type ? evt.type : evt;
    var time = Math.floor(Date.now() / 1000);
    // console.log("test111",evt)
    // console.log("test view",evt.view.window.location)
    var list = []
    var check_click = false;
    var s = "";
    var product_href = evt.view.window.location.href;
    var current_page = evt.view.window.location.origin;
    for (var i = 0; i < evt.path.length; i++){
      // console.log(i,evt.path[i].tagName, evt.path[i].id, evt.path[i].className);
      list.push(evt.path[i].tagName.toLowerCase())
      if (evt.path[i].tagName.toLowerCase() == 'html'){
        break;
      }
    }
    console.log("end")

    //todo: check is right path before send (query)
    send_capture(checkCookie(), list.join(" > "),product_href,current_page)
    
    
    // if (check_click == true)
    //   console.log("right",evt.path)


    // if (evt.pageX) {
    //   x = evt.pageX;
    // }
    // if (evt.pageY) {
    //   y = evt.pageY;
    // }
    // if (trgt.scrollTop) {
    //   scrolltop = trgt.scrollTop;
    // }
    // if (trgt.className && trgt.id) {
    //   trgt = "." + trgt.className + "#" + trgt.id;
    // }
    // else if (trgt.id) {
    //   trgt = "#" + trgt.id;
    // }
    // else if (trgt.className) {
    //   trgt = "." + trgt.className;
    // }

    // if (typeof (trgt) != "String") {
    //   if (trgt.tagName) {
    //     trgt = trgt.tagName;
    //   }
    //   else {
    //     trgt = trgt.toString().toLowerCase();
    //     trgt = trgt.replace("[object ", "");
    //     trgt = trgt.replace("]", "");
    //     trgt = trgt.replace("htmlbodyelement", "BODY");
    //   }
    // }
    // var xtra = "";
    // if (evt.keyCode) {
    //   xtra += " KeyCode: " + evt.keyCode;
    // }
    // if (evt.shiftKey) {
    //   xtra += " ShiftKey ";
    // }
    // if (evt.altKey) {
    //   xtra += " altKey ";
    // }
    // if (evt.metaKey) {
    //   xtra += " metaKey ";
    // }
    // if (evt.ctrlKey) {
    //   xtra += " ctrlKey ";
    // }
    // var w = window,
    //   d = document,
    //   e = d.documentElement,
    //   g = d.getElementsByTagName('body')[0],
    //   xx = w.innerWidth || e.clientWidth || g.clientWidth,
    //   yy = w.innerHeight || e.clientHeight || g.clientHeight;
    // xtra += " RES:" + xx + "X" + yy;

    // document.getElementById("op").innerHTML += "<tr><td>" + et + "</td><td>" + trgt + "</td><td>" + x + "</td><td>" + y + "</td><td>" + scrolltop + "</td><td>" + time + "</td><td>" + xtra + "</td></tr>";
    // console.log(trgt, ' ',scrolltop,' ',xtra )
  }
}