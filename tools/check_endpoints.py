import urllib.request, json

def fetch(url):
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            print(url)
            print(r.read().decode('utf-8'))
    except Exception as e:
        print(url, 'ERROR', e)

fetch('http://127.0.0.1:8000/api/model-status')
# Simple health check for analyze-blueprint (POST requires multipart; we'll check scene endpoint instead)
fetch('http://127.0.0.1:8000/api/scene?blueprint={}')
