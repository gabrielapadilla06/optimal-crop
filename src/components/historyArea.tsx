import React from 'react';
import { Loader, Trash } from 'lucide-react'; // Importing the trash icon from lucide-react
import toast, { Toaster } from 'react-hot-toast'; // Importing the toast function from react-hot-toast
import { useUser } from "@clerk/nextjs";
import { Conversation } from '@/lib/types';

type UserResource = ReturnType<typeof useUser>["user"];

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  currentConversationId: string | null;
  user: UserResource;
  loading: boolean;
}

const HistoryArea: React.FC<ConversationListProps> = ({ conversations, onSelectConversation, onDeleteConversation, user, currentConversationId, loading }) => {
  const handleDelete = (id: string) => {
    // Confirmation toast
    toast((t) => (
      <span>
        Are you sure you want to delete this conversation?
        <button
          onClick={() => {
            onDeleteConversation(id); // Call the delete function passed as a prop
            toast.dismiss(t.id); // Dismiss the toast
          }}
          className="ml-3 text-red-500 font-bold"
        >
          Delete
        </button>
        <button
          onClick={() => toast.dismiss(t.id)} // Dismiss the toast without deleting
          className="ml-3 text-gray-500"
        >
          Cancel
        </button>
      </span>
    ));
  };

  return (
    <div>
      <Toaster /> {/* Ensure this is included */}
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Chats Timeline</h2>
      <h4 className="text-[15px] text-slate-500 font-medium mb-5">Here are your past conversations.</h4>
      {
        loading && (
          <div className="flex w-full justify-center items-center">
            <Loader size={20} className="block animate-spin" />
          </div>
        )
      }
      <ul className="space-y-2">
        {conversations.map((conversation) => (
          <li key={conversation.id} className="cursor-pointer flex items-center justify-between">
            <div
              className="w-full p-3 rounded-lg bg-white dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-between"
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex-grow text-left overflow-hidden">
                <h3 className="font-medium text-gray-800 dark:text-gray-100">{conversation.title}</h3>
              </div>
              {conversation.id == currentConversationId ? null :
                <button
                  className="ml-2 p-2 text-red-500 hover:text-red-700 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the div click from triggering
                    handleDelete(conversation.id);
                  }}
                >
                  <Trash size={20} />
                </button>}
            </div>


          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryArea;