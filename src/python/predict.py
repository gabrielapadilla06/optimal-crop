import json
import sys
import numpy as np
import os
from joblib import load

# Read input data from stdin
input_data = json.load(sys.stdin)

# Extract features
features = [
    input_data['N'],
    input_data['P'],
    input_data['K'],
    input_data['temperature'],
    input_data['humidity'],
    input_data['ph'],
    input_data['rainfall']
]

# Load the model
model_path = os.path.join(os.path.dirname(__file__), 'model.joblib')
model = load(model_path)  # Remove the unnecessary file open - joblib.load handles this

# Convert to numpy array and reshape for prediction
features_array = np.array(features).reshape(1, -1)

# Make prediction
prediction = model.predict(features_array)

# Print the prediction (will be captured by the Node.js process)
print(prediction[0])

