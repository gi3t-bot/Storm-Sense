from django.contrib import admin
from django.urls import path
from StormSense import views
from .views import (
    appmainpage_view,
    dashboard_view,
    avalanche_view,
    elements_view,
    flood_view,
    footer_view,
    hurricane_view,
    mainpage_view,
    tornado_view,
    tsunami_view,
    earthquake_view,
    wildfires_view,
    yp_view,
    fp_view,
    predict_earthquake_view   # ← THIS WAS MISSING
)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', views.mainpage_view, name='mainpage'),

    path('tornado/', views.tornado_view, name='tornado'),
    path('hurricane/', views.hurricane_view, name='hurricane'),
    path('tsunami/', views.tsunami_view, name='tsunami'),
    path('earthquake/', views.earthquake_view, name='earthquake'),
    path('flood/', views.flood_view, name='flood'),
    path('wildfires/', views.wildfires_view, name='wildfires'),

    path('appmainpage/', views.appmainpage_view, name='appmainpage'),
    path('avalanche/', views.avalanche_view, name='avalanche'),
    path('elements/', views.elements_view, name='elements'),

    path('fp/', views.fp_view, name='fp'),
    path('yp/', views.yp_view, name='yp'),
    
    path("appmainpage/dashboard/", views.dashboard_view, name="dashboard"),
    path("predict-earthquake/", predict_earthquake_view, name="predict_earthquake"),
    
    path("api/disaster-risk/", views.disaster_risk_view, name="disaster_risk"),

]

