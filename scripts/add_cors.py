import os

path = r"C:\Users\VICTUS\OneDrive\Desktop\ANC\backend\main.py"
if os.path.exists(path):
    with open(path, "r", encoding="utf-8") as f:
        c = f.read()

    if "CORSMiddleware" not in c:
        c = c.replace(
            "from fastapi import FastAPI, HTTPException, Header, Query",
            "from fastapi import FastAPI, HTTPException, Header, Query\nfrom fastapi.middleware.cors import CORSMiddleware"
        )
        target = 'app = FastAPI(\n    title="Kumbh Sarthi API",\n    version="2.0",\n    description="Pilgrim safety, YOLO crowd intelligence, family connect & real-time alerts"\n)'
        replacement = target + '\n\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=["*"],\n    allow_credentials=True,\n    allow_methods=["*"],\n    allow_headers=["*"],\n)'
        c = c.replace(target, replacement)
        with open(path, "w", encoding="utf-8") as f:
            f.write(c)
        print("CORSMiddleware added successfully to ANC main.py!")
    else:
        print("CORSMiddleware already present in ANC main.py")
