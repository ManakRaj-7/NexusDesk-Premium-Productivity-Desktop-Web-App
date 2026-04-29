import { useState } from 'react';
import { MainLayout } from '../../components/layout';
import { Button, Input } from '../../components/ui';
import { assistantService } from '../../services';
import { Send, Trash2, Bot } from 'lucide-react';

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
      const errorMsg = err.response?.data?.message || 'Could not send message. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{ role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you today?' }]);
    setConversationId(null);
  };

  const renderContent = (content) => {
    return content.split('\n').map((line, i) => (
      <div key={i} className="mb-2 last:mb-0">
        {line.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-primary-400 font-bold">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={j} className="text-slate-400 italic">{part.slice(1, -1)}</em>;
          }
          return part;
        })}
      </div>
    ));
  };

  return (
    <MainLayout>
      <div className="p-8 max-w-3xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <Bot className="text-primary-500" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">AI Assistant</h1>
              <p className="text-xs text-slate-500">Connected to live knowledge</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleClearChat} className="text-slate-400 hover:text-red-400">
            <Trash2 size={14} className="mr-2" />
            Clear
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="flex-1 bg-dark-card/50 border border-dark-border rounded-2xl p-6 mb-6 overflow-y-auto space-y-6 scroll-smooth shadow-inner">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-soft-sm ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white rounded-tr-none'
                    : 'bg-dark-card border border-dark-border text-slate-100 rounded-tl-none'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {renderContent(msg.content)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-5 py-3 bg-dark-card border border-dark-border rounded-2xl rounded-tl-none flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-3 bg-dark-card p-2 rounded-2xl border border-dark-border shadow-soft-lg">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 px-4 py-2 placeholder-slate-600 text-sm"
          />
          <Button
            variant="primary"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-xl px-6 py-2"
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </MainLayout>
  );
}
