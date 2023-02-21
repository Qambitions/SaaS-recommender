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

function checkCookie() {
  let user = getCookie("recommender_cookie");
  return user
}

async function send_capture(token, path,current_page,next_page,text) {
  // console.log(path, token);
  // console.log('localhost:8000' + "/dimadb/get-capture/");
  try{
    response_api = await fetch(
      // `http://localhost:8000/dimadb/get-capture?token=${token}&path=${path}`,
      'http://localhost:8000/dimadb/get-capture/',
      {
        method: "POST",
        body: JSON.stringify({
          token: token,
          xpath : path,
          current_page: current_page,
          next_page: next_page,
          text : text
        })
      }
    )
    .then((result) => result.json())
    .then((result) => {
        console.log(result)
        if (result['message'] == "login"){
          setCookie("recommender_cookie", result['token'], 365);
        }
        if (result['message'] == "popup"){
          // closePopup()
          showPopup(result['list_recommend'])
          // setTimeout(closePopup, 20000);
          var span = document.getElementsByClassName("close_recommend_19clc")[0];
          span.onclick = function() {
            closePopup()
          }
        }
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
function closePopup() {
  var div_rec = document.getElementById("recommendations");
  div_rec.innerHTML = ""
}

function showPopup(list_recommend) {
  var div_rec = document.getElementById("recommendations");
  var popup = document.createElement("div");
  // popup.innerHTML = "This is a pop-up!";
  popup.style.backgroundColor = "#FCF8E8";
  popup.style.position = "fixed";
  popup.style.bottom = "5%";
  popup.style.right = "5%";
  popup.style.padding = "20px";
  popup.style.width = "600px";
  popup.style.height = "250px";
  popup.style.borderRadius = "5px";
  popup.style.zIndex = "999";
  popup.style.display = "block";
  popup.style.overflow = "auto";

  popup.innerHTML += "<button class=\"close_recommend_19clc\"> X </button> "; 

  n = (list_recommend.length);
  var html="";

  for(i = 0; i <= (n-1); i++)
  {
  var list = list_recommend[i];
    html = "<div class=\"recommend-container\"><a href=\"" + list.url + "\" style=\"display: flex;\">" +
          "<img src=\"" + list.image +"\"  width=\"50\" height=\"50\" class=\"recommend-image\">" + "<h3 class=\"recommend-name\">"+list.name+"</h3>"+
          "</a></div>"
    popup.innerHTML += html;
  }

  div_rec.appendChild(popup)
}  

function debounce_leading(func, timeout = 300){
  let timer;
  return (...args) => {
    if (!timer) {
      func.apply(this, args);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
    }, timeout);
  };
}

function capture_event(e, previousUrl) {
  var evt = e 
  if (evt) {
    if (evt.isPropagationStopped && evt.isPropagationStopped()) {
      return;
    }
    var time = Math.floor(Date.now() / 1000);
    var product_href = previousUrl;
    console.log(product_href)
    list = []
    if (e.type == 'scroll')
      list = ['scroll']
    else {
      var event_path   = evt.composedPath();
      for (var i = 0; i < event_path.length; i++){
        list.push(event_path[i].localName.toLowerCase())
        if (event_path[i].localName.toLowerCase() == 'html'){
          break;
        }
      }
    }
    //todo: check is right path before send (query)
    text = document.querySelector('input').value;
    send_capture(checkCookie(), list.join(" > "),product_href,window.location.href,text)

  }
}