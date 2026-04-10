const https = require('https');

https.get('https://pocketbase-admin-rutadeltelar.acostaparra.com/api/collections/productos/records?perPage=1', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const result = JSON.parse(data);
    console.log(result);
    if (result.items && result.items.length > 0) {
      console.log("Fields:", Object.keys(result.items[0]));
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
