import React, { Component } from "react";
import panorama from "google-panorama-by-location";
import * as qs from "query-string";

var equirect = require("./equirect/equirect");
const zoom = 3;

export default class StreetViewPage extends Component {
  constructor() {
    super();
    this.state = {
      lat: null,
      lng: null
    };
  }

  componentWillUnmount() {
    // clears the html when the component is unmounted
    // e.g. navigated to another page
    var container = document.getElementById("container");
    container.innerHTML = "";
  }

  // the street view is too big dammit
  // https://stackoverflow.com/questions/37135417/download-canvas-as-png-in-fabric-js-giving-network-error
  dataURLtoBlob(dataurl) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  GetStreetView(lat, lng) {
    let location = [lat, lng];
    let canvas = document.createElement("canvas");

    // make that sweet click to download layer
    let clickable = document.createElement("a");
    clickable.style.position = "fixed";
    clickable.style.top = 0;
    clickable.style.height = "100vh";
    clickable.style.width = "100vw";
    clickable.style.zIndex = "100";
    clickable.style.textAlign = "center";
    clickable.style.verticalAlign = "center";
    //clickable.innerHTML = "click to download";

    let container = document.getElementById("container");

    // make it downloadable when clicked
    clickable.addEventListener(
      "click",
      event => {
        let lat_out = lat.toString().replace(".", "_");
        let lng_out = lng.toString().replace(".", "_");
        // multiplier settings: 0.5 for retina screens dammit
        // normal ones are 1
        let imgData = canvas.toDataURL({ format: "png", multiplier: 1 });
        //let strDataURI = imgData.substr(22, imgData.length); // dunno what dis for
        let blob = this.dataURLtoBlob(imgData);
        var objurl = URL.createObjectURL(blob);

        clickable.href = objurl;
        clickable.download = `streetview-at-${lat_out}-${lng_out}.png`;
      },
      false
    );

    console.log("location to find: ", location);
    //var location = locations[idx++];
    //location = [48.865937, 2.312376];
    if (!location[0]) {
      //location = [48.865937, 2.312376];
      console.log(
        "no location query found. trying local position",
        this.props.data
      );
      if (this.props.data) {
        const { lat, lng } = this.props.data;
        location = [lat, lng];
        console.log(location);
      }
    }

    panorama(
      location,
      {
        source: window.google.maps.StreetViewSource.DEFAULT,
        preference: window.google.maps.StreetViewPreference.NEAREST
      },
      function(err, result) {
        container.appendChild(canvas);
        container.appendChild(clickable);
        if (err) {
          console.log("equirect function error: ", err);
          // var obj = document.getElementById("error");
          // obj.innerText = "no street view nearby found.";
        } else {
          canvas.className = "gallery-item";
          equirect(result.id, {
            tiles: result.tiles,
            canvas: canvas,
            zoom: zoom,
            crossOrigin: "anonymous"
          })
            .on("complete", function(image, info) {
              console.log("Ready", info);
              console.log("at location", location);
            })
            .on("progress", function(ev) {
              console.log(ev.count / ev.total);
            });
        }
      }
    );
  }

  render() {
    console.log("at street view page!");
    console.log(this.props.scriptload);
    let lat;
    let lng;

    if (this.props.query) {
      console.log(
        "query received from HashRouter: ",
        this.props.query.location
      );
      const search_string = this.props.query.location.search;
      const params = qs.parse(search_string);
      console.log("got params: ", params);
      lat = parseFloat(params.lat);
      lng = parseFloat(params.lng);
      //this.setState({ lat: lat, lng: lng });
      if (!lat || !lng) {
        if (this.props.data) {
          console.log(
            "no queries parsed from GET request! trying current location from: ",
            this.props.data
          );
          const { latitude, longitude } = this.props.data;
          lat = latitude;
          lng = longitude;

          console.log("lat lng from browser: ", lat, lng);
        }
      }

      // to look for google map API load state
      //console.log(window);

      if (window.google && lat && lng) {
        console.log("window has google!");
        this.GetStreetView(lat, lng);
      } else {
        console.log("google js library not loaded!");
      }
    } else {
      return <p>no queries.</p>;
    }

    return <div />;
  }
}
