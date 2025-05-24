// api/services/githubService.js
import { Octokit } from '@octokit/rest';
import fs from 'fs';

class GitHubService {
  constructor() {
    this.repoOwner = process.env.GITHUB_REPO_OWNER;
    this.repoName = process.env.GITHUB_REPO_NAME;
    this.branch = process.env.GITHUB_BRANCH || 'main';

    console.log('GitHubService config:', {
      repoOwner: this.repoOwner,
      repoName: this.repoName,
      branch: this.branch,
    });

    if (!this.repoOwner || !this.repoName) {
      throw new Error('GITHUB_REPO_OWNER or GITHUB_REPO_NAME environment variable is missing');
    }

    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      userAgent: 'cdnpine-api/v1.0.0',
    });
  }

  async uploadFile(path, options = {}) {
  const { localFilePath, base64Content, message = 'Upload file via CDNPine API' } = options;

  try {
    let sha;
    
    try {
      const { data: existing } = await this.octokit.repos.getContent({
        owner: this.repoOwner,
        repo: this.repoName,
        path,
        ref: this.branch,
      });
      
      sha = existing.sha;
      console.log(`File exists at ${path} with sha: ${sha}`);
    } catch (err) {
      if (err.status !== 404) throw err;
      console.log(`File not found at ${path}, will create new.`);
    }

    let contentBase64;
    if (base64Content) {
      contentBase64 = base64Content;
    } else if (localFilePath) {
      const contentBuffer = fs.readFileSync(localFilePath);
      contentBase64 = contentBuffer.toString('base64');
    } else {
      throw new Error('Either localFilePath or base64Content must be provided');
    }

    const response = await this.octokit.repos.createOrUpdateFileContents({
      owner: this.repoOwner,
      repo: this.repoName,
      path,
      message,
      branch: this.branch,
      content: contentBase64,
      ...(sha ? { sha } : {}),
    });

    console.log('Upload response status:', response.status);
    return response.data;
  } catch (error) {
    console.error('GitHub upload error:', error);
    if (error.status) console.error('GitHub API status:', error.status);
    if (error.response) console.error('GitHub API response data:', error.response.data);
    throw new Error('Failed to upload file to GitHub');
  }
}

  async deleteFile(path, message = 'Delete file via CDNPine API') {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.repoOwner,
        repo: this.repoName,
        path,
        ref: this.branch,
      });

      const response = await this.octokit.repos.deleteFile({
        owner: this.repoOwner,
        repo: this.repoName,
        path,
        message,
        sha: data.sha,
        branch: this.branch,
      });

      return response.data;
    } catch (error) {
      console.error('GitHub delete error:', error);
      throw new Error('Failed to delete file from GitHub');
    }
  }

  async deleteFileBySha(sha) {
    throw new Error('deleteFileBySha is not implemented. Provide path to delete files.');
  }

  async listFiles(path = '', recursive = false) {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.repoOwner,
        repo: this.repoName,
        path,
        ref: this.branch,
      });

      if (Array.isArray(response.data)) {
        if (recursive) {
          const files = [];
          for (const item of response.data) {
            if (item.type === 'dir') {
              const subFiles = await this.listFiles(item.path, true);
              files.push(...subFiles);
            } else {
              files.push({
                name: item.name,
                path: item.path,
                sha: item.sha,
                url: item.download_url,
                size: item.size,
              });
            }
          }
          return files;
        } else {
          return response.data.map(item => ({
            name: item.name,
            path: item.path,
            type: item.type,
            sha: item.sha,
            url: item.type === 'file' ? item.download_url : null,
            size: item.size,
          }));
        }
      } else {
        return [{
          name: response.data.name,
          path: response.data.path,
          sha: response.data.sha,
          url: response.data.download_url,
          size: response.data.size,
        }];
      }
    } catch (error) {
      console.error('GitHub list files error:', error);
      throw new Error('Failed to list files from GitHub');
    }
  }
}

const githubService = new GitHubService();
export default githubService;
