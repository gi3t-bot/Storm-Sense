// ================= WEATHER CONFIG =================
const apiKey = "12f6fd13ed1526d19b7f18c491fe721f";
const app = document.getElementById("app");
const cityInput = document.getElementById("cityInput");

// ================= ALL INDIA STATE COORDS (28 States + 8 UTs) =================
const STATE_ALL_COORDS = {
    // States
    "Andhra Pradesh":         [15.9129,  79.7400],
    "Arunachal Pradesh":      [28.2180,  94.7278],
    "Assam":                  [26.2006,  92.9376],
    "Bihar":                  [25.0961,  85.3131],
    "Chhattisgarh":           [21.2787,  81.8661],
    "Goa":                    [15.2993,  74.1240],
    "Gujarat":                [22.2587,  71.1924],
    "Haryana":                [29.0588,  76.0856],
    "Himachal Pradesh":       [31.1048,  77.1734],
    "Jharkhand":              [23.6102,  85.2799],
    "Karnataka":              [15.3173,  75.7139],
    "Kerala":                 [10.8505,  76.2711],
    "Madhya Pradesh":         [22.9734,  78.6569],
    "Maharashtra":            [19.7515,  75.7139],
    "Manipur":                [24.6637,  93.9063],
    "Meghalaya":              [25.4670,  91.3662],
    "Mizoram":                [23.1645,  92.9376],
    "Nagaland":               [26.1584,  94.5624],
    "Odisha":                 [20.9517,  85.0985],
    "Punjab":                 [31.1471,  75.3412],
    "Rajasthan":              [27.0238,  74.2179],
    "Sikkim":                 [27.5330,  88.5122],
    "Tamil Nadu":             [11.1271,  78.6569],
    "Telangana":              [18.1124,  79.0193],
    "Tripura":                [23.9408,  91.9882],
    "Uttar Pradesh":          [26.8467,  80.9462],
    "Uttarakhand":            [30.0668,  79.0193],
    "West Bengal":            [22.9868,  87.8550],
    // Union Territories
    "Andaman & Nicobar Islands": [11.7401, 92.6586],
    "Chandigarh":             [30.7333,  76.7794],
    "Dadra & Nagar Haveli":   [20.1809,  73.0169],
    "Delhi":                  [28.7041,  77.1025],
    "Jammu & Kashmir":        [33.7782,  76.5762],
    "Ladakh":                 [34.1526,  77.5771],
    "Lakshadweep":            [10.5667,  72.6417],
    "Puducherry":             [11.9416,  79.8083],
};

// ================= MAP =================
const RISK_THRESHOLD = 30;    // states below this score are hidden from the map
const stateMarkers   = {};    // live markers keyed by state name

function getRiskColor(risk) {
    if (risk >= 70) return "#ff4757";
    if (risk >= 40) return "#ffa502";
    return "#2ed573";
}

function clearMapMarkers() {
    Object.values(stateMarkers).forEach(m => {
        if (window.map) window.map.removeLayer(m);
    });
    Object.keys(stateMarkers).forEach(k => delete stateMarkers[k]);
}

function updateMapWithRiskData(stateRisks) {
    if (!window.map || !stateRisks) return;

    clearMapMarkers();

    Object.entries(stateRisks).forEach(([state, info]) => {
        if (info.risk < RISK_THRESHOLD) return;        // skip truly-safe states

        const coords = STATE_ALL_COORDS[state];
        if (!coords) return;

        const color  = getRiskColor(info.risk);
        const radius = info.risk >= 70 ? 12 : info.risk >= 40 ? 9 : 7;

        const marker = L.circleMarker(coords, {
            radius,
            color,
            fillColor: color,
            fillOpacity: 0.85,
            weight: 2
        })
        .addTo(window.map)
        .bindPopup(
            `<strong>${state}</strong><br>
             Risk: ${info.risk}%<br>
             Primary hazard: ${info.primary}<br>
             Temp: ${info.temp}°C &nbsp;|&nbsp; Wind: ${info.wind} m/s`
        );

        stateMarkers[state] = marker;
    });
}

// ================= DASHBOARD API =================
function loadDisasterRisk() {
    fetch("/api/disaster-risk/")
        .then(res => res.json())
        .then(data => {
            updateDashboard(data);
            updateMapWithRiskData(data.state_risks || {});
            
            if (data.dashboard_stats) {
                const alertsEl = document.getElementById("alerts-count");
                const regionsEl = document.getElementById("regions-monitored");
                const accuracyEl = document.getElementById("accuracy-rate");
                const dataPointsEl = document.getElementById("data-points");
                
                if (alertsEl) alertsEl.textContent = data.dashboard_stats.active_alerts;
                if (regionsEl) regionsEl.textContent = data.dashboard_stats.regions_monitored;
                if (accuracyEl) accuracyEl.textContent = data.dashboard_stats.accuracy_rate;
                if (dataPointsEl) dataPointsEl.textContent = data.dashboard_stats.data_points;
            }
        })
        .catch(err => console.error("Risk API error:", err));
}

// ================= WEATHER DOM =================
const locationEl = document.getElementById("location");
const iconEl = document.getElementById("icon");
const conditionEl = document.getElementById("condition");
const tempEl = document.getElementById("temperature");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const alertBox = document.getElementById("alertBox");

// ================= WEATHER (OPENWEATHERMAP) =================
async function fetchWeather(query, lat = null, lon = null) {
    if (!locationEl) return;

    let url = "";
    if (lat !== null && lon !== null) {
        // Use coordinates
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
        // Use city name
        url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric`;
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Location not found");

        const data = await res.json();
        updateWeatherUI(data);
    } catch (err) {
        console.error("Weather fetch error:", err);
        locationEl.textContent = "Location not found";
    }
}

function updateWeatherUI(data) {
    if (!data || !data.main) return;

    const cityName = data.name;
    const country = data.sys ? data.sys.country : "";
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const condition = data.weather[0].description;
    const iconCode = data.weather[0].icon;

    locationEl.textContent = cityName + (country ? `, ${country}` : "");
    conditionEl.textContent = condition.charAt(0).toUpperCase() + condition.slice(1);
    tempEl.textContent = `${temp}°C`;
    humidityEl.textContent = `Humidity: ${humidity}%`;
    windEl.textContent = `Wind: ${windSpeed} m/s`;
    
    // OpenWeatherMap icons
    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    iconEl.style.display = "block";
}

// ================= SEARCH =================
function searchCity() {
    const city = cityInput?.value.trim();
    if (!city) return;

    fetchWeather(city);
    fetchEarthquakePrediction(city);
}

// ================= EARTHQUAKE =================
function fetchEarthquakePrediction(city) {
    fetch(`/predict-earthquake/?location=${encodeURIComponent(city)}`)
        .then(res => res.json())
        .then(data => {
            const box = document.getElementById("predictionBox");
            if (!box) return;

            box.style.display = "block";
            document.getElementById("eqLocation").textContent =
                data.location || data.error;

            document.getElementById("eqMagnitude").textContent =
                data.estimated_magnitude
                    ? `Est. Magnitude: ${data.estimated_magnitude}`
                    : "";
        });
}

// ================= DASHBOARD UI =================
function updateDashboard(data) {
    Object.keys(data).forEach(key => {
        const areaEl = document.getElementById(`${key}-areas`);
        const card = areaEl?.closest(".disaster-card");
        const bar = card?.querySelector(".progress-fill");
        const badge = card?.querySelector(".risk-level");

        if (!areaEl || !bar || !badge) return;

        areaEl.textContent = data[key].areas.join(", ");
        bar.style.width = `${data[key].risk}%`;

        if (data[key].risk >= 70) {
            badge.textContent = "HIGH RISK";
            badge.className = "risk-level risk-high";
            bar.style.background = "linear-gradient(45deg, #ff4757, #ff6b81)";
        } else if (data[key].risk >= 40) {
            badge.textContent = "MEDIUM RISK";
            badge.className = "risk-level risk-medium";
            bar.style.background = "linear-gradient(45deg, #ffa502, #ffbc06)";
        } else {
            badge.textContent = "LOW RISK";
            badge.className = "risk-level risk-low";
            if (data[key].risk < 10) bar.style.width = "5%"; // show a tiny bit
            bar.style.background = "linear-gradient(45deg, #2ed573, #7bed9f)";
        }
    });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

    if (cityInput) {
        cityInput.addEventListener("keypress", e => {
            if (e.key === "Enter") searchCity();
        });
    }

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            pos => fetchWeather(null, pos.coords.latitude, pos.coords.longitude),
            () => fetchWeather("Delhi")
        );
    } else {
        fetchWeather("Delhi");
    }

    // Wait until Leaflet map is ready, then load risk data
    const waitForMap = setInterval(() => {
        if (window.map) {
            loadDisasterRisk();
            clearInterval(waitForMap);
        }
    }, 200);
});
