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

  GetStreetView(lat, lng) {
    let location = [lat, lng];
    let canvas = document.createElement("canvas");
    let container = document.getElementById("container");

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
        if (err) {
          console.log("equirect function error: ", err);
          // var obj = document.getElementById("error");
          // obj.innerText = "no street view nearby found.";
        } else {
          canvas.className = "gallery-item";
          equirect(result.id, {
            tiles: result.tiles,
            canvas: canvas,
            zoom: zoom
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
