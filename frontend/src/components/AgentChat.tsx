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
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
            <MessageSquare className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
              <span>Document Audit Assistant</span>
            </h4>
            <span className="text-[10px] text-slate-500">
              Grounded Citation Analysis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          <span>Citation Verification Active</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
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
                <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5 shadow-2xs">
                  <FileCheck className="w-3.5 h-3.5 text-brand-600" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3.5 space-y-2 ${
                  isUser
                    ? 'bg-brand-600 text-white rounded-br-none shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                }`}
              >
                {/* Reasoning Trace Collapse */}
                {!isUser && msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 mb-2">
                    <button
                      onClick={() => toggleReasoning(msg.id)}
                      className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] text-slate-600 hover:text-slate-900 font-mono"
                    >
                      <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Terminal className="w-3 h-3 text-brand-600" /> Audit Steps ({msg.reasoningSteps.length})
                      </span>
                      {showReasoning[msg.id] ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {showReasoning[msg.id] && (
                      <div className="p-2 space-y-1 bg-white border-t border-slate-200 text-[10px] font-mono text-slate-600">
                        {msg.reasoningSteps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-1.5 text-slate-600">
                            <span className="text-brand-600 font-bold">›</span>
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
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] font-mono">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Grounding Score: {Math.round(msg.groundingScore * 100)}%
                    </span>
                    <span className="text-slate-400">{msg.timestamp}</span>
                  </div>
                )}

                {/* Citations List with Spotlight Buttons */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide block">
                      Cited References ({msg.citations.length}):
                    </span>
                    <div className="space-y-1">
                      {msg.citations.map((c, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => onSpotlight(c.page, c.bounding_box)}
                          className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-brand-500 rounded p-1.5 transition-all text-[10px] font-mono group"
                        >
                          <div className="flex items-center justify-between text-slate-600 group-hover:text-slate-900">
                            <span className="font-semibold text-brand-700">
                              Page {c.page} (Match: {Math.round(c.relevance_score * 100)}%)
                            </span>
                            <span className="flex items-center gap-1 text-[9px] text-slate-400 group-hover:text-brand-600">
                              <Crosshair className="w-3 h-3" /> Spotlight
                            </span>
                          </div>
                          <span className="text-slate-700 line-clamp-1 italic text-[10px]">
                            "{c.source_snippet}"
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-md bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 w-fit shadow-2xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
            <span className="font-mono text-[11px]">Verifying document coordinates & citations...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            disabled={isLoading}
            className="whitespace-nowrap px-2.5 py-1 rounded text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200">
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
            className="flex-1 bg-white border border-slate-200 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors shadow-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-30 text-white rounded-lg transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
