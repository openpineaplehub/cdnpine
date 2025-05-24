curl -X POST http://localhost:3000/api/upload/path \
  -H "Content-Type: application/json" \
  -H "PineCDN-API-Key: testdev" \
  -d '{
    "filePath": "./test/fixtures/sample.txt",
    "targetPath": "uploads"
  }'