import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Style, ChatMessage, DesignState, MoodBoard, MoodBoardItem } from './types';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Image as ImageIcon, Sparkles, RefreshCcw, ArrowRight, Check, ShoppingBag, Info, Box, Save, Layout, MessageSquare, Heart } from 'lucide-react';
import { CompareSlider } from './components/CompareSlider';
import { StyleCarousel } from './components/StyleCarousel';
import { ChatInterface } from './components/ChatInterface';
import { Room3D } from './components/Room3D';
import { MoodBoardView } from './components/MoodBoardView';

const STYLES: Style[] = [
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Minimalist, functional, and cozy with light woods and neutral tones.',
    prompt: 'Reimagine this room in a Scandinavian style. Use light wood furniture, neutral color palette (whites, grays, beiges), minimalist decor, and cozy textiles like wool and linen. Ensure the layout remains similar but the aesthetic is clean and bright.',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'mid-century',
    name: 'Mid-Century Modern',
    description: 'Retro-inspired with organic shapes, tapered legs, and bold accents.',
    prompt: 'Reimagine this room in a Mid-Century Modern style. Incorporate iconic furniture with tapered legs, organic shapes, warm wood tones (teak, walnut), and pops of mustard yellow or olive green. Maintain the room structure but update all furniture and decor.',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Raw and edgy with exposed brick, metal accents, and reclaimed wood.',
    prompt: 'Reimagine this room in an Industrial style. Use raw materials like exposed brick, black metal frames, reclaimed wood, and leather furniture. The lighting should be Edison bulbs or metal pendants. Keep the basic layout but give it a warehouse-loft feel.',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Eclectic and vibrant with layered patterns, plants, and natural textures.',
    prompt: 'Reimagine this room in a Bohemian style. Add lots of indoor plants, layered rugs with intricate patterns, rattan or wicker furniture, and colorful textiles. The vibe should be relaxed, artistic, and full of life while respecting the original room boundaries.',
    image: 'https://images.unsplash.com/photo-1522758939261-808a391698ad?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'japandi',
    name: 'Japandi',
    description: 'A blend of Japanese elegance and Scandinavian functionality.',
    prompt: 'Reimagine this room in a Japandi style. Combine Japanese minimalism with Scandinavian comfort. Use low-profile furniture, natural materials, a muted earthy palette, and clean lines. Focus on "wabi-sabi" (beauty in imperfection) and functional simplicity.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=400'
  }
];

const INITIAL_MOOD_BOARDS: MoodBoard[] = [
  { id: 'default', name: 'My Inspiration', items: [] }
];

export default function App() {
  const [state, setState] = useState<DesignState>({
    originalImage: null,
    generatedImage: null,
    currentStyle: null,
    isGenerating: false,
    chatHistory: [],
    moodBoards: INITIAL_MOOD_BOARDS,
    activeTab: 'design',
    show3D: false
  });
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState(prev => ({
          ...prev,
          originalImage: event.target?.result as string,
          generatedImage: null,
          currentStyle: null,
          show3D: false
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateDesign = async (style: Style) => {
    if (!state.originalImage) return;

    setState(prev => ({ ...prev, isGenerating: true, currentStyle: style, show3D: false }));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = state.originalImage.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: "image/png" } },
            { text: style.prompt }
          ],
        },
      });

      let generatedUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          generatedUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (generatedUrl) {
        setState(prev => ({
          ...prev,
          generatedImage: generatedUrl,
          isGenerating: false
        }));
        
        // Add initial consultant message
        const initialMsg: ChatMessage = {
          role: 'model',
          text: `I've reimagined your space in a **${style.name}** style! 

Notice how I've incorporated ${style.description.toLowerCase()} 

What do you think? We can refine this further—for example, I can change the color of the walls, suggest different furniture, or help you find similar items online.`
        };
        setState(prev => ({ ...prev, chatHistory: [initialMsg] }));
      } else {
        throw new Error("No image generated");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = { role: 'user', text };
    setState(prev => ({ ...prev, chatHistory: [...prev.chatHistory, userMsg] }));
    setIsChatTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are Aura, an expert AI Interior Design Consultant. 
          ${state.generatedImage ? `The user has uploaded a photo of their room and you have generated a new design in ${state.currentStyle?.name} style.` : 'The user is looking for general interior design advice.'}
          
          Your goals:
          1. Answer questions about interior design principles, color theory, furniture placement, and styling advice.
          2. Help the user refine their generated design if applicable.
          3. Provide professional, helpful tips and suggestions in a conversational manner.
          4. When relevant, provide "shoppable links" (use placeholder URLs like https://example.com/item) for furniture or decor.
          5. Be warm, sophisticated, and encouraging.
          6. Use Markdown for formatting.
          
          If the user asks for a visual change (like "make the rug blue"), explain that you can't re-generate the image yet but you can describe how it would look and offer advice on choosing the right blue rug.`
        }
      });

      const response = await chat.sendMessage({ message: text });
      const modelMsg: ChatMessage = { role: 'model', text: response.text || "I'm sorry, I couldn't process that request." };
      
      setState(prev => ({ ...prev, chatHistory: [...prev.chatHistory, modelMsg] }));
    } catch (error) {
      console.error("Chat failed:", error);
    } finally {
      setIsChatTyping(false);
    }
  };

  const handleSaveToMoodBoard = (boardId: string) => {
    if (!state.generatedImage) return;
    
    setIsSaving(true);
    const newItem: MoodBoardItem = {
      id: Math.random().toString(36).substr(2, 9),
      image: state.generatedImage,
      title: `${state.currentStyle?.name || 'Custom'} Design`,
      styleName: state.currentStyle?.name,
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      moodBoards: prev.moodBoards.map(board => 
        board.id === boardId 
          ? { ...board, items: [newItem, ...board.items] }
          : board
      )
    }));

    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleCreateBoard = (name: string) => {
    const newBoard: MoodBoard = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      items: []
    };
    setState(prev => ({ ...prev, moodBoards: [...prev.moodBoards, newBoard] }));
  };

  const handleDeleteBoard = (boardId: string) => {
    setState(prev => ({
      ...prev,
      moodBoards: prev.moodBoards.filter(b => b.id !== boardId)
    }));
  };

  const handleDeleteItem = (boardId: string, itemId: string) => {
    setState(prev => ({
      ...prev,
      moodBoards: prev.moodBoards.map(board => 
        board.id === boardId 
          ? { ...board, items: board.items.filter(i => i.id !== itemId) }
          : board
      )
    }));
  };

  return (
    <div className="min-h-screen bg-brand-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-brand-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-200">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-950 tracking-tight">Aura</h1>
              <p className="text-[10px] text-brand-500 uppercase tracking-widest font-bold">AI Interior Design</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <button 
                onClick={() => setState(prev => ({ ...prev, activeTab: 'design' }))}
                className={cn(
                  "text-sm font-medium transition-all pb-1",
                  state.activeTab === 'design' ? "text-brand-600 border-b-2 border-brand-600" : "text-brand-400 hover:text-brand-600"
                )}
              >
                Design
              </button>
              <button 
                onClick={() => setState(prev => ({ ...prev, activeTab: 'moodboard' }))}
                className={cn(
                  "text-sm font-medium transition-all pb-1",
                  state.activeTab === 'moodboard' ? "text-brand-600 border-b-2 border-brand-600" : "text-brand-400 hover:text-brand-600"
                )}
              >
                Mood Board
              </button>
              <a href="#" className="text-sm font-medium text-brand-400 hover:text-brand-600 transition-colors pb-1">Shop</a>
            </nav>
            <button className="bg-brand-950 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-brand-800 transition-all shadow-md">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-12">
        <AnimatePresence mode="wait">
          {state.activeTab === 'design' ? (
            <motion.div 
              key="design"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid lg:grid-cols-12 gap-12"
            >
              {/* Left Column: Visualization */}
              <div className="lg:col-span-7 space-y-8">
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-medium text-brand-950">Your Space</h2>
                    <div className="flex items-center gap-4">
                      {state.generatedImage && (
                        <button 
                          onClick={() => setState(prev => ({ ...prev, show3D: !prev.show3D }))}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                            state.show3D ? "bg-brand-600 text-white shadow-md" : "bg-white text-brand-600 border border-brand-100 hover:bg-brand-50"
                          )}
                        >
                          <Box size={16} />
                          {state.show3D ? 'Exit 3D' : 'View in 3D'}
                        </button>
                      )}
                      {state.originalImage && (
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors"
                        >
                          <RefreshCcw size={16} />
                          Change Photo
                        </button>
                      )}
                    </div>
                  </div>

                  {!state.originalImage ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video bg-white border-2 border-dashed border-brand-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={28} />
                      </div>
                      <h3 className="text-lg font-medium text-brand-900">Upload a photo of your room</h3>
                      <p className="text-sm text-brand-500 mt-1">PNG, JPG up to 10MB</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-8">
                      <div className="relative group">
                        {state.show3D && state.generatedImage ? (
                          <Room3D image={state.generatedImage} />
                        ) : state.generatedImage ? (
                          <div className="relative">
                            <CompareSlider before={state.originalImage} after={state.generatedImage} />
                            <div className="absolute top-4 right-4 flex gap-2">
                              <button 
                                onClick={() => handleSaveToMoodBoard(state.moodBoards[0].id)}
                                disabled={isSaving}
                                className={cn(
                                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg",
                                  isSaving ? "bg-green-500 text-white" : "bg-white/90 backdrop-blur-md text-brand-900 hover:bg-white"
                                )}
                              >
                                {isSaving ? <Check size={16} /> : <Heart size={16} className="text-red-500" />}
                                {isSaving ? 'Saved' : 'Save to Mood Board'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                            <img 
                              src={state.originalImage} 
                              alt="Original" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {state.isGenerating && (
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                  className="mb-4"
                                >
                                  <Sparkles size={48} />
                                </motion.div>
                                <h3 className="text-xl font-medium">Reimagining your space...</h3>
                                <p className="text-sm text-white/70 mt-2">Crafting the perfect {state.currentStyle?.name} aesthetic</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Style Selection */}
                      <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100">
                        <div className="flex items-center gap-2 mb-6">
                          <Sparkles size={18} className="text-brand-600" />
                          <h3 className="text-lg font-semibold text-brand-900">Choose a Style</h3>
                        </div>
                        <StyleCarousel 
                          styles={STYLES} 
                          selectedStyle={state.currentStyle} 
                          onSelect={generateDesign}
                          disabled={state.isGenerating}
                        />
                        {state.currentStyle && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 pt-6 border-t border-brand-100"
                          >
                            <h4 className="text-sm font-bold text-brand-900 mb-1">{state.currentStyle.name}</h4>
                            <p className="text-sm text-brand-500 leading-relaxed">{state.currentStyle.description}</p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* Right Column: Consultant Chat */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="sticky top-28 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-medium text-brand-950">Ask the Designer</h2>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500">Online</span>
                    </div>
                  </div>

                  <ChatInterface 
                    messages={state.chatHistory} 
                    onSendMessage={handleSendMessage} 
                    isTyping={isChatTyping}
                    disabled={state.isGenerating}
                  />

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-brand-100 shadow-sm flex items-center gap-3 group cursor-pointer hover:border-brand-300 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-900">Shop Items</p>
                        <p className="text-[10px] text-brand-500">Find similar furniture</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-brand-100 shadow-sm flex items-center gap-3 group cursor-pointer hover:border-brand-300 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all">
                        <Info size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-900">Style Guide</p>
                        <p className="text-[10px] text-brand-500">Learn design principles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="moodboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-10">
                <h2 className="text-4xl font-medium text-brand-950">Mood Boards</h2>
                <p className="text-brand-500 mt-2">Organize your favorite designs and inspiration in one place.</p>
              </div>
              
              <MoodBoardView 
                moodBoards={state.moodBoards}
                onCreateBoard={handleCreateBoard}
                onDeleteBoard={handleDeleteBoard}
                onDeleteItem={handleDeleteItem}
                onSaveItem={() => {}} // Handled via the design view for now
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="max-w-6xl mx-auto px-6 mt-20 pt-10 border-t border-brand-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 opacity-50">
          <Sparkles size={16} />
          <p className="text-xs font-medium tracking-wider uppercase">Aura Interior Design Consultant © 2026</p>
        </div>
        <div className="flex gap-8">
          <a href="#" className="text-xs font-medium text-brand-400 hover:text-brand-600">Privacy Policy</a>
          <a href="#" className="text-xs font-medium text-brand-400 hover:text-brand-600">Terms of Service</a>
          <a href="#" className="text-xs font-medium text-brand-400 hover:text-brand-600">Contact Us</a>
        </div>
      </footer>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />
    </div>
  );
}
