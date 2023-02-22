import urllib.request
import urllib.parse
import json
import os
import sys

apiUrl = os.environ['API_URL']
clientId = os.environ['VESA_CLIENT_ID']
clientSecret = os.environ['VESA_CLIENT_SECRET']
templateId = os.environ['TEMPLATE_ID']
tag = os.environ.get('TAG', 'latest')

try:
    print('Fetching auth token')
    data = urllib.parse.urlencode({'grant_type': 'client_credentials', 'client_id': clientId, 'client_secret': clientSecret})
    data = data.encode('ascii')
    f = urllib.request.urlopen(apiUrl + '/api/auth', data)
    j = f.read().decode('utf-8')
    token = json.loads(j)['access_token']
except urllib.error.HTTPError as e:
    print('Failed! Status:', e.status, "Response:", e.read().decode('utf-8'))
    sys.exit(1)

try:
    print('Updating template')
    req = urllib.request.Request(apiUrl+'/api/templates/'+templateId+'/update?tag='+tag, urllib.parse.urlencode({}).encode('ascii'))
    req.add_header('Authorization', 'Bearer ' + token)
    res = urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print('Failed! Status:', e.status, "Response:", e.read().decode('utf-8'))
    sys.exit(1)

print('Done')
