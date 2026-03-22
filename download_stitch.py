import urllib.request

url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzIwODJkOGI5NzVjMTRhOWM5MDgyMGRmNTA1OTI1NmZiEgsSBxDIhqGlkA0YAZIBJAoKcHJvamVjdF9pZBIWQhQxNTM5NTc0NTYzMDY2NDYyNTQxMg&filename=&opi=96797242"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    html = response.read()

with open('C:/Users/caoda/Desktop/general/code/projects/sickass-artist-platform/stitch_login.html', 'wb') as f:
    f.write(html)

print("Downloaded.")
