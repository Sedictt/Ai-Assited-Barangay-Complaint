import pandas as pd
import random
from datetime import datetime, timedelta

# Load existing data
df = pd.read_csv("data.csv")

# Sample data for generation
names = ["Eric Flores", "Miguel Nunez", "Kent Santos", "Diane Dela Cruz", "Elena Perez", "Aira Rivas", "Rob Dela Cruz", "Jenny Santos"]
complaints = [
    "Hindi dumadaan ang garbage truck.",
    "May nagmomotorsiklo ng malakas.",
    "May lasing na nagwawala.",
    "Nagwawala ang kapitbahay.",
    "May sunog na amoy.",
    "Flooding kahit mahina ang ulan.",
    "Sira ang streetlight.",
    "Malakas na putok, parang baril.",
    "Nawalan ng tubig buong araw.",
    "Barado ang drainage.",
    "Nagkalat ang basura ng kapitbahay.",
    "Domestic violence po sa kabilang bahay.",
    "May kaso ng food poisoning.",
    "Maingay ang kapitbahay araw-araw.",
    "Brownout po sa buong street.",
    "May batang nawawala.",
    "May patay na hayop sa kanal.",
    "May mabahong amoy sa paligid.",
    "Mahinang signal ng internet.",
]
categories = ["Sanitation", "Noise", "Crime", "Peace & Order", "Safety", "Infrastructure", "Health", "Utilities"]
severities = ["Low", "Medium", "High", "Critical"]
barangays = [f"Brgy {i}" for i in range(1, 200)]
priorities = [2, 3, 4, 5]

# Generate new entries
new_rows = []
start_id = df["id"].max() + 1
for i in range(start_id, start_id + 2000):  # Add 2000 more entries
    name = random.choice(names)
    complaint = random.choice(complaints)
    category = random.choice(categories)
    severity = random.choice(severities)
    timestamp = (datetime(2025, 10, 26) + timedelta(minutes=random.randint(0, 120000))).strftime("%Y-%m-%d %H:%M")
    barangay = random.choice(barangays)
    priority = random.choice(priorities)
    new_rows.append([i, name, complaint, category, severity, timestamp, barangay, priority])

# Append and save
df_new = pd.DataFrame(new_rows, columns=df.columns)
df = pd.concat([df, df_new], ignore_index=True)
df.to_csv("data.csv", index=False)
print("Expanded dataset to", len(df), "rows.")
