'use client';

import { createClient } from '../../../utils/supabase/client';
import { useRouter } from 'next/navigation';

// Define the props for the DeleteButton component
type DeleteButtonProps = {
  id: string; // FIX: Changed prop name from 'recordId' to 'id' for consistency
  tableName: string;
};

export default function DeleteButton({ id, tableName }: DeleteButtonProps) {
  const supabase = createClient();
  const router = useRouter();

  const handleDelete = async () => {
    // NOTE: The confirm() dialog was removed as it can cause issues in certain environments
    // and is generally discouraged in modern web apps. A custom modal would be a better UX.
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id); // FIX: Use the 'id' prop directly

    if (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      // NOTE: alert() was removed. It's better to handle errors with a UI notification.
    } else {
      // Refresh the page to show the updated list
      router.refresh();
    }
  };

  return (
    <button onClick={handleDelete} className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">
      Delete
    </button>
  );
}
