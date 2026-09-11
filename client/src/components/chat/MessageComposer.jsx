import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { uploadService } from '../../services/uploadService';
import { EmojiPickerPopover } from './EmojiPickerPopover';
import {
  Send,
  Paperclip,
  Smile,
  X,
  Loader2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

export const MessageComposer = () => {
  const { user } = useAuth();
  const {
    selectedChat,
    sendNewMessage,
    replyingTo,
    setReplyingTo,
    editingMessage,
    setEditingMessage,
    editMessage,
    emitTyping,
    emitStopTyping,
  } = useChat();
  const toast = useToast();

  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // If editing message is set, fill the text input
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content || '');
      if (textareaRef.current) textareaRef.current.focus();
    }
  }, [editingMessage]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [text]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!editingMessage && e.target.value.trim().length > 0) {
      emitTyping();
    } else {
      emitStopTyping();
    }
  };

  const handleKeyDown = (e) => {
    const enterToSend = user?.settings?.enterToSend !== false;

    if (e.key === 'Enter' && !e.shiftKey && enterToSend) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (isSending || isUploading) return;

    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;

    try {
      setIsSending(true);

      if (editingMessage) {
        await editMessage(editingMessage._id, trimmed);
        setEditingMessage(null);
        toast.success('Message updated');
      } else {
        await sendNewMessage({
          content: trimmed,
          attachments,
          messageType: attachments.length > 0 ? (attachments[0].fileType?.startsWith('image/') ? 'image' : 'file') : 'text',
        });
      }

      setText('');
      setAttachments([]);
      setShowEmoji(false);
      emitStopTyping();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    // Check file size (15MB max)
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds the 15MB limit');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      const res = await uploadService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      if (res.success && res.data) {
        setAttachments((prev) => [...prev, res.data]);
        toast.success('File uploaded');
      }
    } catch (err) {
      console.error(err);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    if (textareaRef.current) textareaRef.current.focus();
  };

  if (!selectedChat) return null;

  return (
    <div className="relative p-3 border-t border-slate-800/80 bg-slate-950/50 backdrop-blur-md">
      {/* Replying Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 animate-slide-up">
          <div className="truncate flex-1">
            <span className="font-semibold text-brand-400">Replying to {replyingTo.sender?.name || 'User'}: </span>
            <span className="truncate italic text-slate-400">
              {replyingTo.deleted ? 'This message was deleted' : replyingTo.content || 'Attachment'}
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editing Banner */}
      {editingMessage && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 animate-slide-up">
          <span className="font-semibold">Editing message...</span>
          <button
            onClick={() => {
              setEditingMessage(null);
              setText('');
            }}
            className="p-1 rounded-md text-amber-300 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pending Attachments List */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((att, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
            >
              {att.fileType?.startsWith('image/') ? (
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="max-w-[150px] truncate">{att.fileName}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="p-0.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="mb-2">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Uploading attachment...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Composer Input Bar */}
      <div className="flex items-end gap-2 bg-slate-900/90 border border-slate-700/60 rounded-2xl p-2 shadow-inner">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
        />

        {/* Action buttons: Attach & Emoji */}
        <div className="flex items-center gap-0.5 pb-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Attach file or image"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
            {showEmoji && (
              <EmojiPickerPopover
                onSelectEmoji={handleSelectEmoji}
                onClose={() => setShowEmoji(false)}
              />
            )}
          </div>
        </div>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 bg-transparent py-2 px-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-36 leading-relaxed"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!text.trim() && attachments.length === 0) || isSending || isUploading}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow disabled:opacity-40 disabled:hover:bg-indigo-600 disabled:shadow-none transition-all active:scale-95 flex-shrink-0"
          title="Send message"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
