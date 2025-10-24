import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create the standard anon client for general use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload a file to Supabase Storage using the standard anon client
 * @param bucket - The storage bucket name
 * @param path - The path where the file will be stored
 * @param file - The file to upload (File or Blob)
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(bucket: string, path: string, file: File | Blob): Promise<string> {
  // For public uploads, we use the anon client directly
  // Make sure the bucket has appropriate RLS policies for public uploads
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Upload a base64 string as a file to Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The path where the file will be stored
 * @param base64String - The base64 encoded string
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadBase64(
  bucket: string,
  path: string,
  base64String: string,
  contentType: string = 'image/png'
): Promise<string> {
  // Convert base64 to blob
  const base64Data = base64String.split(',')[1] || base64String;
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: contentType });

  return uploadFile(bucket, path, blob);
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The path of the file to delete
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Get the public URL for a file in Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The path of the file
 * @returns The public URL
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}