# Use an official Python runtime as a parent image
FROM python:3.8-slim

# Set the working directory in the container
WORKDIR /api

# Copy the requirements file and install dependencies
COPY requirements.txt /api/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Flask application code into the container
COPY api /api

# Copy the model directory into the container
COPY models /api/models

# Expose the port the app runs on
EXPOSE 5000

# Define environment variables for Flask
ENV FLASK_ENV=production
ENV FLASK_APP=app.py

# Run the Flask application
CMD ["flask", "run", "--host=0.0.0.0"]