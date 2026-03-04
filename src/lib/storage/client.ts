'use client';

import { createClient } from '@/lib/supabase/client';

const BUCKETS = {
  CLIENT_DOCUMENTS: 'client-documents',
  LEAD_ATTACHMENTS: 'lead-attachments',
  USER_CVS: 'user-cvs',
} as const;

interface UploadOptions {
  file: File;
  bucket: keyof typeof BUCKETS;
  path?: string;
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  url: string;
  path: string;
  size: number;
  mimeType: string;
}

export async function uploadFile({
  file,
  bucket,
  path = '',
  onProgress,
}: UploadOptions): Promise<UploadResult> {
  const supabase = createClient();
  const bucketName = BUCKETS[bucket];
  
  // Generate unique filename
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = path ? `${path}/${timestamp}_${safeName}` : `${timestamp}_${safeName}`;

  // Upload with progress tracking (if available)
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL (for private buckets, use signed URL)
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
    size: file.size,
    mimeType: file.type,
  };
}

export async function downloadFile(bucket: keyof typeof BUCKETS, path: string): Promise<Blob> {
  const supabase = createClient();
  const bucketName = BUCKETS[bucket];

  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(path);

  if (error) {
    throw new Error(`Download failed: ${error.message}`);
  }

  return data;
}

export async function getSignedUrl(
  bucket: keyof typeof BUCKETS,
  path: string,
  expiresIn = 3600
): Promise<string> {
  const supabase = createClient();
  const bucketName = BUCKETS[bucket];

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

export async function deleteFile(bucket: keyof typeof BUCKETS, path: string): Promise<void> {
  const supabase = createClient();
  const bucketName = BUCKETS[bucket];

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export async function listFiles(
  bucket: keyof typeof BUCKETS,
  path = ''
): Promise<{ name: string; path: string; size: number; createdAt: string }[]> {
  const supabase = createClient();
  const bucketName = BUCKETS[bucket];

  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(path);

  if (error) {
    throw new Error(`List failed: ${error.message}`);
  }

  return (data || []).map((item) => ({
    name: item.name,
    path: `${path}/${item.name}`,
    size: item.metadata?.size || 0,
    createdAt: item.created_at,
  }));
}

export function getFileUrl(bucket: keyof typeof BUCKETS, path: string): string {
  const supabase = createClient();
  const bucketName = BUCKETS[bucket];

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path);

  return data.publicUrl;
}

// Hook for file uploads with progress
export function useFileUpload() {
  return {
    uploadDocument: (file: File, clientId: string) =>
      uploadFile({
        file,
        bucket: 'CLIENT_DOCUMENTS',
        path: clientId,
      }),
    
    uploadLeadAttachment: (file: File, leadId: string) =>
      uploadFile({
        file,
        bucket: 'LEAD_ATTACHMENTS',
        path: leadId,
      }),
    
    uploadUserCV: (file: File, userId: string) =>
      uploadFile({
        file,
        bucket: 'USER_CVS',
        path: userId,
      }),

    downloadFile,
    deleteFile,
    getSignedUrl,
    getFileUrl,
  };
}

export { BUCKETS };
export type { UploadOptions, UploadResult };
