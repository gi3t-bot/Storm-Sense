import joblib
import pandas as pd
try:
    flood_means = joblib.load("StormSense/ml/flood_feature_means.pkl")
    cyclone_means = joblib.load("StormSense/ml/cyclone_feature_means.pkl")
    print(
        "Flood Features (type {}, len {}): {}".format(
            type(flood_means),
            len(flood_means),
            (
                flood_means.index.tolist()
                if isinstance(flood_means, pd.Series)
                else flood_means
            ),
        )
    )
    print(
        "Cyclone Features (type {}, len {}): {}".format(
            type(cyclone_means),
            len(cyclone_means),
            (
                cyclone_means.index.tolist()
                if isinstance(cyclone_means, pd.Series)
                else cyclone_means
            ),
        )
    )
except Exception as e:
    print("Error:", e)