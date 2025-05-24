curl -X POST http://localhost:3000/api/upload/url \
  -H "Content-Type: application/json" \
  -H "PineCDN-API-Key: testdev" \
  -d '{
    "url": "https://fastly.picsum.photos/id/913/536/354.jpg?hmac=DLbKA363hL_kLTAdiYy_vOcfYVjlQKOs08EETFu4-Mk",
    "targetPath": "uploads",
    "filename": "custom-name.jpg"
  }'
