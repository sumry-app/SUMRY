@echo off
REM Quick start script for Educational Data Analysis App (Windows)

echo Starting Educational Data Analysis App...
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/update dependencies
echo Installing dependencies...
pip install -r requirements.txt --quiet

echo.
echo Setup complete!
echo Launching Streamlit app...
echo.

REM Run the app
streamlit run app.py
