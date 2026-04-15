import requests

url = "https://xeno-canto.org/api/2/recordings?query=cnt:india"
req = requests.get(url)
data = req.json()
print("Number of recordings:", data.get('numRecordings'))
print("Sample recording:", data.get('recordings', [])[0])
