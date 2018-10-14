import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Switch, Route } from "react-router-dom";

import Geolocate from "./component/Geolocate";
import StreetViewPage from "./component/StreetViewPage/StreetViewPage";

function new_script(src) {
  return new Promise(function(resolve, reject) {
    var script = document.createElement("script");
    script.src = src;
    script.addEventListener("load", function() {
      resolve();
    });
    script.addEventListener("error", function(e) {
      reject(e);
    });
    document.body.appendChild(script);
  });
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      geolocation: null,
      scriptload: "start"
    };
    this.onGeolocated = this.onGeolocated.bind(this);
  }

  do_load = script_url => {
    var self = this;
    new_script(script_url)
      .then(function() {
        self.setState({ scriptload: "done" });
      })
      .catch(function() {
        self.setState({ scriptload: "error" });
      });
  };

  onGeolocated(value) {
    console.log("ongeolocated called! this is App.js", value);
    this.setState({ geolocation: value });
  }

  render() {
    const google_maps =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyCXTG9o-gaJ5MfpqKjjGh3kBTCcfHCrP6A";

    var self = this;
    if (self.state.scriptload === "start") {
      self.state.scriptload = "loading";
      setTimeout(function() {
        self.do_load(google_maps);
      }, 0);
    }

    // defining a query allow the page to accept 'GET' requests
    const StreetViewPageCompoent = query => {
      return (
        <StreetViewPage
          data={this.state.geolocation}
          query={query}
          scriptload={this.props.scriptload}
        />
      );
    };

    return (
      <div className="App">
        {/* <p>street view here at</p> */}
        <Geolocate onGeolocated={this.onGeolocated} />
        <Switch>
          <Route exact path="/" component={StreetViewPageCompoent} />
        </Switch>
      </div>
    );
  }
}

export default App;
