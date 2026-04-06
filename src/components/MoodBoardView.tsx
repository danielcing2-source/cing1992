import React, { useState } from 'react';
import { MoodBoard, MoodBoardItem } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Folder, Image as ImageIcon, Calendar, ChevronRight, LayoutGrid, List } from 'lucide-react';

interface MoodBoardViewProps {
  moodBoards: MoodBoard[];
  onSaveItem: (boardId: string, item: Omit<MoodBoardItem, 'id' | 'createdAt'>) => void;
  onDeleteBoard: (boardId: string) => void;
  onCreateBoard: (name: string) => void;
  onDeleteItem: (boardId: string, itemId: string) => void;
}

export const MoodBoardView: React.FC<MoodBoardViewProps> = ({ 
  moodBoards, 
  onSaveItem, 
  onDeleteBoard, 
  onCreateBoard,
  onDeleteItem 
}) => {
  const [activeBoardId, setActiveBoardId] = useState<string | null>(moodBoards[0]?.id || null);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const activeBoard = moodBoards.find(b => b.id === activeBoardId);

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      onCreateBoard(newBoardName);
      setNewBoardName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 min-h-[600px]">
      {/* Sidebar: Board List */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-brand-900 uppercase tracking-widest">My Boards</h3>
          <button 
            onClick={() => setIsCreating(true)}
            className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-800 transition-all shadow-md"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {moodBoards.map((board) => (
            <button
              key={board.id}
              onClick={() => setActiveBoardId(board.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group",
                activeBoardId === board.id 
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-200" 
                  : "bg-white text-brand-500 hover:bg-brand-100"
              )}
            >
              <div className="flex items-center gap-3">
                <Folder size={18} className={activeBoardId === board.id ? "text-white" : "text-brand-400"} />
                <span className="text-sm font-medium truncate max-w-[120px]">{board.name}</span>
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                activeBoardId === board.id ? "bg-white/20 text-white" : "bg-brand-100 text-brand-600"
              )}>
                {board.items.length}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {isCreating && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleCreateBoard}
              className="p-4 bg-white rounded-2xl border border-brand-200 shadow-sm space-y-3"
            >
              <input 
                autoFocus
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Board name..."
                className="w-full bg-brand-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 transition-all outline-none"
              />
              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="flex-1 bg-brand-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-brand-800"
                >
                  Create
                </button>
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 bg-brand-100 text-brand-600 text-xs font-bold py-2 rounded-xl hover:bg-brand-200"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content: Board Items */}
      <div className="lg:col-span-9 space-y-6">
        {activeBoard ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-medium text-brand-950">{activeBoard.name}</h2>
                <p className="text-xs text-brand-500 mt-1">
                  {activeBoard.items.length} items saved in this board
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-white rounded-xl border border-brand-200 p-1">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      viewMode === 'grid' ? "bg-brand-100 text-brand-600" : "text-brand-400 hover:text-brand-600"
                    )}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      viewMode === 'list' ? "bg-brand-100 text-brand-600" : "text-brand-400 hover:text-brand-600"
                    )}
                  >
                    <List size={16} />
                  </button>
                </div>
                <button 
                  onClick={() => onDeleteBoard(activeBoard.id)}
                  className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                  title="Delete Board"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {activeBoard.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-brand-100 border-dashed">
                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-300 mb-4">
                  <ImageIcon size={32} />
                </div>
                <h3 className="text-brand-900 font-medium">This board is empty</h3>
                <p className="text-sm text-brand-500 mt-1">Save designs from the makeover tool to see them here.</p>
              </div>
            ) : (
              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
              )}>
                {activeBoard.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "group relative bg-white rounded-2xl overflow-hidden border border-brand-100 shadow-sm hover:shadow-md transition-all",
                      viewMode === 'list' && "flex gap-6 p-4"
                    )}
                  >
                    <div className={cn(
                      "relative overflow-hidden",
                      viewMode === 'grid' ? "aspect-[4/3]" : "w-40 h-32 rounded-xl"
                    )}>
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => onDeleteItem(activeBoard.id, item.id)}
                          className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className={cn(
                      "p-4",
                      viewMode === 'list' && "flex-1 p-0 flex flex-col justify-center"
                    )}>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-brand-950 truncate">{item.title}</h4>
                        <span className="text-[10px] font-bold text-brand-400 flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500 px-2 py-0.5 bg-brand-50 rounded-full">
                          {item.styleName || 'Custom'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-brand-100 border-dashed">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-300 mb-4">
              <Folder size={32} />
            </div>
            <h3 className="text-brand-900 font-medium">No boards found</h3>
            <p className="text-sm text-brand-500 mt-1">Create your first mood board to start organizing your inspiration.</p>
          </div>
        )}
      </div>
    </div>
  );
};
