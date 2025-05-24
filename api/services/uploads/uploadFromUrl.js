import axios from 'axios';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/**
 * Upload file from URL to GitHub repo
 * @param {string} url - Source file URL
 * @param {string} [targetPath] - Target directory in repo
 * @param {string} [filename] - Custom filename
 * @returns {Promise<Object>} Upload result
 */
export async function uploadFromUrl(url, targetPath, filename) {
  try {
    // Validate inputs
    if (!url) throw new Error('url is required');
    
    // Download file
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const base64Content = Buffer.from(response.data, 'binary').toString('base64');
    
    // Extract filename from URL if not provided
    let finalFilename = filename;
    if (!finalFilename) {
      const urlObj = new URL(url);
      finalFilename = urlObj.pathname.split('/').pop() || `file-${Date.now()}`;
    }
    
    // Determine repo path
    const repoPath = targetPath ? `${targetPath}/${finalFilename}` : finalFilename;
    
    // Upload to GitHub
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      path: repoPath,
      message: `Upload ${finalFilename} from URL via CDNPine API`,
      content: base64Content,
      branch: process.env.GITHUB_BRANCH || 'main'
    });
    
    return {
      success: true,
      path: repoPath,
      url: `${process.env.CDN_BASE_URL}/${repoPath}`,
      githubData: data
    };
  } catch (error) {
    console.error('Upload from URL error:', error);
    throw new Error(`Failed to upload from URL: ${error.message}`);
  }
}