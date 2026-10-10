import { motion } from "motion/react";
import { Bot, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";

const suggestedQuestions = [
  "What's the best time to plant maize in Kaduna?",
  "How can I prevent flood damage to my cassava farm?",
  "What are the current pest outbreak risks in my region?",
  "Recommend irrigation schedule for rice farming",
  "Analyze soil health for my farm location"
];

const initialMessages = [
  {
    role: "assistant",
    content: "Hello! I'm AgroShield AI Assistant. I can help you with climate insights, planting recommendations, risk assessment, and farm management advice. How can I assist you today?"
  }
];

export function AIAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages,
      { role: "user", content: input },
      { role: "assistant", content: "I'm analyzing your question using real-time climate data and agricultural intelligence. Based on current conditions, here's my recommendation..." }
    ]);
    setInput("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
          AI Assistant
        </h1>
        <p className="text-sm md:text-base text-slate-400">
          Your intelligent farming advisor powered by climate data and machine learning
        </p>
      </motion.div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="xl:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[600px]"
          >
            {/* Chat Header */}
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AgroShield AI</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online & Ready
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                        : 'bg-slate-800/50 border border-slate-700 text-slate-200'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-6 border-t border-slate-800">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything about farming, climate, or crop management..."
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <Button
                  onClick={handleSend}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-6"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Questions */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Suggested Questions</h3>
            </div>
            <div className="space-y-3">
              {suggestedQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={() => setInput(question)}
                  className="w-full text-left p-3 rounded-xl bg-slate-800/30 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-colors text-sm text-slate-300 hover:text-white"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* AI Capabilities */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">AI Capabilities</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Real-time climate analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Crop-specific recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Risk prediction & alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Soil health assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Pest & disease detection</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
