import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const SCHEDULE_FILE = 'scheduled_uploads.json';

/**
 * Parse schedule input (supports "+10 minutes", "+1 day", ISO date etc.)
 * @param {string} schedule - Schedule string
 * @returns {Date}
 */
function parseSchedule(schedule) {
  if (schedule.startsWith('+')) {
    const now = new Date();
    const [, numStr, unitRaw] = schedule.match(/^\+(\d+)\s(\w+)/) || [];
    const num = parseInt(numStr, 10);
    const unit = unitRaw?.toLowerCase();

    if (isNaN(num) || !unit) {
      throw new Error('Invalid relative schedule format');
    }

    const result = new Date(now);

    switch (unit) {
      case 'second':
      case 'seconds':
        result.setSeconds(result.getSeconds() + num);
        break;
      case 'minute':
      case 'minutes':
        result.setMinutes(result.getMinutes() + num);
        break;
      case 'hour':
      case 'hours':
        result.setHours(result.getHours() + num);
        break;
      case 'day':
      case 'days':
        result.setDate(result.getDate() + num);
        break;
      case 'month':
      case 'months':
        result.setMonth(result.getMonth() + num);
        break;
      case 'year':
      case 'years':
        result.setFullYear(result.getFullYear() + num);
        break;
      default:
        throw new Error('Unsupported time unit');
    }

    return result;
  }

  const parsed = new Date(schedule);
  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid absolute date format');
  }
  return parsed;
}

/**
 * Add a scheduled job to the GitHub repo JSON file
 * @param {Object} params
 * @param {'path'|'url'} params.type
 * @param {string} params.source
 * @param {string} params.targetPath
 * @param {string} params.schedule
 * @param {string} [params.filename]
 * @param {string} [params.deleteAfter]
 * @returns {Promise<Object>} Scheduled job data
 */

export async function addScheduledJob(params) {
  try {
    const scheduledAt = parseSchedule(params.schedule);

    let existing = [];
    let sha;
    try {
      // Ambil file schedule yang sudah ada
      const { data } = await octokit.repos.getContent({
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        path: SCHEDULE_FILE,
        branch: process.env.GITHUB_BRANCH || 'main'
      });

      existing = JSON.parse(Buffer.from(data.content, 'base64').toString());
      sha = data.sha;  // Butuh sha untuk update file GitHub
    } catch (error) {
      if (error.status !== 404) throw error;
      // Kalau 404, berarti file belum ada, existing tetap array kosong
    }

    // Cek apakah sudah ada job dengan targetPath + filename + status pending
    const duplicateJob = existing.find(job =>
      job.targetPath === params.targetPath &&
      job.filename === params.filename &&
      job.status === 'pending'
    );

    if (duplicateJob) {
      throw new Error(`A pending job for ${params.targetPath}/${params.filename} already exists (job id: ${duplicateJob.id})`);
    }

    // Buat job baru
    const job = {
      id: `job-${Date.now()}`,
      type: params.type,
      source: params.source,
      targetPath: params.targetPath,
      filename: params.filename,
      scheduledAt: scheduledAt.toISOString(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      deleteAfter: params.deleteAfter
    };

    existing.push(job);

    // Update file dengan sha yang benar (required untuk update di GitHub)
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      path: SCHEDULE_FILE,
      message: `Add scheduled job ${job.id}`,
      content: Buffer.from(JSON.stringify(existing, null, 2)).toString('base64'),
      branch: process.env.GITHUB_BRANCH || 'main',
      sha // sertakan sha untuk update file
    });

    console.log(`Scheduled new job ${job.id} for ${params.targetPath}/${params.filename} at ${job.scheduledAt}`);

    return job;
  } catch (error) {
    console.error('Failed to schedule job:', error);
    throw error;
  }
}
