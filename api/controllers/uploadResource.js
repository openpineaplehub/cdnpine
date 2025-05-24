import githubService from './../services/githubServices.js';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { addScheduledJob } from '../services/uploads/scheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function uploadFromPath(filePath, targetPath, filename) {
  const fileName = filename || path.basename(filePath);
  const fullPath = targetPath ? path.posix.join(targetPath, fileName) : fileName;

  // Kirim path file ke service, service akan baca file dan encode
  await githubService.uploadFile(fullPath, { localFilePath: filePath });

  return {
    message: 'File uploaded successfully',
    path: fullPath,
    url: `${process.env.CDN_BASE_URL}/${fullPath}`,
  };
}

class UploadController {
  async fromPath(req, res) {
    try {
      const { filePath, targetPath, filename, schedule } = req.body;

      if (!filePath) {
        return res.status(400).json({ error: 'filePath is required' });
      }

      if (schedule) {
        const job = await addScheduledJob({
          type: 'path',
          source: filePath,
          targetPath,
          filename,
          schedule,
        });

        return res.json({
          message: 'File scheduled for upload',
          jobId: job.id,
          scheduledAt: job.scheduledAt,
        });
      }

      const result = await uploadFromPath(filePath, targetPath, filename);
      return res.json(result);
    } catch (error) {
      console.error('Upload from path error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  async fromUrl(req, res) {
    try {
      const { url, targetPath, filename, schedule } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'url is required' });
      }

      if (schedule) {
        const job = await addScheduledJob({
          type: 'url',
          source: url,
          targetPath,
          filename,
          schedule,
        });

        return res.json({
          message: 'File scheduled for upload',
          jobId: job.id,
          scheduledAt: job.scheduledAt,
        });
      }

      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const fileContent = Buffer.from(response.data, 'binary');
      const fileName = filename || path.basename(new URL(url).pathname);
      const fullPath = targetPath ? path.posix.join(targetPath, fileName) : fileName;

      // Kirim konten base64 langsung ke service
      await githubService.uploadFile(fullPath, { base64Content: fileContent.toString('base64') });

      return res.json({
        message: 'File uploaded from URL successfully',
        path: fullPath,
        url: `${process.env.CDN_BASE_URL}/${fullPath}`,
      });
    } catch (error) {
      console.error('Upload from URL error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

const uploadController = new UploadController();
export const fromPath = uploadController.fromPath.bind(uploadController);
export const fromUrl = uploadController.fromUrl.bind(uploadController);
