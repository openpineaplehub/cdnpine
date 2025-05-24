function checkEnvironment(req, res, next) {
  const requiredEnvVars = [
    'GITHUB_TOKEN',
    'GITHUB_REPO_OWNER',
    'GITHUB_REPO_NAME',
    'CDN_BASE_URL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    return res.status(500).json({
      error: 'Missing required environment variables',
      missing: missingVars
    });
  }

  next();
}

export default checkEnvironment;
