from django.shortcuts import render
from .ml.predictor import estimate_magnitude_trend
from geopy.geocoders import Nominatim
from django.http import JsonResponse
from django.http import JsonResponse
from .api.disaster_risk import calculate_disaster_risk

geolocator = Nominatim(user_agent="stormsense_app")

def get_lat_long(place):
    location = geolocator.geocode(place)
    if location:
        return location.latitude, location.longitude
    return None, None



def appmainpage_view(request):
    return render(request, 'appmainpage.html')

def dashboard_view(request):
    return render(request, 'dashboard.html')

def avalanche_view(request):
    return render(request, 'avalanche.html')

def elements_view(request):
    return render(request, 'elements.html')

def flood_view(request):
    return render(request, 'flood.html')

def footer_view(request):
    return render(request, 'footer.html')

def hurricane_view(request):
    return render(request, 'hurricane.html')

def mainpage_view(request):
    return render(request, 'mainpage.html')

def tornado_view(request):
    return render(request, 'tornado.html')

def tsunami_view(request):
    return render(request, 'tsunami.html')

def earthquake_view(request):
    return render(request, 'earthquake.html')

def wildfires_view(request):
    return render(request, 'wildfires.html')

def yp_view(request):
    return render(request, 'yp.html')

def fp_view(request):
    return render(request, 'fp.html')


def predict_earthquake_view(request):
    location_name = request.GET.get("location")

    if not location_name:
        return JsonResponse({"error": "location parameter is required"}, status=400)

    lat, lon = get_lat_long(location_name)

    if lat is None:
        return JsonResponse({"error": "invalid location"}, status=400)

    magnitude = estimate_magnitude_trend(lat, lon)

    return JsonResponse({
        "location": location_name,
        "latitude": lat,
        "longitude": lon,
        "estimated_magnitude": magnitude
    })



def disaster_risk_view(request):
    data = calculate_disaster_risk()
    return JsonResponse(data)
