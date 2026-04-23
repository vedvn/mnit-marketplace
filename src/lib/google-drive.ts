import { google } from 'googleapis';
import { stringify } from 'csv-stringify/sync';

/**
 * Uploads a CSV archive to Google Drive.
 * Requires GOOGLE_SERVICE_ACCOUNT_JSON and GOOGLE_DRIVE_FOLDER_ID in environment variables.
 */
export async function uploadAnalyticsArchive(data: any[], filename: string) {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!credentialsJson || !folderId) {
    console.error('[GoogleDrive] Missing credentials or folder ID. Archive aborted.');
    return { success: false, error: 'Missing environment variables' };
  }

  try {
    const credentials = JSON.parse(credentialsJson);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Convert data to CSV string
    const csvString = stringify(data, { header: true });

    // Upload to Drive
    const response = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
        mimeType: 'text/csv',
      },
      media: {
        mimeType: 'text/csv',
        body: csvString,
      },
    });

    if (response.status === 200) {
      console.log(`[GoogleDrive] Archive successful: ${filename} (ID: ${response.data.id})`);
      return { success: true, fileId: response.data.id };
    }

    throw new Error(`Upload failed with status ${response.status}`);
  } catch (err) {
    console.error('[GoogleDrive] Critical failure during upload:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
