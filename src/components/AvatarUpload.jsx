import { useState } from 'react';
import { supabase } from '../config/supabaseClient';

export default function AvatarUpload({ userId, currentAvatarUrl, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a profile picture asset file to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Ensure file name maps cleanly to the active account profile
      const filePath = `${userId}/profile-avatar.${fileExt}`;

      // 1. Send the binary image straight up to your public bucket space
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Fetch the clean, public global URL link structure
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Synchronize this permanent link path straight back to your profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;
      
      alert('Profile picture uploaded successfully!');
      if (onUploadComplete) onUploadComplete(publicUrl);
    } catch (error) {
      alert(`Avatar setup failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-md">
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs uppercase">No Photo</div>
        )}
      </div>
      <label className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 font-bold py-1.5 px-3 rounded-md border border-gray-300 dark:border-gray-700 cursor-pointer transition">
        {uploading ? 'Processing Image File...' : '📸 Change Profile Picture'}
        <input 
          type="file" 
          accept="image/*" 
          disabled={uploading} 
          onChange={handleUpload} 
          className="hidden" 
        />
      </label>
    </div>
  );
}
