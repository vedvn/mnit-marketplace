/**
 * MNIT Marketplace - Image Optimization Utilities
 * Used to ensure student photos stay under the 2MB storage limit 
 * while maintaining high visual quality.
 */

export async function compressImage(file: File, maxSizeMB: number = 2): Promise<File> {
  // 1. Check if already within limits
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 2. Downscale logic (max 1920px width/height for marketplace viewing)
        const MAX_DIM = 1920;
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context failed'));
        
        ctx.drawImage(img, 0, 0, width, height);

        // 3. Recursive compression quality reduction if needed
        let quality = 0.8;
        const targetSize = maxSizeMB * 1024 * 1024;

        const attemptCompression = (q: number) => {
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Compression failed'));
            
            if (blob.size > targetSize && q > 0.1) {
              attemptCompression(q - 0.1);
            } else {
              // Convert blob back to File with .jpg extension to match JPEG encoding
              const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
              const newFileName = `${baseName}.jpg`;
              
              const compressedFile = new File([blob], newFileName, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            }
          }, 'image/jpeg', q);
        };

        attemptCompression(quality);
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
}
