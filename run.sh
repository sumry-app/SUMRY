#!/bin/bash
# Quick start script for Educational Data Analysis App

echo "🚀 Starting Educational Data Analysis App..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

echo ""
echo "✅ Setup complete!"
echo "🌐 Launching Streamlit app..."
echo ""

# Run the app
streamlit run app.py
