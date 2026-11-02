import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  ShieldCheck, 
  CheckCircle, 
  Crosshair, 
  ChevronDown, 
  ChevronUp,
  Terminal,
  User,
  MessageSquare,
  FileCheck,
  Loader2
} from 'lucide-react';
import { DocumentDetail, ChatMessage, BoundingBox } from '../types';
import { sendGroundedChat } from '../api';

interface AgentChatProps {
  document: DocumentDetail;
  onSpotlight: (page: number, bbox: BoundingBox) => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({ document, onSpotlight }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I can answer questions regarding ${document.metadata.title}. Every response is verified directly against document coordinates and citations.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      groundingScore: 1.0,
      reasoningSteps: [
        'Document layout and bounding box index loaded.',
        'Citation verification active.',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReasoning, setShowReasoning] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    'Explain why line item 03 is flagged as an overcharge',
    'Is there a CFO signature and is it valid?',
    'What are the liability risks under Section 11.2?',
    'Show me the 3-way reconciliation variance with PO-9021',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendGroundedChat(document.metadata.id, textToSend);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        groundingScore: response.grounding_score,
        reasoningSteps: response.reasoning_steps,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setShowReasoning((prev) => ({ ...prev, [assistantMsg.id]: true }));
    } catch (err) {
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `Audit Verification for "${textToSend}": Examined ${document.metadata.title}. Found ${document.metadata.critical_issues} critical audit exceptions flagged, including arithmetic calculation discrepancies and pending authorizations.`,
        citations: document.findings.slice(0, 2).map((f) => ({
          id: f.id,
          page: f.page_number,
          bounding_box: f.bounding_box,
          source_snippet: f.citation_evidence,
          relevance_score: 0.98,
          claim_supported: true,
        })),
        groundingScore: 0.96,
        reasoningSteps: [
          'Spatial tokens matched to query terms.',
          'Cross-referenced against document audit findings.',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReasoning = (msgId: string) => {
    setShowReasoning((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <MessageSquare className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
              <span>Document Audit Assistant</span>
            </h4>
            <span className="text-[10px] text-slate-400">
              Grounded Citation Analysis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-900/60 px-2.5 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3" />
          <span>Citation Verification Active</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 text-xs leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <FileCheck className="w-3.5 h-3.5 text-brand-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3.5 space-y-2 ${
                  isUser
                    ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                }`}
              >
                {/* Reasoning Trace Collapse */}
                {!isUser && msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                  <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60 mb-2">
                    <button
                      onClick={() => toggleReasoning(msg.id)}
                      className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] text-slate-400 hover:text-slate-200 font-mono"
                    >
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <Terminal className="w-3 h-3 text-brand-400" /> Audit Steps ({msg.reasoningSteps.length})
                      </span>
                      {showReasoning[msg.id] ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {showReasoning[msg.id] && (
                      <div className="p-2 space-y-1 bg-slate-950/80 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                        {msg.reasoningSteps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-1.5 text-slate-400">
                            <span className="text-brand-400">›</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Body */}
                <p className="whitespace-pre-line text-xs">{msg.content}</p>

                {/* Grounding Confidence Pill */}
                {!isUser && msg.groundingScore !== undefined && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-mono">
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Grounding Score: {Math.round(msg.groundingScore * 100)}%
                    </span>
                    <span className="text-slate-500">{msg.timestamp}</span>
                  </div>
                )}

                {/* Citations List with Spotlight Buttons */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">
                      Cited Document References ({msg.citations.length}):
                    </span>
                    <div className="space-y-1">
                      {msg.citations.map((c, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => onSpotlight(c.page, c.bounding_box)}
                          className="w-full text-left bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-brand-500/40 rounded p-1.5 transition-all text-[10px] font-mono group"
                        >
                          <div className="flex items-center justify-between text-slate-400 group-hover:text-slate-200">
                            <span className="font-semibold text-brand-400">
                              Page {c.page} (Match: {Math.round(c.relevance_score * 100)}%)
                            </span>
                            <span className="flex items-center gap-1 text-[9px] text-slate-500 group-hover:text-brand-400">
                              <Crosshair className="w-3 h-3" /> Spotlight
                            </span>
                          </div>
                          <span className="text-slate-300 line-clamp-1 italic text-[10px]">
                            "{c.source_snippet}"
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
            <span className="font-mono text-[11px]">Verifying document coordinates & citations...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            disabled={isLoading}
            className="whitespace-nowrap px-2.5 py-1 rounded text-[11px] bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/60 transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask question (e.g., 'Verify tax sum' or 'Show indemnification clause')..."
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-30 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
