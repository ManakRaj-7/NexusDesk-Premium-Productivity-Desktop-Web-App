import { useState } from 'react';
import { MainLayout } from '../../components/layout';
import { Button, Input } from '../../components/ui';
import { assistantService } from '../../services';
import { Send } from 'lucide-react';

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const outgoingMessage = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const response = await assistantService.sendMessage(outgoingMessage, conversationId);
      const conversation = response.data.conversation;
      setConversationId(conversation._id);
      setMessages(conversation.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })));
    } catch (err) {
      console.error('Failed to send assistant message:', err);
      setMessages((prev) => prev.filter((message) => message !== userMessage));
      setError('Could not send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-8 max-w-2xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">AI Assistant</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="flex-1 bg-dark-card border border-dark-border rounded-xl p-6 mb-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-hover text-slate-100 border border-dark-border'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-slate-400">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1"
          />
          <Button
            variant="primary"
            type="submit"
            disabled={!input.trim() || isLoading}
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </MainLayout>
  );
}
