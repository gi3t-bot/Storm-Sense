import requests

OPENWEATHER_API_KEY = "12f6fd13ed1526d19b7f18c491fe721f"

INDIA_COORDS = [
    ("Assam", 26.2006, 92.9376),
    ("Bihar", 25.0961, 85.3131),
    ("Rajasthan", 27.0238, 74.2179),
    ("Odisha", 20.9517, 85.0985),
    ("Uttarakhand", 30.0668, 79.0193),
    ("Maharashtra", 19.7515, 75.7139),
    ("Kerala", 10.8505, 76.2711),
    ("Tamil Nadu", 11.1271, 78.6569),
    ("West Bengal", 22.9868, 87.8550),
    ("Punjab", 31.1471, 75.3412),
    ("Gujarat", 22.2587, 71.1924),
]


def fetch_weather(lat, lon):
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric"
    }
    return requests.get(url, params=params, timeout=5).json()




def calculate_disaster_risk():
    flood_areas = []
    heatwave_areas = []
    cyclone_areas = []

    flood_risk = heatwave_risk = cyclone_risk = 20

    for region, lat, lon in INDIA_COORDS:
        data = fetch_weather(lat, lon)

        temp = data["main"]["temp"]
        wind = data["wind"]["speed"]
        rain = data.get("rain", {}).get("3h", 0)

        # Flood logic
    for region, lat, lon in INDIA_COORDS:
        data = fetch_weather(lat, lon)

        temp = data["main"]["temp"]
        wind = data["wind"]["speed"]
        rain = data.get("rain", {}).get("3h", 0)
        clouds = data.get("clouds", {}).get("all", 0)

        if rain > 5 or clouds > 85:
            flood_areas.append(region)
            flood_risk = max(flood_risk, 80)

        if temp > 32:
            heatwave_areas.append(region)
            heatwave_risk = max(heatwave_risk, 85)

        if wind > 10:
            cyclone_areas.append(region)
            cyclone_risk = max(cyclone_risk, 70)


    return {
        "flood": {"areas": flood_areas or ["No major risk"], "risk": flood_risk},
        "heatwave": {"areas": heatwave_areas or ["No major risk"], "risk": heatwave_risk},
        "cyclone": {"areas": cyclone_areas or ["No major risk"], "risk": cyclone_risk},

        # Semi-static / derived
        "earthquake": {"areas": ["Uttarakhand", "Himachal Pradesh"], "risk": 45},
        "drought": {"areas": ["Maharashtra"], "risk": 50},
        "landslide": {"areas": ["Sikkim"], "risk": 70},
        "wildfire": {"areas": ["Madhya Pradesh"], "risk": 60},
        "tsunami": {"areas": ["Andaman & Nicobar Islands"], "risk": 20},
    }

