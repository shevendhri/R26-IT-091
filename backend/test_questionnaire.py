import requests, json
url='http://127.0.0.1:5000/api/questionnaire'
payload={'building_type':'Residential'}
resp = requests.post(url, json=payload)
print('Status:', resp.status_code)
print('Response:', resp.text)
