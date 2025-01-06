import { useState } from 'react';

export default function App() {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setError('');

    try {
      const presignedResponse = await fetch('/ur/api/endpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType: file.type })
      });

      if (!presignedResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { presignedUrl, viewUrl } = await presignedResponse.json();

      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      setImageUrl(viewUrl);
    } catch (error) {
      setError(error.message || 'Upload failed');
      console.error('Upload failed:', error);
    } finally {

    }
  };

  return (
    <div >
      <div>
        <input
          type="file"
          onChange={handleUpload}
          accept=""
        />
      </div>
      {error && (
        <p >{error}</p>
      )}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Uploaded"
        />
      )}
    </div>
  );
}


