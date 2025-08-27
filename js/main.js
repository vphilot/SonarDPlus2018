/*
Vinicius Philot
133-762-161
for Christopher Lewis
INM320SCC
Jan 5, 2018
Mobile Event Site
*/

let dbInstance = [];

let goingTxt = "going";
let attendTxt = "attend";

window.addEventListener("load", initComp);

function initComp(evt) {
  var config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  };
  firebase.initializeApp(config);

  if (checkMobile()) {
    let elm = document.getElementById("disclaimer");
    elm.parentElement.removeChild(elm);
    loadDb();
  }
}

function checkMobile() {
  if (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    return true;
  } else {
    return false;
  }
}

function loadDb() {
  let db = firebase.database();

  db.ref("talks").once("value", function (snap) {
    dbInstance = snap.val();
    initCanvas();
  });
}

function initCanvas() {
  initStaticElements();
  initDynamicElements();
}

function initStaticElements() {
  initHome();
  initSchedule();
  initSpeakers();
  initNav();
}

function initHome() {
  let home = document.createElement("section");
  home.id = "home";
  home.innerHTML =
    '<div class="logo-wrapper"><div id="logo-primary"></div><div id="logo-secondary"></div></div><div id="header"><h1>The congress where technology and creative industries converge &#8212</h1><h2>Feb 08 - 10, 2018</h2><h2>Fira Montjuïc, Barcelona</h2></div></div><div id="particles-js"></div>';
  document.body.appendChild(home);
  //init particles
  particlesJS.load("particles-js", "./assets/particles.json");
}

function initSchedule() {
  let schedule = document.createElement("section");
  schedule.id = "schedule";
  let buttons = document.createElement("div");
  let talks = document.createElement("div");

  //creating buttons for each day
  let days = unique(dbInstance, "start");
  for (let d = 0; d < days.length; d++) {
    let daysTemp = days[d] + "T17:10:00.000Z"; //returning array back to json format
    console.log(daysTemp);
    //obs: I'm storing my dates by the iso 8601 standard https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toJSON so I'm doing some conversions when displaying them
    let weekday = String(new Date(daysTemp)).substr(0, 3);
    let date = String(new Date(daysTemp)).substr(4, 6);
    buttons.innerHTML +=
      '<button id="day' +
      (parseInt(d) + 1) +
      '"type="button" value="' +
      days[d] +
      '"class="btn-day">' +
      "<strong>" +
      weekday +
      "</strong>" +
      " " +
      date +
      "</button>";
  }

  buttons.innerHTML +=
    '<button id="btn-filter" type="button" value="true" class="btn-filter"><i class="far fa-dot-circle fa-xs" data-fa-transform="shrink-4"></i>Filter</button>';

  //creating elements for each database entry
  // the default day will be the first one
  let filtered = aFilter(dbInstance, "start", days[0]);
  talks.innerHTML = displayInfo(filtered, "talk");

  schedule.appendChild(buttons).classList.add("btn-wrapper");
  schedule.appendChild(talks).classList.add("talks-wrapper");

  //creating the Talk Detail div
  let td = document.createElement("div");
  td.className = "talk-detail";
  schedule.appendChild(td);

  document.body.appendChild(schedule);

  //initing the filter-by-day buttons
  let btnDays = document.getElementsByClassName("btn-day");
  let talksWrapper = document.getElementsByClassName("talks-wrapper")[0];
  for (let i = 0; i < btnDays.length; i++) {
    btnDays[i].addEventListener("click", function (e) {
      talksWrapper.innerHTML = "";
      let fa = aFilter(dbInstance, "start", btnDays[i].value);
      talksWrapper.innerHTML = displayInfo(fa, "talk");
      initDynamicElements();
      //now it works!
    });
  }
  //filter-by-attending
  let btnFilter = document.getElementsByClassName("btn-filter")[0];
  btnFilter.addEventListener("click", (e) => {
    talksWrapper.innerHTML = "";
    let fa = aFilter(dbInstance, "attending", true); //filtering by true; that is, going to event
    //IF there is nothing the user is attending, display a default message
    fa.length === 0
      ? (talksWrapper.innerHTML =
          '<p class="error">Add talks to your schedule and they\'ll be displayed here.</p>')
      : ((talksWrapper.innerHTML = displayInfo(fa, "talk")),
        (talksWrapper.innerHTML +=
          '<button class="btn-print">Print my Schedule</button>'),
        initDynamicElements());
  });
  //toggle active
  let btnTalksNav = document
    .getElementsByClassName("btn-wrapper")[0]
    .getElementsByTagName("button");
  btnTalksNav[0].classList.add("active");
  for (let i = 0; i < btnTalksNav.length; i++) {
    btnTalksNav[i].addEventListener("click", (e) => {
      for (let e = 0; e < btnTalksNav.length; e++) {
        btnTalksNav[e].classList.remove("active");
      }
      e.target.classList.add("active");
    });
  }
}

function initSpeakers() {
  let speakers = document.createElement("section");
  speakers.id = "speakers";
  speakers.innerHTML = displayInfo(dbInstance, "speaker");
  //creating the Talk Detail div
  let td = document.createElement("div");
  td.className = "speaker-detail";
  speakers.appendChild(td);
  document.body.appendChild(speakers);
}

function initNav() {
  let nav = document.createElement("nav");
  nav.id = "main-nav";
  let secs = document.getElementsByTagName("section");
  for (let s = 0; s <= secs.length; s++) {
    s === secs.length
      ? (document.body.appendChild(nav), initNavEvents())
      : (nav.innerHTML +=
          "<a href =#" +
          secs[s].id +
          ' class="nav-link">' +
          secs[s].id +
          "</a>");
  }
}

function initNavEvents(e) {
  let navAnchors = document.getElementsByClassName("nav-link");
  let sections = document.getElementsByTagName("section");
  navAnchors[0].classList.add("active");
  sections[0].classList.add("active");
  for (let i = 0; i < navAnchors.length; i++) {
    navAnchors[i].addEventListener("click", function (e) {
      for (let e = 0; e < navAnchors.length; e++) {
        navAnchors[e].classList.remove("active");
        sections[e].classList.remove("active");
      }
      e.target.classList.add("active");
      document.getElementById(e.target.innerHTML).classList.add("active"); //targetting the respective section
    });
  }
}

function displayInfo(_filteredArray, _type) {
  //type can be talk, speaker, whatever, just to define the class
  let output = "";
  let fa = _filteredArray;
  for (let f = 0; f < fa.length; f++) {
    let s = String(new Date(fa[f].start));
    let e = String(new Date(fa[f].end));

    switch (
      _type //using switch statements to dictate the outcome of my html elements based on the type wanted
    ) {
      case "talk":
        output += '<div class="talk" data-hash="' + fa[f].hash + '">';
        //IMPORTANT: I am adding a unique hash to my elements via the data attribute  so I can keep track of them!
        output +=
          '<img src="' +
          "../images/" +
          fa[f].talkImg +
          '" alt="' +
          fa[f].title +
          '">';
        output +=
          "<h1>" +
          fa[f].title +
          "</h1><h2>" +
          fa[f].speaker +
          '</h2><h5 class="day">' +
          String(new Date(fa[f].start)).substr(0, 3) +
          '</h5><h5 class="time">' +
          s.substr(16, 5) +
          " &#8212 " +
          e.substr(16, 5) +
          '</h5><p class="description">' +
          fa[f].description +
          "</p>";
        break;
      case "speaker":
        output += '<div class="speaker" data-hash="' + fa[f].hash + '">';
        output +=
          '<img src="' +
          "../images/" +
          fa[f].bioImg +
          '" alt="' +
          fa[f].speaker +
          '">';
        output +=
          "<h1>" + fa[f].speaker + '</h1><p class="bio">' + fa[f].bio + "</p>";
        output += "<h2>Upcoming talks:</h2>";
        output +=
          "<h2>" +
          fa[f].title.toUpperCase() +
          '</h2><h5 class="day">' +
          String(new Date(fa[f].start)).substr(0, 3) +
          '</h5><h5 class="time">' +
          s.substr(16, 5) +
          " &#8212 " +
          e.substr(16, 5) +
          "</h5>";
        break;
      default:
        console.log("nothing");
    }
    fa[f].attending
      ? (output +=
          '<button type="button" value="attending-true" class="btn-attending true">' +
          goingTxt +
          "</button>")
      : (output +=
          '<button type="button" value="attending" class="btn-attending">' +
          attendTxt +
          "</button>");
    output += "</div>";
  }

  return output;
}

function initDynamicElements() {
  initTalkDetails();
  initSpeakerDetails();
  initAttendingButtons();
  if (document.querySelectorAll(".btn-print")[0]) {
    //IF there's a button, init it
    initPrintButton();
  } else {
    return;
  }
}

function initTalkDetails() {
  let talks = document.getElementsByClassName("talk");
  for (let t = 0; t < talks.length; t++) {
    talks[t]
      .getElementsByTagName("h1")[0]
      .addEventListener("click", (e) =>
        popDetail(e.target.parentElement, "talk")
      );
  }
}

function initSpeakerDetails() {
  let speakers = document.getElementsByClassName("speaker");
  for (let t = 0; t < speakers.length; t++) {
    speakers[t]
      .getElementsByTagName("h1")[0]
      .addEventListener("click", (e) =>
        popDetail(e.target.parentElement, "speaker")
      );
  }
}

function initAttendingButtons() {
  let attBtn = document.getElementsByClassName("btn-attending");
  for (let b = 0; b < attBtn.length; b++) {
    attBtn[b].addEventListener("click", (e) => {
      updateFirebase(e.target);
    });
  }
}

function initPrintButton() {
  let btnPrint = document.querySelectorAll(".btn-print")[0];
  btnPrint.addEventListener("click", function (e) {
    let newWindow = window.open();
    newWindow.document.open();
    newWindow.document.write(
      '<head> <meta charset="utf-8"> <title>Your Sónar +D 2018 Schedule</title> <style> * {font-family:monospace; color: black;} button{display:none;} img{display:none;} </style> </head><body><h1>Your Sonar 2018 D+ Schedule</h1>'
    );
    let fa = aFilter(dbInstance, "attending", true);
    newWindow.document.write(displayInfo(fa, "talk"));
    newWindow.document.write("</body></html>");
    newWindow.print();
  });
}

function updateFirebase(_element) {
  let hash = _element.parentElement.getAttribute("data-hash");
  //a variable holding the hash data will give me a reference to where this element sits in firebase
  //now, set the respective entry in firebase to be false or true given the following conditions:
  let node = firebase
    .database()
    .ref("talks")
    .child(parseInt(hash))
    .child("attending");
  let nodeInst = dbInstance[hash]; //also need to update locally, sorry
  node.once("value", function (snap) {
    let nodeState = snap.val();
    //mconsole.log("success");
    //using some ternary operators! if the snap value is true, set it to false; otherwise set it to true
    nodeState === true
      ? (node.set(false),
        (nodeInst.attending = false),
        (_element.innerHTML = "Attend"),
        (_element.className = "btn-attending"))
      : (node.set(true),
        (nodeInst.attending = true),
        (_element.innerHTML = "Going"),
        (_element.className = "btn-attending true"));
  });
}

function popDetail(_element, _type) {
  document.querySelectorAll("section.active")[0].style.display = "none";
  //make the current section go away helps me setting the scroll properly
  window.scrollTo(0, 0);
  let pop;
  if (_type === "talk") {
    pop = document.getElementsByClassName("talk-detail")[0];
  } else {
    pop = document.getElementsByClassName("speaker-detail")[0];
  }
  pop.setAttribute("data-hash", _element.getAttribute("data-hash"));
  //I'm linking the hash of my detail div to the original one So the button states are coherent when I click them!
  pop.innerHTML = _element.innerHTML;
  pop.classList.add("active");
  pop.innerHTML +=
    '<button type="button" value="back" class="btn-talk-back"><i class="far fa-times-circle"></i></button>';
  document.body.appendChild(pop);
  pop
    .getElementsByClassName("btn-talk-back")[0]
    .addEventListener("click", () => {
      pop.classList.remove("active");
      document.querySelectorAll("section.active")[0].style.display = "block";
      refreshAttending();
    });
  initAttendingButtons();
}

function refreshAttending() {
  let btns = document.querySelectorAll(".btn-attending");
  for (let i = 0; i < btns.length; i++) {
    let hash = btns[i].parentElement.getAttribute("data-hash");
    //console.log(hash + dbInstance[hash].attending);
    if (dbInstance[hash].attending === true) {
      btns[i].className = "btn-attending true";
      btns[i].innerHTML = goingTxt;
    } else if (dbInstance[hash].attending === false) {
      btns[i].className = "btn-attending";
      btns[i].innerHTML = attendTxt;
    } else {
      //in case undefined or whatever
      return;
    }
  }
}

//-----------utility ----------//

function unique(_array, _key) {
  //useful for when I need the only unique values on the data sets
  let tempArray = [];
  if (_key == "start" || _key == "end") {
    //IF i'm looking for dates, there's a special treatment
    for (let i = 0; i < _array.length; i++) {
      tempArray.push(_array[i][_key].substr(0, 10));
    }
    let uniqueSet = new Set(tempArray);
    let uniqueArray = Array.from(uniqueSet);
    return uniqueArray;
  } else {
    //IF I'M NOT looking for dates, there's no use in the unique function here
    // but the ELSE statement avoids errors in case the datatype is not what it expects
    tempArray = _array;
    return tempArray;
  }
}

function aFilter(_array, _key, _term) {
  //I'm using my great filter from the previous assignment with some tweaks
  if (_term == "all") {
    //IF the term used in the function is ALL, return back the original array that was passed
    return _array;
  } else {
    //ELSE - in any other cases, use the passed value to filter the original array; and return the new filtered array
    let result = _array.filter(filterByTerm);

    function filterByTerm(value) {
      if (typeof value[_key] === "string") {
        //IF it is a string, then compare it and return
        //starts with method gives me a lot of flexibiliy because I can specify parts of the string
        return value[_key].startsWith(_term);
      } else {
        //ELSE, compare strict and return
        return value[_key] === _term;
      }
    }
    return result;
  }
}
