import React, { Component } from "react";

export default class Geolocate extends Component {
  constructor() {
    super();
    this.state = {
      latitude: null,
      longitude: null
    };
  }

  componentDidMount() {
    if (navigator.geolocation) {
      this.loadPosition();
    }
  }

  onUpdated() {
    let pos = {
      latitude: this.state.latitude,
      longitude: this.state.longitude
    };
    this.props.onGeolocated(pos);
  }

  loadPosition = async () => {
    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      this.setState({ latitude, longitude });
      this.onUpdated(); // send stuff back to parent
    } catch (error) {
      console.log(error);
    }
  };

  getCurrentPosition = (options = {}) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  render() {
    if (this.props.onGeolocated) {
      return <div />;
    } else {
      return (
        <div>
          <p>Latitude {this.state.latitude}</p>
          <p>Longitude {this.state.longitude}</p>
        </div>
      );
    }
  }
}
