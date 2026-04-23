from django.db import models
class WeatherLog(models.Model):
    location = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    temperature = models.FloatField()
    humidity = models.FloatField(null=True, blank=True)
    wind_speed = models.FloatField()
    rainfall = models.FloatField(default=0.0)
    cloud_cover = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.location} at {self.timestamp}"
class AlertAction(models.Model):
    disaster_type = models.CharField(max_length=50) 
    risk_level = models.CharField(max_length=20)    
    next_steps = models.TextField()
    def __str__(self):
        return f"{self.disaster_type} - {self.risk_level}"