/*
Coded on one day. Yiha.
*/

// Namespace-object to keep global scope clean:
var JS = (function () {
  "use strict";

  var pub = {}; // Stands for public, gets returned

  pub.init = function () {
    $("#popups").empty();

    giphyID = 0;

    pub.checkForViewportChange();

    $(window).on("resize", function() {
      pub.resizeDebounce();
    });

    // mouse movement listener
    window.addEventListener("mousemove", pub.mouseMoved, false);
    window.addEventListener("click", pub.mouseMoved, false);
    // browser-focus listener
    window.addEventListener("focus", pub.windowHasFocus, false);
    window.addEventListener("blur", pub.windowLostFocus, false);
  };

  $(document).ready(function() {
    pub.init();
  });


  /* ----------- mouse movement listener ----------- */
  // bug with touch devices?

  var mouseMove = true;
  var mouseIdleCounter = 0;
  var mouseIdleMax = 4; // the maximum amount of windows popping up after there is no mouse movement detected

  pub.mouseMoved = function() {
    mouseMove = true;
    mouseIdleCounter = 0;
    pub.cursorRemoveIdle();
  }

  pub.mouseIdle = function() {
    if (!mouseMove) {
      mouseIdleCounter++
    }
    if (mouseIdleCounter < mouseIdleMax) {
      mouseMove = false;  // used to check if the mouse is moving in the next interval
      return false;
    }
    return true;
  }


  /* ----------- browser-focus listener ----------- */
  //bug if you open it in new tab -> should make use the visibility API of modern browsers https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API

  var hasFocus = true;

  pub.windowHasFocus = function() {
    hasFocus = true;
    pub.mouseMoved();
  }

  pub.windowLostFocus = function() {
    hasFocus = false;
    pub.cursorIdle();
  }


  /* ----------- heartbeat ----------- */

  var heartBeat = 8000; //8 seconds

  setInterval(function () {
    if (pub.eventAllowed()) {
      pub.createRandomWindow(pub.randomArrayValue(giphy.tags));
    }
  }, heartBeat);

  pub.eventAllowed = function() {
    // event shouldn't be allowed if user is dragging a window
    if (viewport == "sm" || viewport == "xs") {
      return false;
    }
    if (!pub.mouseIdle() && hasFocus) {
      return true;
    }
    else {
      pub.cursorIdle();
      return false;
    }
  }


  /* ----------- window creation + giphy.api ----------- */

  var giphyID = 0;
  var giphy = {
    host: "https://api.giphy.com/v1/gifs/random?",
    key: "XXX",
    rating: "&rating=R", //not in use atm
    tags: [
      "retro+computing",
      "hacker",
      "hacker+movie",
      "computer",
      "developer",
      "robot",
      "weird",
      "weird+japan",
      "technology",
      "internet",
      "cat"
    ]
  };
  var windowNames = [
    "The UI is a lie",
    "Design is a lie",
    "Art is a lie",
    "Technology is a lie",
    "Fun is a lie",

    "Is this a UI?",
    "Is this Design?",
    "Is this Art?",
    "Is this Technology?",
    "Is this Fun?",

    "This is a UI",
    "This is Design",
    "This is Art",
    "This is Technology",
    "This is Fun",

    "This is not a UI anymore",
    "This is not Design anymore",
    "This is not Art anymore",
    "This is not Fun anymore"
  ];

  pub.randomArrayValue = function(array) {
    var i = Math.floor((Math.random() * array.length));
    var tag = array[i];
    return array[i];
  };

  pub.randomPoint = function(popupWidth, popupHeight) {
    var point = {};
    point.x = Math.floor(Math.random() * (window.innerWidth - popupWidth));
    point.y = Math.floor(Math.random() * ($(document).height() - popupHeight));
    console.log(point)
    return point;
  }

  pub.createRandomWindow = function(tag) {
    var url = giphy.host + "tag=" + tag + giphy.key;
    var xhr = $.get(url);

    xhr.done(function(data) {

      // if image is to big? -> return false
      if(data.data.image_width > 0.75 * window.innerWidth || data.data.image_height > 0.75 * window.innerHeight) {
        return false;
      }

      var point = pub.randomPoint(data.data.image_width, data.data.image_height);
      var name = pub.randomArrayValue(windowNames);

      // could make use of https://github.com/PolymerLabs/lit-html to implement html in js cleaner
      $("<div class='window' id='" + giphyID + "' style='top: " + point.x + "px; left: " + point.y + "px; width: " + data.data.image_width + "px'><div class='window-top-bar'><div class='window-title'><p class='text-overflow-ellipsis'>" + name + "</p></div><div class='window-top-bar-close'><div class='window-top-bar-close-icon'></div></div></div><div class='window-content'><img src='" + data.data.image_url + "' width='" + data.data.image_width + "' height='" + data.data.image_height + "'></div></div>").appendTo("#popups");

      // easiest way to make windows draggable by using jquery-ui
      // but http://grantm.github.io/jquery-udraggable/ would be more lightweight and touchfriendly.
      $("#" + giphyID).draggable({
        stack: ".window",
        scroll: false,
        drag: function(event, ui) {
          var offset = $(this).offset();
          var yPos = offset.top;
          ui.helper.css('margin-top', $(window).scrollTop() + 'px');
        }
      });
      $("#" + giphyID).bind('click',function(){ pub.bringFrontOnClick($(this), '.window'); });
      $("#" + giphyID).find(".window-top-bar-close-icon").bind('click',function(){ pub.closeWindow($(this)); });
      giphyID++;
    });

    xhr.fail(function() {
      return false;
    })
  }

  pub.bringFrontOnClick = function(elem, stack) {
    // Brings a file to the stack front
    var min, group = $(stack);

    if(group.length < 1) return;
    min = parseInt(group[0].style.zIndex, 10) || 0;
    $(group).each(function(i) {
      this.style.zIndex = min + i;
    });

    if(elem == undefined) return;
    $(elem).css({'zIndex' : min + group.length});
  }

  pub.closeWindow = function(elem) {
    $(elem).closest('.window').remove();
  }

  /* ----------- Cursor Helper ----------- */

  var idle = false;
  var removeIdleTimer;

  pub.cursorIdle = function() {
    if(!$("body").hasClass("idle")) {
      $("body").addClass("idle");
    }
  }

  pub.cursorRemoveIdle = function(e) {
    clearTimeout(removeIdleTimer);
    removeIdleTimer = setTimeout(function() {
      if($("body").hasClass("idle")) {
        $("body").removeClass("idle");
      }
    }, 250);
  };


  /* ----------- resize ----------- */

  var resizeTimer;
  var viewport;

  pub.resizeDebounce = function(e) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      pub.init();
    }, 250);
  };


  // synchronce breakpoints from css to js. checking for css-changes in body::before { content: 'VIEWPORT' }
  // you can now check in this misc function for viewport == "state" or if($('body').hasClass('state'))
  pub.checkForViewportChange = function () {
    var state;
    if (window.getComputedStyle) {
      state = window.getComputedStyle(document.body,':before').content;
      state = state
        .replace(/"/g, '')
        .replace(/'/g, '');
    }
    //For oldIE inspired by https://gist.github.com/branneman/6366121
    else {
      //Use .getCompStyle instead of .getComputedStyle so above check for window.getComputedStyle never fires true for old browsers
      window.getCompStyle = function(el, pseudo) {
        this.el = el;
        this.getPropertyValue = function(prop) {
          var re = /(\-([a-z]){1})/g;
          if (prop == 'float') prop = 'styleFloat';
          if (re.test(prop)) {
            prop = prop.replace(re, function () {
              return arguments[2].toUpperCase();
            });
          }
          return el.currentStyle[prop] ? el.currentStyle[prop] : null;
        };
        return this;
      };
      var compStyle = window.getCompStyle(document.getElementsByTagName('body')[0], '');
      state = compStyle.getPropertyValue('content');
    }
    this.lastState = this.lastState || "";
    if (state != this.lastState) {
      $('body').removeClass(this.lastState);
      if (state == 'xs' || state == 'sm' || state == 'md' || state == 'lg') {
        $('body').addClass(state);
        viewport = state;
      }
    this.lastState = state;
    }
  };

  return pub;
}());
