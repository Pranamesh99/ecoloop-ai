import urllib.request
import json
import csv
import os
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://archive-api.open-meteo.com/v1/archive?latitude=40.7143&longitude=-74.006&start_date=2023-07-01&end_date=2023-07-07&hourly=temperature_2m"

req = urllib.request.urlopen(url, context=ctx)
data = json.loads(req.read())

times = data["hourly"]["time"]
temps = data["hourly"]["temperature_2m"]

os.makedirs("backend/data", exist_ok=True)
with open("backend/data/building_dataset.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["timestamp", "outdoor_temp_c", "baseline_lighting_kw", "baseline_equipment_kw", "co2_generation_rate"])
    
    for i in range(len(times) - 1):
        t1 = times[i]
        temp1 = temps[i]
        temp2 = temps[i+1]
        
        hour = int(t1.split("T")[1].split(":")[0])
        
        for step in range(12):
            interp_temp = temp1 + (temp2 - temp1) * (step / 12.0)
            minute = step * 5
            ts = f"{t1.split(':')[0]}:{minute:02d}"
            
            is_business_hours = 8 <= hour < 18
            lighting = 12.0 if is_business_hours else 2.0
            equipment = 20.0 if is_business_hours else 4.0
            co2_rate = 1.0 if is_business_hours else 0.1
            
            writer.writerow([ts, round(interp_temp, 2), lighting, equipment, co2_rate])

print("Generated dataset at backend/data/building_dataset.csv")
