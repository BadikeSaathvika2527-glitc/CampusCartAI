import http from 'http';

const req = http.request('http://localhost:3000/api/ai/assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const data = JSON.parse(body);
    console.log('Context:', data.contextTitle, '| Rec count:', data.recommendations?.length, '| Total:', data.finalTotal);
  });
});

req.write(JSON.stringify({ query: 'Joining hostel next week, need room essentials & bedding under ₹3,000', budget: 3000 }));
req.end();
