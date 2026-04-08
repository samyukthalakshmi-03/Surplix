import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
from PIL import Image

app = FastAPI()

# Enable CORS since our frontend is on a different port (5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Initialize the model structure
model = models.mobilenet_v2(pretrained=False)
model.classifier[1] = nn.Linear(model.classifier[1].in_features, 2)
model = model.to(device)

model_path = os.path.join(os.path.dirname(__file__), 'food_model.pth')

# Load weights if they exist (user might need to train first)
if os.path.exists(model_path):
    model.load_state_dict(torch.load(model_path, map_location=device))
    print("Loaded trained food model.")
else:
    print("Warning: food_model.pth not found. Predictions will be random until you train the model!")

model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.post("/predict")
async def predict_food(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert('RGB')
        tensor = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(tensor)
            _, predicted = torch.max(outputs, 1)
            is_spoiled = predicted.item() == 1
            
        return {"spoiled": is_spoiled, "message": "Spoiled" if is_spoiled else "Fresh"}
    except Exception as e:
        return {"error": str(e), "spoiled": False}

@app.get("/")
def read_root():
    return {"message": "Surplix ML Backend is running!"}
