/**
 * Cloudinary Service for Image Uploads
 * 
 * Note: This implementation uses unsigned uploads.
 * You need to configure a Cloud Name and an Unsigned Upload Preset in your Cloudinary Dashboard.
 */

// TODO: Replace these with your actual Cloudinary credentials
const CLOUD_NAME = 'dmgjkbgjr';
const UPLOAD_PRESET = 'bcps_photo'; // Must be an "Unsigned" upload preset

/**
 * Upload a single file to Cloudinary
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {


    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'barangay_complaints'); // Optional: organize in a folder

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return data.secure_url; // Return the HTTPS URL
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

/**
 * Upload multiple files to Cloudinary
 */
export const uploadPhotos = async (files: File[]): Promise<string[]> => {
    try {
        const uploadPromises = files.map(file => uploadToCloudinary(file));
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Error uploading photos:', error);
        throw error;
    }
};
