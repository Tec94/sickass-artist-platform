const https = require('https');
const fs = require('fs');

const url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzIwODJkOGI5NzVjMTRhOWM5MDgyMGRmNTA1OTI1NmZiEgsSBxDIhqGlkA0YAZIBJAoKcHJvamVjdF9pZBIWQhQxNTM5NTc0NTYzMDY2NDYyNTQxMg&filename=&opi=96797242";

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync('C:/Users/caoda/Desktop/general/code/projects/sickass-artist-platform/stitch_login.html', data);
    console.log('Downloaded stitch_login.html');
  });
}).on('error', err => {
  console.error(err);
});
