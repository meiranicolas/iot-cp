import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

async function convertToBase64DataURI(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(uri)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
}

export async function saveImagePermanently(tempUri: string): Promise<string> {
  try {
    console.log('🔵 [FileSystem] Starting save process...');
    console.log('🔵 [FileSystem] Platform:', Platform.OS);
    console.log('🔵 [FileSystem] Temp URI:', tempUri);

    if (Platform.OS === 'web') {
      console.log('🔵 [FileSystem] Web platform detected - converting to base64...');
      const base64DataURI = await convertToBase64DataURI(tempUri);
      console.log('✅ [FileSystem] Image converted to base64 (length:', base64DataURI.length, 'chars)');
      return base64DataURI;
    }

    console.log('🔵 [FileSystem] Mobile platform detected - saving to file system...');
    console.log('🔵 [FileSystem] Document directory:', FileSystem.documentDirectory);

    const receiptsDirPath = `${FileSystem.documentDirectory}receipts/`;
    console.log('🔵 [FileSystem] Receipts directory path:', receiptsDirPath);

    const dirInfo = await FileSystem.getInfoAsync(receiptsDirPath);
    console.log('🔵 [FileSystem] Directory exists?', dirInfo.exists);

    if (!dirInfo.exists) {
      console.log('🔵 [FileSystem] Creating directory...');
      await FileSystem.makeDirectoryAsync(receiptsDirPath, { intermediates: true });
      console.log('🔵 [FileSystem] Directory created!');
    } else {
      console.log('🔵 [FileSystem] Directory already exists');
    }

    const filename = `receipt_${Date.now()}.jpg`;
    const permanentFilePath = receiptsDirPath + filename;
    console.log('🔵 [FileSystem] Permanent file path:', permanentFilePath);

    console.log('🔵 [FileSystem] Copying file...');
    await FileSystem.copyAsync({
      from: tempUri,
      to: permanentFilePath,
    });
    console.log('🔵 [FileSystem] File copied!');

    const savedFileInfo = await FileSystem.getInfoAsync(permanentFilePath);
    console.log('🔵 [FileSystem] Saved file exists?', savedFileInfo.exists);
    console.log('🔵 [FileSystem] Saved file size:', savedFileInfo.size);

    if (!savedFileInfo.exists) {
      throw new Error('Failed to save image permanently');
    }

    console.log('✅ [FileSystem] Image saved successfully:', permanentFilePath);
    return permanentFilePath;
  } catch (error) {
    console.error('❌ [FileSystem] Error saving image:', error);
    console.error('❌ [FileSystem] Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function deleteImage(uri: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      console.log('🔵 [FileSystem] Web platform - no local file to delete');
      return;
    }

    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri);
      console.log('✅ [FileSystem] Image deleted:', uri);
    }
  } catch (error) {
    console.error('❌ [FileSystem] Error deleting image:', error);
    throw error;
  }
}

export async function imageExists(uri: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return uri.startsWith('data:');
    }

    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists;
  } catch (error) {
    console.error('❌ [FileSystem] Error checking image existence:', error);
    return false;
  }
}

export async function getStorageInfo(): Promise<{
  totalImages: number;
  totalSize: number;
}> {
  try {
    if (Platform.OS === 'web') {
      console.log('🔵 [FileSystem] Web platform - storage info not available');
      return { totalImages: 0, totalSize: 0 };
    }

    const receiptsDirPath = `${FileSystem.documentDirectory}receipts/`;
    const dirInfo = await FileSystem.getInfoAsync(receiptsDirPath);

    if (!dirInfo.exists) {
      return { totalImages: 0, totalSize: 0 };
    }

    const files = await FileSystem.readDirectoryAsync(receiptsDirPath);
    let totalSize = 0;

    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(receiptsDirPath + file);
      if (fileInfo.exists && !fileInfo.isDirectory) {
        totalSize += fileInfo.size || 0;
      }
    }

    return {
      totalImages: files.length,
      totalSize,
    };
  } catch (error) {
    console.error('❌ [FileSystem] Error getting storage info:', error);
    return { totalImages: 0, totalSize: 0 };
  }
}
