// ================= WEATHER CONFIG =================
const apiKey = "e1dc16a599c030a9d32dee11c9c33ace";
const app = document.getElementById("app");
const cityInput = document.getElementById("cityInput");

// ================= INDIA STATE COORDS =================
const STATE_COORDS = {
    "Assam": [26.2006, 92.9376],
    "Bihar": [25.0961, 85.3131],
    "Rajasthan": [27.0238, 74.2179],
    "Odisha": [20.9517, 85.0985],
    "Uttarakhand": [30.0668, 79.0193],
    "Himachal Pradesh": [31.1048, 77.1734],
    "Maharashtra": [19.7515, 75.7139],
    "Madhya Pradesh": [22.9734, 78.6569],
    "Sikkim": [27.5330, 88.5122],
    "Andaman & Nicobar Islands": [11.7401, 92.6586]
};

// ================= MAP =================
const stateMarkers = {};

function getRiskColor(risk) {
    if (risk >= 70) return "#ff4757";
    if (risk >= 40) return "#ffa502";
    return "#2ed573";
}

function initMapMarkers() {
    if (!window.map) return;

    Object.entries(STATE_COORDS).forEach(([state, coords]) => {
        const marker = L.circleMarker(coords, {
            radius: 8,
            color: "#2ed573",
            fillColor: "#2ed573",
            fillOpacity: 0.85
        })
        .addTo(window.map)
        .bindPopup(`${state}<br>Low Risk`);

        stateMarkers[state] = marker;
    });
}

function updateMapWithRiskData(data) {
    Object.values(data).forEach(disaster => {
        const color = getRiskColor(disaster.risk);

        disaster.areas.forEach(state => {
            const marker = stateMarkers[state];
            if (!marker) return;

            marker.setStyle({
                color,
                fillColor: color
            });

            marker.setPopupContent(`${state}<br>Risk: ${disaster.risk}`);
        });
    });
}

// ================= DASHBOARD API =================
function loadDisasterRisk() {
    fetch("/api/disaster-risk/")
        .then(res => res.json())
        .then(data => {
            updateDashboard(data);
            updateMapWithRiskData(data);
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

// ================= WEATHER =================
async function fetchWeather(query) {
    if (!locationEl) return;

    try {
        const res = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}`
        );
        if (!res.ok) throw new Error("City not found");

        const data = await res.json();
        updateWeatherUI(data);
    } catch {
        locationEl.textContent = "City not found";
    }
}

function updateWeatherUI(data) {
    const { location, current } = data;

    locationEl.textContent = `${location.name}, ${location.country}`;
    conditionEl.textContent = current.condition.text;
    tempEl.textContent = `${current.temp_c}°C`;
    humidityEl.textContent = `Humidity: ${current.humidity}%`;
    windEl.textContent = `Wind: ${current.wind_kph} kph`;
    iconEl.src = "https:" + current.condition.icon;
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
        } else if (data[key].risk >= 40) {
            badge.textContent = "MEDIUM RISK";
            badge.className = "risk-level risk-medium";
        } else {
            badge.textContent = "LOW RISK";
            badge.className = "risk-level risk-low";
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
            pos => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
            () => fetchWeather("Delhi")
        );
    } else {
        fetchWeather("Delhi");
    }

    // ⬅️ wait until map exists
    const waitForMap = setInterval(() => {
        if (window.map) {
            initMapMarkers();
            loadDisasterRisk();
            clearInterval(waitForMap);
        }
    }, 200);
});
