
import githubService from '../services/githubServices.js';

class DeleteController {
  async byPath(req, res) {
    try {
      const { path } = req.query;

      if (!path) {
        return res.status(400).json({ error: 'path is required' });
      }

      await githubService.deleteFile(path);

      return res.json({
        message: 'File deleted successfully',
        path: path
      });
    } catch (error) {
      console.error('Delete by path error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  async bySha(req, res) {
    try {
      const { sha } = req.query;

      if (!sha) {
        return res.status(400).json({ error: 'sha is required' });
      }

      await githubService.deleteFileBySha(sha);

      return res.json({
        message: 'File deleted successfully by SHA',
        sha: sha
      });
    } catch (error) {
      console.error('Delete by SHA error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

const deleteController = new DeleteController();
export const byPath = deleteController.byPath.bind(deleteController);
export const bySha = deleteController.bySha.bind(deleteController);
