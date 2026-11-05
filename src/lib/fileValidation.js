// Mirrors the backend's multer limits in SolicitorSenseAPI/routes/chat.routes.js
export const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "txt"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_FILES = 5;

export const validateFiles = (files, alreadySelectedCount = 0) => {
  const reasons = new Set();
  const accepted = [];

  for (const file of files) {
    const extension = file.name.toLowerCase().split(".").pop();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      reasons.add("Only PDF, DOC, DOCX, and TXT files are allowed.");
    } else if (file.size > MAX_FILE_SIZE) {
      reasons.add("Files must be under 10MB each.");
    } else if (alreadySelectedCount + accepted.length >= MAX_FILES) {
      reasons.add(`You can attach up to ${MAX_FILES} files per message.`);
    } else {
      accepted.push(file);
    }
  }

  return {
    accepted,
    rejectedMessage: reasons.size
      ? `Some files were rejected. ${[...reasons].join(" ")}`
      : null,
  };
};
