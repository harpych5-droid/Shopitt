// Cloudinary media upload service
// cloud_name: ddyzz3hho
// upload_preset: shopitt_preset (unsigned)

const CLOUDINARY_CLOUD =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD ?? 'ddyzz3hho';
const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_PRESET ?? 'shopitt_preset';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/upload`;

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video';
}

export const MediaService = {
  // Upload a single file from base64 or URI
  async upload(params: {
    uri: string;
    type: 'image' | 'video';
    fileName?: string;
  }): Promise<UploadResult | null> {
    try {
      const formData = new FormData();

      // On mobile, use the file URI directly
      formData.append('file', {
        uri: params.uri,
        type: params.type === 'video' ? 'video/mp4' : 'image/jpeg',
        name: params.fileName || `shopitt_${Date.now()}.${params.type === 'video' ? 'mp4' : 'jpg'}`,
      } as any);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', params.type);
      formData.append('folder', 'shopitt');

      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Cloudinary upload error:', errText);
        return null;
      }

      const data = await res.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        resourceType: data.resource_type,
      };
    } catch (err) {
      console.error('MediaService.upload:', err);
      return null;
    }
  },

  // Upload multiple files
  async uploadMultiple(
    files: Array<{ uri: string; type: 'image' | 'video'; fileName?: string }>
  ): Promise<string[]> {
    const results = await Promise.all(files.map(f => MediaService.upload(f)));
    return results
      .filter((r): r is UploadResult => r !== null)
      .map(r => r.url);
  },
};
