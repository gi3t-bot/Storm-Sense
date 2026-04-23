import joblib
import os
from django.conf import settings
BASE_DIR = settings.BASE_DIR
model_path = os.path.join(BASE_DIR, "StormSense", "ml", "rf_earthquake_model.pkl")
means_path = os.path.join(BASE_DIR, "StormSense", "ml", "feature_means.pkl")
model = joblib.load(model_path)
feature_means = joblib.load(means_path)
def estimate_magnitude_trend(latitude, longitude):
    values = feature_means.values.copy()
    values[0] = latitude
    values[1] = longitude
    prediction = model.predict([values])[0]
    return round(float(prediction), 2)