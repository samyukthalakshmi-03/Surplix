@echo off
echo Setting up Surplix ML Backend...

echo Checking for requirements...
py -m pip install -r requirements.txt

echo.
echo ==========================================
echo ML Backend setup complete!
echo To train the model, you can run: 
echo py train.py
echo.
echo Starting the AI API server on port 8000...
echo ==========================================
py -m uvicorn app:app --reload

pause
