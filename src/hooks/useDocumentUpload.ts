'use client';

import { useState } from 'react';

export function useDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, folder: string) => {
    setIsUploading(true);
    // UploadThing implementation
    setIsUploading(false);
    return { success: true, url: '' };
  };

  return { upload, isUploading, progress };
}
