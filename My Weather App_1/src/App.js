import React from "react";
import "./App.scss";
import { WeatherData } from "./components/WeatherData";
import { StatusData } from "./components/StatusData";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "init",
      isLoaded: false,
      weatherData: null,
      city: '',
      country: ''
    };
  }

  abortController = new AbortController();
  controllerSignal = this.abortController.signal;

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  getWeatherData = () => {
    const { city, country } = this.state;
    const weatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&units=metric&appid=${process.env.REACT_APP_WEATHER_KEY}`;

    fetch(weatherApi, { signal: this.controllerSignal })
      .then((response) => response.json())
      .then(
        (result) => {
          console.log(result);
          const { name } = result;
          const { country } = result.sys;
          const {
            temp,
            temp_min,
            temp_max,
            feels_like,
            humidity
          } = result.main;
          const { description, icon } = result.weather[0];
          const { speed, deg } = result.wind;

          this.setState({
            status: "success",
            isLoaded: true,
            weatherData: {
              name,
              country,
              description,
              icon,
              temp: temp.toFixed(1),
              feels_like: feels_like.toFixed(1),
              temp_min: temp_min.toFixed(1),
              temp_max: temp_max.toFixed(1),
              speed,
              deg,
              humidity
            }
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
          alert("Failed to fetch weather data");
        }
      );
  };

  onSubmit = (event) => {
    event.preventDefault();
    this.setState({ status: "fetching" }, this.getWeatherData);
  };

  returnActiveView = (status) => {
    switch (status) {
      case "init":
        return (
          <form onSubmit={this.onSubmit}>
            <input
              type="text"
              name="city"
              value={this.state.city}
              onChange={this.handleInputChange}
              placeholder="City"
            />
            <input
              type="text"
              name="country"
              value={this.state.country}
              onChange={this.handleInputChange}
              placeholder="Country"
            />
            <button className="btn-main" type="submit">
              Get Weather
            </button>
          </form>
        );
      case "success":
        return <WeatherData data={this.state.weatherData} />;
      default:
        return <StatusData status={status} />;
    }
  };

  componentWillUnmount() {
    this.abortController.abort();
  }

  render() {
    return (
      <div className="App">
        <div className="container">
          {this.returnActiveView(this.state.status)}
        </div>
      </div>
    );
  }
}

export default App;
