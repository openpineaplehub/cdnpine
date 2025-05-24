import fs from 'fs/promises';
import path from 'path';
import { Octokit } from '@octokit/rest';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/**
 * Upload file from local path to GitHub repo
 * @param {string} filePath - Local file path
 * @param {string} [targetPath] - Target directory in repo
 * @param {string} [filename] - Custom filename
 * @returns {Promise<Object>} Upload result
 */
export async function uploadFromPath(filePath, targetPath, filename) {
  try {
    // Validate inputs
    if (!filePath) throw new Error('filePath is required');
    
    // Read file content
    const fileContent = await fs.readFile(filePath);
    const base64Content = fileContent.toString('base64');
    
    // Determine target path and filename
    const finalFilename = filename || path.basename(filePath);
    const repoPath = targetPath ? `${targetPath}/${finalFilename}` : finalFilename;
    
    // Upload to GitHub
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      path: repoPath,
      message: `Upload ${finalFilename} via CDNPine API`,
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
    console.error('Upload from path error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}