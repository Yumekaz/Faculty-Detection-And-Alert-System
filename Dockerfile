# ---------- Base Image ----------
FROM python:3.10-slim

# ---------- System Dependencies ----------
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libopencv-dev \
    && rm -rf /var/lib/apt/lists/*

# ---------- Working Directory ----------
WORKDIR /app

# ---------- Copy Requirements ----------
COPY requirements.txt /app/

# ---------- Install Python Dependencies ----------
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ---------- Copy Code ----------
COPY . /app

# ---------- Expose App Port ----------
EXPOSE 8000

# ---------- Start Command ----------
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
