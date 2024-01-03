const sendEvent = (eventName, data) => {
  if (!eventName) return;

  fetch(`https://${GetParentResourceName()}/${eventName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data),
  });
};

const copyText = (element) => {
  const parentDiv = $(element).parent().parent();
  const el = document.createElement("textarea");
  el.value = `PlaySoundFrontend(-1, "${parentDiv.find("p:eq(1)").text()}", "${parentDiv.find("p:eq(2)").text()}", 1)`;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
};

$(document).ready(() => {
  sendEvent("loaded");
  $(".search").on("click", () => {
    const searchText = $(".search-box input").val().toLowerCase();
    let results = 0;

    $(".sound").each(function () {
      var soundText = $(this).text().toLowerCase();
      var concatenatedText = soundText.replace(/\n/g, "").replace(/\s+/g, " ");
      if (!searchText || searchText == "" || concatenatedText.includes(searchText)) {
        results = results + 1;
        $(this).show();
      } else {
        $(this).hide();
      }
    });

    if (results === 0) {
      $(".soundlist").append(
        `<div class="sound no-result">No results for ${searchText} :(</div>`
      );
    } else {
      $(".no-result").remove();
    }
  });

  $(".stop").on("click", () => {
    sendEvent("stopSounds");
    $(".sound").each(function () {
      const element = $(this).find(".controls i:eq(0)");

      const hasHighVolumeClass = element.hasClass("fa-solid fa-volume-high");
      if (hasHighVolumeClass) {
        element.removeData("savedClass");
        element
          .removeClass("fa-solid fa-volume-high")
          .addClass("fa-solid fa-volume-low");
      }
    });
  });
});

window.addEventListener("message", (e) => {
  const action = e.data.action;

  if (action === "soundFinished") {
    const element = $(`.sound#${e.data.soundId} .controls i:eq(0)`);
    if (!element.data("savedClass")) return;
    element.removeClass().addClass(element.data("savedClass"));
    element.removeData("savedClass");
  } else if (action === "loadSounds") {
    const soundList = e.data.data;
    $(".soundlist").empty();

    soundList.forEach(function (object, index) {
      $(".soundlist").append(`
      <div class="sound" id="${index}">          
        <p>${index}</p>
        <p>${object.AudioName}</p>
        <p>${object.AudioRef}</p>
        <span class="controls">
          <i class="play fa-solid fa-volume-low"></i>
          <i class="copy fa-solid fa-file-import"></i>
        </span>
      </div>
    `);
    });

    $(".copy").on("click", function (event) {
      const element = $(this);
      if (element.data("savedClass")) return;
      const elementClass = element.attr("class");
      element.removeClass(element.data("savedClass"));
      element.addClass("fa-solid fa-check");
  
      setTimeout(() => {
        element.removeClass("fa-solid fa-check");
        element.addClass(elementClass);
        element.removeData("savedClass");
      }, 1000);
  
      copyText(element);
    });
  
    $(".play").on("click", function (event) {
      const element = $(this);
      if (!element.data("savedClass")) {
        element.data("savedClass", element.attr("class"));
        element.removeClass(element.data("savedClass"));
        element.addClass("fa-solid fa-volume-high");
      }
  
      const parentDiv = $(element).parent().parent();
      sendEvent("playSound", {
        audioId: parentDiv.find("p:eq(0)").text(),
        audioName: parentDiv.find("p:eq(1)").text(),
        audioRef: parentDiv.find("p:eq(2)").text(),
      });
    });
  } else if (action === "displayInterface") {
    const shouldOpen = e.data.open;
    if (shouldOpen) {
      $('body').animate({ opacity: 1 });

      $(document).on('keydown', function (event) {
        const key = event.key;
        if (key == "Escape" || key == "Esc") {
          $('body').animate({ opacity: 0 });
          $(document).off('keydown');
          sendEvent("closeInterface");
        }
      });
    } else {
      $('body').animate({ opacity: 0 });
      $(document).off('keydown');
    }
  }
});
