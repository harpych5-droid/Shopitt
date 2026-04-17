// Cloudinary media upload service
// cloud_name: ddyzz3hho | upload_preset: shopitt_preset

const CLOUD_NAME = 'ddyzz3hho';
const UPLOAD_PRESET = 'shopitt_preset';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

export interface UploadResult {
  url: string;
  publicId: string;
  type: 'image' | 'video';
}

export const MediaService = {
  async uploadFile(fileUri: string, fileType: 'image' | 'video' = 'image'): Promise<{ data: UploadResult | null; error: string | null }> {
    try {
      const formData = new FormData();

      // React Native file object
      const fileObj: any = {
        uri: fileUri,
        type: fileType === 'video' ? 'video/mp4' : 'image/jpeg',
        name: fileType === 'video' ? `shopitt_${Date.now()}.mp4` : `shopitt_${Date.now()}.jpg`,
      };

      formData.append('file', fileObj);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'shopitt');

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        return { data: null, error: err?.error?.message ?? 'Upload failed' };
      }

      const result = await response.json();

      return {
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          type: result.resource_type === 'video' ? 'video' : 'image',
        },
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: err?.message ?? 'Upload failed' };
    }
  },

  async uploadMultiple(files: Array<{ uri: string; type: 'image' | 'video' }>): Promise<{ urls: string[]; errors: string[] }> {
    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const { data, error } = await MediaService.uploadFile(file.uri, file.type);
      if (data) urls.push(data.url);
      if (error) errors.push(error);
    }

    return { urls, errors };
  },
};
