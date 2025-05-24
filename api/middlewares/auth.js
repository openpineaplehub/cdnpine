export const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['pinecdn-api-key'] || req.headers['PineCDN-API-KEY'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key required',
      message: 'Please provide PINECDN-API-KEY header or apiKey query parameter'
    });
  }

  if (apiKey !== process.env.API_TOKEN) {
    return res.status(403).json({ 
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  next();
};