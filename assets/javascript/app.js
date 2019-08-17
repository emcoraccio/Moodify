$(document).ready(function () {

  // localStorage.getItem("Location");

  // weather variables
  let userZip = localStorage.getItem("Location");
  let weatherData,
    cityName,
    temp,
    weather,
    weatherIcon,
    forecast,
    tempCond,
    timeOfDay,
    search,
    playlists,
    icon,
    userGenre,
    userMood;
  let currentTime = moment();
  let morningStart = moment("4:00", "HH:mm");
  let dayStart = moment("10:30", "HH:mm");
  let nightStart = moment("19:00", "HH:mm");

  console.log(userZip);

  $("#searchPref").on("click", function () {

    localStorage.clear();

    if ($(".mood").is(":checked")) {

      console.log($("input[type='radio']:checked").val());
      userMood = $("input[type='radio']:checked").val();

      localStorage.setItem("Mood", userMood);

    }

    if ($('.prefGenre').is(":checked")) {

      console.log($("input[type='checkbox']:checked").val());
      userGenre = $("input[type='checkbox']:checked").val();

      localStorage.setItem("Genre", userGenre);

    }

    // makes an ajax request to search the spotify api with recommended playlists
    $.get({

      url: `https://api.spotify.com/v1/search?q=${userMood,userGenre}&type=playlist&limit=15`,
      // url: `https://api.spotify.com/v1/search?q=winter,chill&type=playlist&limit=20`,
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      success: function (response) {
        console.log(response);
        playlists = response.playlists.items;
        console.log(playlists);
        appendPlaylists(playlists)
      }

    });

  });

  let conditions = {

    warm: {

      morning: {

        precip: {

          search: "cozy"

        },

        cloudy: {

          search: "summer,acoustic"

        },

        clear: {

          search: "chill,summer"

        }

      },

      day: {

        precip: {

          search: "chill,summer"

        },

        cloudy: {

          search: "happy"

        },

        clear: {

          search: "summer"

        }

      },

      evening: {

        precip: {

          search: "summer,acoustic"

        },

        cloudy: {

          search: "summer,night"

        },

        clear: {

          search: "summer,night"

        }

      }

    },

    cold: {

      morning: {

        precip: {

          search: "chill,morning"

        },

        cloudy: {

          search: "cold,morning"

        },

        clear: {

          search: "coffee,cozy"

        }

      },

      day: {

        precip: {

          search: "winter,chill"

        },

        cloudy: {

          search: "chill"

        },

        clear: {

          search: "chill,hits"

        }

      },

      evening: {

        precip: {

          search: "evening"

        },

        cloudy: {

          search: "evening,cozy"

        },
        clear: {

          search: "chill"

        }

      }

    }

  }

  console.log(conditions)
  console.log(conditions.warm.morning.precip.search)

  $("#weather-data").hide();
  $(".helper-text").hide();
  $("#zipcode").focus();

  //TIME SECTION
  if (currentTime.isBetween(morningStart, dayStart)) {

    timeOfDay = "morning";

  } else if (currentTime.isBetween(dayStart, nightStart)) {

    timeOfDay = "day";

  } else {

    timeOfDay = "evening";

  }

  //WEATHER SECTION 
  //Retrieves weather from the api
  let getWeather = function () {

    // queryURL = `api.openweathermap.org/data/2.5/weather?zip=${userZip}&APPID=01b094dd158ecf4fb77c7c5db98a6ad6`
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?zip=${userZip}&APPID=01b094dd158ecf4fb77c7c5db98a6ad6`

    $.get(queryURL).then(function (response) {

      weatherData = response;
      console.log(weatherData);

      // display location
      cityName = weatherData.name;
      let cityP = $("<span>").text(cityName).addClass("updatedWeather");

      // declares weather icon
      weatherIcon = weatherData.weather[0].icon;
      let iconURL = `http://openweathermap.org/img/w/${weatherIcon}.png`;
      let wIcon = $("<img>").attr('src', iconURL).addClass("weatherPic");

      // display weather
      weather = weatherData.weather[0].description;
      let weatherP = $("<span>").text(weather + " in ").addClass("updatedWeather");
      $("div#weather-text").append(weatherP, cityP);

      // display weather icon + temperature
      temp = (parseInt(weatherData.main.temp) - 273.15) * 9 / 5 + 32;
      temp = Math.round(temp);

      let tempP = $("<span>").text(temp + "°").addClass("updatedWeather").css("font-size", "50px");
      $("div#temperature").prepend(tempP.prepend(wIcon));

      let weatherId = parseInt(weatherData.weather[0].id);

      console.log(weatherId);

      let weatherSet = () => {

        switch (true) {
          case (weatherId < 233):
            forecast = "precip";
            icon = "t-storms";
            break;
          case (weatherId < 550):
            forecast = "precip";
            icon = "rain";
            break;
          case (weatherId < 623):
            forecast = "precip";
            icon = "snowy";
            break;
          case (weatherId < 782):
            forecast = "cloudy";
            icon = "cloudy";
            break;
          case (weatherId < 804):
            forecast = "clear";
            icon = "sunny";
            break;
          case (weatherId === 804):
            forecast = "cloudy";
            icon = "cloudy";
            break;
          default:
            forecast = "clear";
            break;

        };

        searchForPlaylist();

      }

      if (temp > 60) {

        tempCond = "warm"

      } else {

        tempCond = "cold"

      }

      $("#weather-data").show();
      weatherSet();

    });

  }

  if (userZip) {

    getWeather();
    $("#submitZip").hide();
    $(".input-field").hide();
    $("#changeZip").focus();
    $("section#music").fadeIn("slow");

  }

  // checks to make sure zip code user inputs is valid
  let checkZip = function () {

    $(".updatedWeather").empty();

    // holds user input
    userZip = $("#zipcode").val().trim();
    localStorage.setItem("Location", userZip);
    // "^" indicates the beginning of input
    // "$" indicates the end of input
    // "d{5}" wants the users input to be only 5 digits long, EX : 90210 or in the second statement after the "|",
    // it allows 5 digits followed by a hyphen and 4 more digits, EX : 90210-1234
    let regex = /^\d{5}$|^\d{5}-\d{4}$/;
    // if user input is valid, it'll display the current weather and location of specified area
    if (regex.test(userZip)) {

      getWeather();
      $(".helper-text").hide();
      $(".input-field").hide();

    }
    else {
      $(".helper-text").show();
    }
    // clears input field after clicking search
    $("#zipcode").val('');

  }

  // checks zipcode after clicking search button
  $("#submitZip").on("click", function (event) {

    checkZip();
    $("section#music").fadeIn("slow");

  });

  // shows input field and hides weather data
  $("#changeZip").on("click", function (event) {

    $("section#music").fadeOut("slow");
    $("div.music-cards").empty();
    $(".input-field").show();
    $("#weather-data").hide();
    $("#submitZip").show();

  });

  // press enter key to submit zipcode
  $(document).on("keypress", function (event) {

    if (event.key === "Enter") {
      checkZip();
      $("section#music").fadeIn("slow");
    }

  });

  //MUSIC SECTION
  //displays playlists on the page
  let appendPlaylists = (playlists) => {
    for (i = 0; i < 4; i++) {

      let playlistName = playlists[i].name;
      let imgSrc = playlists[i].images[0].url;
      let redirect = playlists[i].external_urls.spotify;

      let $name = $("<h4>")
        .text(playlistName)
        .css("display", "none")
        .addClass(`playlistName${i}`)

      let $img = $("<img>")
        .attr("src", imgSrc)
        .addClass("hoverable")

      // .on("mouseenter", function() {
      //   $(`h4.playlistName${i}`).show();
      // });

      let $a = $("<a>")
        .attr("href", `${redirect}`)
        .attr("target", "_blank")
        .append($img);

      $(`div#${i}`).append($a, $name);

    }

  }

  // var to hold access token
  let accessToken = "BQDBz5aZD6ORvyb-zIqGJYFLaEeN6F1voAMthmjcfskmiq7iIji520ITJg2sKBC6Tp88Vqm55ZQgr-iPbxhUYKHTpjLp8mxABQ01CDydnpmFhgw9Lq7-kj48KPboNN4e_jY0qT_d1UW7DTkjqeqvMb7gYUdNWQ9wzQokJponWSKgtNOeexA-rzrNFzTWrV7-7G__TqcWAkfIrPbcitzwNuQ4-kolkXCsnsWgklDAZQ"
  let searchForPlaylist = function () {

    // makes an ajax request to search the spotify api with recommended playlists
    $.get({

      url: `https://api.spotify.com/v1/search?q=${conditions[tempCond][timeOfDay][forecast].search}&type=playlist&limit=15`,
      // url: `https://api.spotify.com/v1/search?q=winter,chill&type=playlist&limit=20`,
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      success: function (response) {
        console.log(response);
        playlists = response.playlists.items;
        console.log(playlists);
        appendPlaylists(playlists)
      }

    });

  }

  $("a.modal-trigger").on("click", function () {

    $('.modal').modal();

  })

});