import React, { useState, useEffect, useMemo } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
);

/* Global Styles & Font Import */
const GlobalStyle = createGlobalStyle`
  /* Import the Roboto font from Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

  body {
    margin: 0;
    font-family: 'Roboto', sans-serif;
    background: #eef2f7;
    color: #333;
  }
`;

/* Container */
const AppContainer = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 600px) {
    padding: 15px;
  }
`;

/* Header with a sleek gradient background */
const Header = styled.header`
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #2a9d8f, #264653);
  color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;

  h1 {
    font-size: 2.8rem;
    margin: 0;
  }

  p {
    font-size: 1.3rem;
    margin: 10px 0 20px;
  }

  @media (max-width: 600px) {
    padding: 30px 10px;

    h1 {
      font-size: 2rem;
    }

    p {
      font-size: 1.1rem;
    }
  }
`;

/* Location Form (User Input) */
const LocationForm = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  input {
    padding: 10px;
    width: 250px;
    border: none;
    border-radius: 4px 0 0 4px;
    font-size: 1rem;
    outline: none;
  }

  button {
    padding: 10px 16px;
    border: none;
    border-radius: 0 4px 4px 0;
    background: #2a9d8f;
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #21867a;
    }
  }

  @media (max-width: 600px) {
    flex-direction: column;

    input {
      width: 80%;
      border-radius: 4px;
      margin-bottom: 10px;
    }

    button {
      width: 80%;
      border-radius: 4px;
    }
  }
`;

/* Info & Error messages */
const Info = styled.div`
  text-align: center;
  margin: 20px 0;
  font-size: 1.2rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  margin: 20px 0;
  font-size: 1.2rem;
  color: #e63946;
`;

/* Prediction Card to highlight the groundhog's prediction */
const PredictionCard = styled.section`
  background: #fff;
  border-left: 6px solid #2a9d8f;
  border-radius: 8px;
  padding: 20px;
  margin: 30px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0;
    font-size: 2rem;
    color: #264653;
  }

  p {
    margin: 10px 0;
    font-size: 1.1rem;
  }

  @media (max-width: 600px) {
    h2 {
      font-size: 1.6rem;
    }
    p {
      font-size: 1rem;
    }
  }
`;

/* Outcome message with color coding */
const Outcome = styled.p`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${(props) => (props.correct ? "#2a9d8f" : "#e63946")};
  margin-top: 15px;

  @media (max-width: 600px) {
    font-size: 1.1rem;
  }
`;

/* Responsive Grid for the 10-Day Forecast */
const ForecastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

/* Forecast Card styling with hover effects */
const ForecastCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }

  h3 {
    margin: 0 0 10px;
    font-size: 1.1rem;
    color: #264653;
  }

  p {
    margin: 5px 0;
  }

  @media (max-width: 600px) {
    padding: 10px;

    h3 {
      font-size: 1rem;
    }

    p {
      font-size: 0.9rem;
    }
  }
`;

/* Weather Icon */
const WeatherIcon = styled.img`
  width: 64px;
  height: 64px;
`;

/* Chart Wrapper with responsive height */
const ChartWrapper = styled.div`
  margin: 40px 0;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 400px; /* Default height */

  @media (max-width: 600px) {
    padding: 15px;
    height: 300px; /* Reduced height for mobile */
  }
`;

/* Footer */
const Footer = styled.footer`
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ccc;
  font-size: 0.9rem;
  color: #555;

  a {
    color: #2a9d8f;
    text-decoration: none;
  }

  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
`;

/* Helper: format a Date as YYYY-MM-DD */
const formatDate = (date) => date.toISOString().split("T")[0];

/* Constants */
const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const FORECAST_DAYS = 14;
const LOOKBACK_DAYS = 45;

function App() {
  // State for location, forecast data, loading, and errors
  const [location, setLocation] = useState("Punxsutawney");
  const [query, setQuery] = useState("Punxsutawney");
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { dataMode, springStart, approachingSpring } = useMemo(() => {
    const now = new Date();
    const springStart = new Date(now.getFullYear(), 2, 20); // March 20 (month is zero-indexed)
    const twoWeeksBeforeSpring = new Date(
      springStart.getTime() + FORECAST_DAYS * 86400000,
    );
    const dataMode = now >= springStart ? "historical" : "forecast";
    const approachingSpring = now >= twoWeeksBeforeSpring && now < springStart;
    return { dataMode, springStart, approachingSpring };
  }, []); // empty dependency array means these values are computed once on mount

  useEffect(() => {
    setLoading(true);
    setError(null);
    let URL = "";

    if (dataMode === "forecast") {
      // Use forecast endpoint
      URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=${FORECAST_DAYS}&aqi=no&alerts=no`;
    } else {
      // Use historical endpoint starting on March 20
      const endDateStr = formatDate(springStart);
      const startDate = new Date(
        springStart.getTime() - LOOKBACK_DAYS * 86400000,
      );
      const startDateStr = formatDate(startDate);
      URL = `https://api.weatherapi.com/v1/history.json?key=${API_KEY}&q=${location}&dt=${startDateStr}&end_dt=${endDateStr}&aqi=no&alerts=no`;
    }

    fetch(URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        // The structure is similar for both endpoints:
        // data.forecast.forecastday should be available.
        setForecast(data.forecast.forecastday);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      });
  }, [location, dataMode, springStart]);

  // Handle user-submitted location
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() === "") return;
    setLocation(query);
  };

  // Simple heuristic: count days with high temperatures ≥ 50°F
  const warmDaysCount = forecast.filter(
    (day) => day.day.maxtemp_f >= 50,
  ).length;
  const DAYS = dataMode === "historical" ? LOOKBACK_DAYS : FORECAST_DAYS;
  const forecastPrediction =
    warmDaysCount >= Math.ceil(DAYS / 2)
      ? "Early Spring"
      : "6 More Weeks of Winter";

  // Groundhog’s prediction for this year is fixed
  const groundhogPrediction = "6 More Weeks of Winter";
  const isGroundhogCorrect = forecastPrediction === groundhogPrediction;

  console.log({
    forecastPrediction,
    groundhogPrediction,
    isGroundhogCorrect,
    warmDaysCount,
  });

  // Prepare data for the temperature chart
  const chartData = {
    labels: forecast.map((day) => new Date(day.date).toLocaleDateString()),
    datasets: [
      {
        label: "High Temperature (°F)",
        data: forecast.map((day) => Math.round(day.day.maxtemp_f)),
        fill: false,
        borderColor: "#e76f51",
        tension: 0.1,
      },
      {
        label: "Low Temperature (°F)",
        data: forecast.map((day) => Math.round(day.day.mintemp_f)),
        fill: false,
        borderColor: "#264653",
        tension: 0.1,
      },
      {
        label: "50°F Threshold",
        data: forecast.map(() => 50),
        fill: false,
        borderColor: "#aaa",
        borderDash: [5, 5],
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  // Determine chart title based on data mode
  let chartTitle = "Forecast Temperature Data";
  if (dataMode === "historical") {
    // Use historical endpoint starting on March 20
    const endDateStr = formatDate(springStart);
    const startDate = new Date(
      springStart.getTime() - LOOKBACK_DAYS * 86400000,
    );
    const startDateStr = formatDate(startDate);
    chartTitle = `Historical Temperature Data (${startDateStr} - ${endDateStr})`;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: chartTitle,
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Temperature (°F)",
        },
        ticks: {
          stepSize: 5,
        },
      },
    },
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <h1>Is the Groundhog Correct?</h1>
          <p>Check if the groundhog's prediction is right for your area!</p>
          <LocationForm onSubmit={handleSubmit}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter city or ZIP"
            />
            <button type="submit">See Forecast</button>
          </LocationForm>
        </Header>

        {loading && (
          <Info>
            Loading weather data for <strong>{location}</strong>...
          </Info>
        )}
        {error && (
          <ErrorMessage>
            Error loading weather data: {error.message}
          </ErrorMessage>
        )}

        {!loading && !error && forecast.length > 0 && (
          <>
            <PredictionCard>
              <h2>Groundhog's Prediction: {groundhogPrediction}</h2>
              {dataMode === "historical" ? (
                <p>
                  Our historical data for <strong>{location}</strong> shows:{" "}
                  {forecastPrediction}
                </p>
              ) : (
                <p>
                  Our forecast for <strong>{location}</strong> predicts:{" "}
                  {forecastPrediction}
                </p>
              )}
              {approachingSpring && dataMode === "forecast" && (
                <p style={{ fontStyle: "italic", color: "#2a9d8f" }}>
                  Spring is approaching!
                </p>
              )}
              <Outcome correct={isGroundhogCorrect}>
                {isGroundhogCorrect
                  ? `Groundhog ${
                      dataMode === "historical" ? "was" : "is"
                    } correct!`
                  : `Groundhog ${
                      dataMode === "historical" ? "was" : "is"
                    } incorrect!`}
              </Outcome>
              <p>
                Based on{" "}
                {dataMode === "historical"
                  ? "historical weather data"
                  : "the 14-day forecast"}
                , there {dataMode === "historical" ? "were" : "are"}{" "}
                <b>{warmDaysCount}</b> days with a high temperature of at least
                50°F.
              </p>
            </PredictionCard>

            {/* Temperature Chart */}
            <ChartWrapper>
              <Line data={chartData} options={chartOptions} />
            </ChartWrapper>

            <h2>14-Day Forecast</h2>
            <ForecastGrid>
              {forecast.map((day) => (
                <ForecastCard key={day.date}>
                  <h3>{new Date(day.date).toLocaleDateString()}</h3>
                  <WeatherIcon
                    src={day.day.condition.icon}
                    alt={day.day.condition.text}
                  />
                  <p>{day.day.condition.text}</p>
                  <p>
                    <strong>High:</strong> {Math.round(day.day.maxtemp_f)}°F
                  </p>
                  <p>
                    <strong>Low:</strong> {Math.round(day.day.mintemp_f)}°F
                  </p>
                </ForecastCard>
              ))}
            </ForecastGrid>
          </>
        )}

        <Footer>
          <p>
            Data provided by{" "}
            <a
              href="https://www.weatherapi.com/"
              target="_blank"
              rel="noreferrer"
            >
              WeatherAPI.com
            </a>
          </p>
          <p>
            Made out of spite for the Groundhog by{" "}
            <a href="https://daviskeene.com" target="_blank" rel="noreferrer">
              Davis Keene
            </a>
          </p>
        </Footer>
      </AppContainer>
    </>
  );
}

export default App;
