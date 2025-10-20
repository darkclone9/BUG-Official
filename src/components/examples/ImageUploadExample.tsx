'use client';

/**
 * Image Upload Example Component
 * 
 * This is an example component demonstrating how to use the Firebase Storage
 * helper functions for uploading images. You can use this as a reference
 * when implementing image uploads in your own components.
 * 
 * Features demonstrated:
 * - File selection and validation
 * - Upload progress tracking
 * - Image preview
 * - Error handling
 * - Multiple image uploads
 */

import { useState } from 'react';
import { uploadImage, uploadMultipleImages, deleteImageByURL, ImageCategory } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function ImageUploadExample() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<ImageCategory>('general');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Validate file before upload
  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, GIF, etc.)');
      return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return false;
    }

    setError(null);
    return true;
  };

  // Handle single file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setUploadedUrl(null); // Clear previous upload
    }
  };

  // Handle multiple file selection
  const handleMultipleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(validateFile);
    setSelectedFiles(validFiles);
    setUploadedUrls([]); // Clear previous uploads
  };

  // Upload single image
  const handleSingleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      const url = await uploadImage(selectedFile, {
        category,
        onProgress: (prog) => {
          setProgress(prog.progress);
        },
      });

      setUploadedUrl(url);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('single-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Upload multiple images
  const handleMultipleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setError(null);

      const urls = await uploadMultipleImages(selectedFiles, { category });

      setUploadedUrls(urls);
      setSelectedFiles([]);
      
      // Reset file input
      const fileInput = document.getElementById('multiple-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Delete uploaded image
  const handleDelete = async (url: string) => {
    try {
      await deleteImageByURL(url);
      setUploadedUrl(null);
      setUploadedUrls(uploadedUrls.filter(u => u !== url));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete image.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Firebase Storage Image Upload Example</CardTitle>
          <CardDescription>
            Demonstrates how to upload images to Firebase Storage with progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Image Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ImageCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user-avatars">User Avatars</SelectItem>
                <SelectItem value="tournament-images">Tournament Images</SelectItem>
                <SelectItem value="product-images">Product Images</SelectItem>
                <SelectItem value="event-images">Event Images</SelectItem>
                <SelectItem value="announcement-images">Announcement Images</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Single File Upload */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Single Image Upload</h3>
            
            <div className="space-y-2">
              <Label htmlFor="single-file-input">Select Image</Label>
              <Input
                id="single-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </div>

            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </div>
            )}

            <Button
              onClick={handleSingleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>

            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {progress}% uploaded
                </p>
              </div>
            )}

            {uploadedUrl && (
              <div className="space-y-2 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Upload Successful!</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(uploadedUrl)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <img
                  src={uploadedUrl}
                  alt="Uploaded"
                  className="max-w-xs rounded-lg border"
                />
                <p className="text-xs text-muted-foreground break-all">
                  {uploadedUrl}
                </p>
              </div>
            )}
          </div>

          {/* Multiple File Upload */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Multiple Images Upload</h3>
            
            <div className="space-y-2">
              <Label htmlFor="multiple-file-input">Select Multiple Images</Label>
              <Input
                id="multiple-file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleFileSelect}
                disabled={uploading}
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedFiles.length} file(s)
              </div>
            )}

            <Button
              onClick={handleMultipleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
            </Button>

            {uploadedUrls.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center text-green-700 dark:text-green-300">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    {uploadedUrls.length} image(s) uploaded successfully!
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {uploadedUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(url)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Usage Instructions */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold">How to Use in Your Components:</h4>
            <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`import { uploadImage } from '@/lib/storage';

const handleUpload = async (file: File) => {
  const url = await uploadImage(file, {
    category: 'user-avatars',
    onProgress: (progress) => {
      console.log(\`\${progress.progress}%\`);
    },
  });
  
  // Save URL to database
  await updateUserProfile({ photoURL: url });
};`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

