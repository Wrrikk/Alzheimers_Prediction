from flask import Flask, request, jsonify
import tensorflow as tf
import pandas as pd
import numpy as np
import joblib
import os

app = Flask(__name__)

# Define the absolute path to the directory where the model and preprocessors are saved
models_dir = "/api/models"

# Load the trained model
model_path = os.path.join(models_dir, "final_model_saved")
model = tf.keras.models.load_model(model_path)
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


@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Extract data from the POST request
        data = request.get_json(force=True)
        # Convert JSON data into a DataFrame that matches the training features
        input_data = pd.DataFrame([data])

        # Preprocess the data using the preloaded preprocessor
        processed_data = preprocessor.transform(input_data)

        # Make predictions using the loaded model
        predictions = model.predict(processed_data)

        # Convert predictions to readable class labels
        readable_predictions = postprocess(predictions)

        # Return the prediction as a JSON response
        return jsonify(readable_predictions.tolist()), 200
    except Exception as e:
        # Return an error message in case of issues in the process
        return jsonify({"error": str(e), "message": "Error processing request"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
