export interface Style {
  id: string;
  name: string;
  description: string;
  prompt: string;
  image: string; // Preview image for the style
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface MoodBoardItem {
  id: string;
  image: string;
  title: string;
  styleName?: string;
  createdAt: string;
}

export interface MoodBoard {
  id: string;
  name: string;
  items: MoodBoardItem[];
}

export interface DesignState {
  originalImage: string | null;
  generatedImage: string | null;
  currentStyle: Style | null;
  isGenerating: boolean;
  chatHistory: ChatMessage[];
  moodBoards: MoodBoard[];
  activeTab: 'design' | 'moodboard';
  show3D: boolean;
}
