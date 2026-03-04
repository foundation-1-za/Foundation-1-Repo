'use client';

// Stub for storage client without Supabase
// In production, use UploadThing consistently

export const BUCKETS = {
  CLIENT_DOCUMENTS: 'client-documents',
  LEAD_ATTACHMENTS: 'lead-attachments',
  USER_CVS: 'user-cvs',
} as const;

export async function uploadFile({ file, bucket, path = '' }: any) {
  console.log('Mock upload:', file.name, bucket, path);
  return {
    url: '',
    path: '',
    size: file.size,
    mimeType: file.type,
  };
}

export async function downloadFile(bucket: any, path: string) {
  return new Blob();
}

export async function deleteFile(bucket: any, path: string) {
}

export function useFileUpload() {
  return {
    uploadDocument: async (file: File, clientId: string) => uploadFile({ file, bucket: 'CLIENT_DOCUMENTS', path: clientId }),
    uploadLeadAttachment: async (file: File, leadId: string) => uploadFile({ file, bucket: 'LEAD_ATTACHMENTS', path: leadId }),
    uploadUserCV: async (file: File, userId: string) => uploadFile({ file, bucket: 'USER_CVS', path: userId }),
    downloadFile,
    deleteFile,
  };
}
