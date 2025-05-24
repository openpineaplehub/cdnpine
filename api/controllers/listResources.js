import githubService from '../services/githubServices.js';

class ListController {
  async list(req, res) {
    try {
      const { path, recursive } = req.query;
      
      const recursiveBool = recursive.toLowerCase() === 'true';
      const files = await githubService.listFiles(path, recursiveBool);
      return res.json({
        message: 'Files listed successfully',
        count: files.length,
        files: files
      });
    } catch (error) {
      console.error('List files error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

const listController = new ListController();
export const list = listController.list.bind(listController);
