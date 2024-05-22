from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import pandas as pd
import numpy as np
import joblib
import os
import scipy.sparse
from keras.layers import TFSMLayer

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "http://localhost:5173"}})

# Define the absolute path to the directory where the model and preprocessors are saved
models_dir = "/api/models"

# Load the trained model using TFSMLayer
model_path = os.path.join(models_dir, "final_model_saved")
model = TFSMLayer(model_path, call_endpoint="serving_default")
print("Model loaded successfully.")

# Load the preprocessor and label encoder
preprocessor = joblib.load(os.path.join(models_dir, "preprocessor.joblib"))
label_encoder = joblib.load(os.path.join(models_dir, "label_encoder.joblib"))
print("Preprocessors loaded successfully.")


def postprocess(predictions):
    """
    Convert prediction probabilities to human-readable class labels.
    """
    predicted_classes = label_encoder.inverse_transform(
        [np.argmax(pred) for pred in predictions]
    )
    return predicted_classes


@app.route("/")
def hello():
    return "Hello, world!"


@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Extract data from the POST request
        data = request.get_json(force=True)
        # Convert JSON data into a DataFrame that matches the training features
        input_data = pd.DataFrame([data])

        # Preprocess the data using the preloaded preprocessor
        processed_data = preprocessor.transform(input_data)

        # Convert sparse matrix to dense format
        if isinstance(processed_data, scipy.sparse.spmatrix):
            processed_data = processed_data.toarray()

        # Print the preprocessed data for debugging
        print("Preprocessed data:", processed_data)

        # Make predictions using the loaded model
        predictions = model(processed_data)

        # Print the raw predictions for debugging
        print("Raw predictions:", predictions)

        # Convert predictions to readable class labels
        readable_predictions = postprocess(predictions)

        # Print the readable predictions for debugging
        print("Readable predictions:", readable_predictions)

        # Return the prediction as a JSON response
        return jsonify(readable_predictions.tolist()), 200
    except Exception as e:
        # Return an error message in case of issues in the process
        return jsonify({"error": str(e), "message": "Error processing request"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
