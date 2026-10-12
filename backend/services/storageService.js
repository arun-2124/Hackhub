const fs = require('fs');
const path = require('path');

// Local uploads directory
const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'submissions');
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

const isSupabaseConfigured = () => {
  return Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_STORAGE_BUCKET
  );
};

/**
 * Upload file to persistent storage (Supabase if configured, otherwise local disk)
 * @param {Object} file - Multer file object
 * @param {string|number} ideaId - Project idea ID for folder namespacing
 * @returns {Promise<{ storageProvider: string, filePath: string, publicUrl?: string }>}
 */
const uploadSubmissionFile = async (file, ideaId) => {
  if (isSupabaseConfigured()) {
    const supabaseUrl = process.env.SUPABASE_URL.replace(/\/+$/, '');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    const storagePath = `ideas/${ideaId}/${file.filename}`;

    try {
      const fileBuffer = fs.readFileSync(file.path);
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`;

      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          'Content-Type': file.mimetype || 'application/octet-stream',
          'x-upsert': 'true'
        },
        body: fileBuffer
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[StorageService] Supabase upload failed, retaining local copy:', errorText);
        return {
          storageProvider: 'local',
          filePath: file.path
        };
      }

      console.log(`[StorageService] Uploaded ${file.filename} to Supabase bucket: ${bucket}/${storagePath}`);
      return {
        storageProvider: 'supabase',
        filePath: storagePath
      };
    } catch (err) {
      console.error('[StorageService] Error streaming to Supabase:', err.message);
      return {
        storageProvider: 'local',
        filePath: file.path
      };
    }
  }

  // Default: local filesystem
  return {
    storageProvider: 'local',
    filePath: file.path
  };
};

/**
 * Stream or resolve download for a submission file
 * @param {string} storedPath - Stored file_path (local path or Supabase object path)
 * @param {string} originalName - Original filename for Content-Disposition
 * @param {Object} res - Express response object
 */
const downloadSubmissionFile = async (storedPath, originalName, res) => {
  // 1. Check if physical file exists locally on disk
  const localResolved = path.isAbsolute(storedPath)
    ? storedPath
    : path.join(__dirname, '..', storedPath);

  if (fs.existsSync(localResolved)) {
    return res.download(localResolved, originalName);
  }

  // 2. If stored on Supabase, stream from Supabase Storage
  if (isSupabaseConfigured()) {
    const supabaseUrl = process.env.SUPABASE_URL.replace(/\/+$/, '');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    const objectPath = storedPath.startsWith('ideas/') ? storedPath : `ideas/${storedPath}`;
    const downloadUrl = `${supabaseUrl}/storage/v1/object/authenticated/${bucket}/${objectPath}`;

    try {
      // Create a signed download URL or stream authenticated object
      const signRes = await fetch(`${supabaseUrl}/storage/v1/object/sign/${bucket}/${objectPath}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expiresIn: 120 })
      });

      if (signRes.ok) {
        const signData = await signRes.json();
        const fullSignedUrl = `${supabaseUrl}/storage/v1${signData.signedURL}`;
        const fileStreamRes = await fetch(fullSignedUrl);
        if (fileStreamRes.ok) {
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`);
          res.setHeader('Content-Type', fileStreamRes.headers.get('content-type') || 'application/octet-stream');
          const arrayBuffer = await fileStreamRes.arrayBuffer();
          return res.send(Buffer.from(arrayBuffer));
        }
      }
    } catch (err) {
      console.error('[StorageService] Error downloading from Supabase:', err.message);
    }
  }

  return res.status(404).json({
    success: false,
    message: 'Physical file not found on server or cloud storage.'
  });
};

module.exports = {
  isSupabaseConfigured,
  persistUploadedFile: uploadSubmissionFile,
  streamDownloadedFile: downloadSubmissionFile
};
