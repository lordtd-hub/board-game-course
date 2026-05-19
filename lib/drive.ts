import { Readable } from "node:stream";
import { appConfig } from "@/lib/config";
import { getDriveClient } from "@/lib/google";

async function ensureFolder(name: string, parentId: string) {
  const drive = getDriveClient();
  const escapedName = name.replace(/'/g, "\\'");
  const existing = await drive.files.list({
    q: `'${parentId}' in parents and name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    spaces: "drive"
  });

  const found = existing.data.files?.[0]?.id;
  if (found) return found;

  const created = await drive.files.create({
    fields: "id",
    requestBody: {
      name,
      parents: [parentId],
      mimeType: "application/vnd.google-apps.folder"
    }
  });

  if (!created.data.id) throw new Error(`Failed to create Drive folder: ${name}`);
  return created.data.id;
}

export async function ensureSubmissionFolder(term: string, sectionCode: string, assignmentId: string) {
  if (!appConfig.googleDriveRootFolderId) throw new Error("Missing GOOGLE_DRIVE_ROOT_FOLDER_ID.");
  const termFolder = await ensureFolder(term, appConfig.googleDriveRootFolderId);
  const sectionFolder = await ensureFolder(sectionCode, termFolder);
  return ensureFolder(assignmentId, sectionFolder);
}

export async function uploadSubmissionFile(input: {
  file: File;
  folderId: string;
  studentEmail: string;
  assignmentId: string;
}) {
  const drive = getDriveClient();
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const safeName = `${input.assignmentId}_${input.studentEmail}_${input.file.name}`.replace(/[\\/:*?"<>|]/g, "_");

  const created = await drive.files.create({
    fields: "id, name, webViewLink",
    requestBody: {
      name: safeName,
      parents: [input.folderId]
    },
    media: {
      mimeType: input.file.type || "application/octet-stream",
      body: Readable.from(buffer)
    }
  });

  const fileId = created.data.id || "";
  if (!fileId) throw new Error("Drive upload failed.");

  await drive.permissions.create({
    fileId,
    requestBody: { type: "anyone", role: "reader" }
  });

  return {
    fileId,
    fileName: created.data.name || safeName,
    fileUrl: created.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`
  };
}
