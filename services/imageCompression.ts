/**
 * Compresses an image file using the browser's Canvas API.
 * 
 * @param file - The original image File object.
 * @param maxWidth - The maximum width of the output image.
 * @param maxHeight - The maximum height of the output image.
 * @param quality - The quality of the output JPEG (0 to 1).
 * @returns A Promise that resolves to the compressed File object.
 */
export const compressImage = async (
    file: File,
    maxWidth: number = 1024,
    maxHeight: number = 1024,
    quality: number = 0.7
): Promise<File> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            if (e.target?.result) {
                image.src = e.target.result as string;
            }
        };

        reader.onerror = (error) => reject(error);

        image.onload = () => {
            let width = image.width;
            let height = image.height;

            // Calculate new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            ctx.drawImage(image, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Canvas to Blob conversion failed'));
                    }
                },
                'image/jpeg',
                quality
            );
        };

        image.onerror = (error) => reject(error);

        reader.readAsDataURL(file);
    });
};
