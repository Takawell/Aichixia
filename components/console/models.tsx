import { useState } from 'react';
import { FiCopy, FiCheck, FiLock, FiZap, FiCpu, FiTrendingUp, FiDollarSign, FiSearch, FiStar, FiInfo, FiImage, FiX, FiExternalLink } from 'react-icons/fi';
import { SiOpenai, SiGooglegemini, SiAnthropic, SiMeta, SiAlibabacloud, SiDigikeyelectronics, SiAirbrake, SiMaze, SiXiaomi, SiFlux, SiImagedotsc, SiSecurityscorecard, SiLapce } from 'react-icons/si';
import { GiSpermWhale, GiPowerLightning, GiClover, GiFire } from 'react-icons/gi';
import { TbSquareLetterZ, TbLetterM } from 'react-icons/tb';
import { FaXTwitter } from 'react-icons/fa6';
import { HiSpeakerWave } from 'react-icons/hi2';

type UserSettings = {
  plan: 'free' | 'pro' | 'enterprise';
  plan_expires_at: string | null;
  is_admin: boolean;
};

type ModelProps = {
  settings: UserSettings | null;
  onCopy: (text: string, id: string) => void;
  copiedKey: string | null;
};

const AVAILABLE_MODELS = [
  {
    id: 'aichixia-thinking',
    name: 'Aichixia 411B',
    icon: SiAirbrake,
    color: 'from-blue-600 via-blue-800 to-slate-900',
    category: 'Text Generation',
    requiresPlan: 'pro',
    description: 'Ultra-large flagship model with 411B parameters',
    speed: 5,
    quality: 5,
    contextWindow: '128K tokens',
    pricing: 'Premium',
    features: ['Deep reasoning', 'Chain-of-thought', 'Problem solving', 'Ultra-large'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'deepseek-v3.2',
    name: 'DeepSeek V3.2',
    icon: GiSpermWhale,
    color: 'from-cyan-600 to-blue-600',
    category: 'Text Generation',
    requiresPlan: 'pro',
    description: 'Deep reasoning and code generation',
    speed: 3,
    quality: 5,
    contextWindow: '128K tokens',
    pricing: 'Premium',
    features: ['Advanced reasoning', 'Superior coding', 'Complex tasks'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'deepseek-v3.1',
    name: 'DeepSeek V3.1',
    icon: GiSpermWhale,
    color: 'from-cyan-600 to-teal-600',
    category: 'Text Generation',
    description: 'Previous generation DeepSeek model',
    speed: 3,
    quality: 5,
    contextWindow: '128K tokens',
    pricing: 'Standard',
    features: ['Multi-purpose', 'Reliable', 'Cost-effective'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    icon: SiOpenai,
    color: 'from-emerald-600 to-green-600',
    category: 'Text Generation',
    description: 'Balanced performance for general tasks',
    speed: 3,
    quality: 4,
    contextWindow: '400K tokens',
    pricing: 'Budget',
    features: ['Ultra-fast', 'Low latency', 'Simple tasks'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'claude-opus-4.5',
    name: 'Claude Opus 4.5',
    icon: SiAnthropic,
    color: 'from-orange-600 to-amber-700',
    category: 'Text Generation',
    requiresPlan: 'pro',
    description: "World's #1 AI model - Ultimate intelligence for complex tasks",
    speed: 3,
    quality: 5,
    contextWindow: '200K tokens',
    pricing: 'Premium',
    features: ['Long context', 'Creative writing', 'Analysis'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash',
    icon: SiGooglegemini,
    color: 'from-indigo-600 to-purple-600',
    category: 'Text Generation',
    description: 'Multimodal understanding and accuracy',
    speed: 4,
    quality: 5,
    contextWindow: '1M tokens',
    pricing: 'Budget',
    features: ['Real-time', 'Multimodal', 'Fast inference'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'kimi-k2',
    name: 'Kimi K2',
    icon: SiDigikeyelectronics,
    color: 'from-blue-600 to-cyan-600',
    category: 'Text Generation',
    requiresPlan: 'pro',
    description: 'Superior tool calling and complex reasoning',
    speed: 4,
    quality: 5,
    contextWindow: '256K tokens',
    pricing: 'Premium',
    features: ['Chinese expertise', 'Long context', 'Cultural nuance'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'glm-4.7',
    name: 'GLM 4.7',
    icon: TbSquareLetterZ,
    color: 'from-blue-700 to-indigo-900',
    category: 'Text Generation',
    requiresPlan: 'pro',
    description: 'Multilingual excellence with strong reasoning',
    speed: 3,
    quality: 4,
    contextWindow: '200K tokens',
    pricing: 'Standard',
    features: ['Bilingual', 'Efficient', 'General purpose'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'mistral-3.1',
    name: 'Mistral 3.1',
    icon: TbLetterM,
    color: 'from-orange-600 to-amber-600',
    category: 'Text Generation',
    description: 'Fast inference with European focus',
    speed: 4,
    quality: 4,
    contextWindow: '128K tokens',
    pricing: 'Standard',
    features: ['Strong reasoning', 'Multilingual', 'Open weights'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'qwen3-235b',
    name: 'Qwen3 235B',
    icon: SiAlibabacloud,
    color: 'from-purple-500 to-pink-500',
    category: 'Text Generation',
    requiresPlan: 'pro',
    description: 'Large multilingual model with strong reasoning',
    speed: 4,
    quality: 5,
    contextWindow: '256K tokens',
    pricing: 'Premium',
    features: ['Huge scale', 'Multilingual', 'Deep reasoning'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'qwen3-coder-480b',
    name: 'Qwen3 Coder 480B',
    icon: SiAlibabacloud,
    color: 'from-purple-600 to-fuchsia-600',
    category: 'Text Generation',
    description: 'Specialized in coding and Asian languages',
    speed: 3,
    quality: 5,
    contextWindow: '256K tokens',
    pricing: 'Premium',
    features: ['Code generation', 'Debugging', 'Architecture'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'minimax-m2.1',
    name: 'MiniMax M2.1',
    icon: SiMaze,
    color: 'from-cyan-600 to-blue-600',
    category: 'Text Generation',
    requiresPlan: 'pro',
    description: 'Multilingual coding specialist with agent workflows',
    speed: 4,
    quality: 5,
    contextWindow: '200K tokens',
    pricing: 'Premium',
    features: ['Creative', 'Chinese focus', 'Analytical'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    icon: SiMeta,
    color: 'from-blue-600 to-indigo-700',
    category: 'Text Generation',
    description: 'Efficient open-source powerhouse',
    speed: 4,
    quality: 4,
    contextWindow: '128K tokens',
    pricing: 'Standard',
    features: ['Open source', 'Versatile', 'Community-driven'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'gpt-oss-120b',
    name: 'GPT-OSS 120B',
    icon: SiOpenai,
    color: 'from-pink-600 to-rose-600',
    category: 'Text Generation',
    description: 'Large open-source with browser search',
    speed: 3,
    quality: 4,
    contextWindow: '131K tokens',
    pricing: 'Budget',
    features: ['Open source', 'Transparent', 'Community'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'mimo-v2-flash',
    name: 'MiMo V2 Flash',
    icon: SiXiaomi,
    color: 'from-blue-600 to-purple-600',
    category: 'Text Generation',
    description: 'Efficient 309B MoE model for reasoning and coding tasks',
    speed: 5,
    quality: 5,
    contextWindow: '256K tokens',
    pricing: 'Budget',
    features: ['Edge computing', 'Low resource', 'Real-time'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'groq-compound',
    name: 'Groq Compound',
    icon: GiPowerLightning,
    color: 'from-orange-600 to-red-600',
    category: 'Text Generation',
    description: 'Multi-model agentic system with tools',
    speed: 4,
    quality: 5,
    contextWindow: '131K tokens',
    pricing: 'Standard',
    features: ['Hardware accel', 'Ultra-fast', 'Efficient'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'cohere-command-a',
    name: 'Cohere Command A',
    icon: GiClover,
    color: 'from-emerald-600 to-teal-600',
    category: 'Text Generation',
    description: 'Enterprise-grade with excellent tool use',
    speed: 3,
    quality: 5,
    contextWindow: '256K tokens',
    pricing: 'Standard',
    features: ['Enterprise', 'RAG optimized', 'Business focus'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'grok-3',
    name: 'Grok 3',
    icon: FaXTwitter,
    color: 'from-slate-600 to-zinc-800',
    category: 'Text Generation',
    description: "xAI's flagship model with real-time data",
    speed: 4,
    quality: 5,
    contextWindow: '1M tokens',
    pricing: 'Premium',
    features: ['Real-time data', 'Web search', 'Current events'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'grok-4-fast',
    name: 'Grok 4 Fast',
    icon: FaXTwitter,
    color: 'from-zinc-700 to-slate-900',
    category: 'Text Generation',
    requiresPlan: 'pro',
    description: "xAI's fastest Grok 4 model with ultra-low latency",
    speed: 5,
    quality: 5,
    contextWindow: '2M tokens',
    pricing: 'Premium',
    features: ['Ultra-fast', 'Real-time data', 'Low latency'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    icon: SiOpenai,
    color: 'from-green-500 to-emerald-600',
    category: 'Text Generation',
    limited: true,
    description: "OpenAI's latest GPT-5.2 with enhanced reasoning",
    speed: 4,
    quality: 5,
    contextWindow: '400K tokens',
    pricing: 'Standard',
    features: ['Enhanced reasoning', 'Multimodal', 'Latest generation'],
    endpoint: 'https://api.aichixia.xyz/v1/chat/completions',
  },
  {
    id: 'flux-2',
    name: 'Flux 2',
    icon: SiFlux,
    color: 'from-purple-500 to-pink-500',
    category: 'Image Generation',
    description: 'Photorealistic image generation',
    speed: 4,
    quality: 5,
    contextWindow: 'N/A',
    pricing: 'Standard',
    features: ['Photorealistic', 'High quality', 'Fast generation'],
    endpoint: 'https://api.aichixia.xyz/models/flux',
  },
  {
    id: 'lucid-origin',
    name: 'Lucid Origin',
    icon: SiImagedotsc,
    color: 'from-red-500 to-orange-500',
    category: 'Image Generation',
    description: 'Creative image synthesis',
    speed: 4,
    quality: 5,
    contextWindow: 'N/A',
    pricing: 'Standard',
    features: ['Artistic', 'Creative', 'Unique style'],
    endpoint: 'https://api.aichixia.xyz/models/lucid',
  },
  {
    id: 'phoenix-1.0',
    name: 'Phoenix 1.0',
    icon: GiFire,
    color: 'from-red-500 to-orange-500',
    category: 'Image Generation',
    description: 'Fast image generation',
    speed: 4,
    quality: 4,
    contextWindow: 'N/A',
    pricing: 'Budget',
    features: ['Quick', 'Artistic', 'Efficient'],
    endpoint: 'https://api.aichixia.xyz/models/phoenix',
  },
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    icon: SiGooglegemini,
    color: 'from-yellow-400 to-orange-400',
    category: 'Image Generation',
    description: 'Compact image model',
    speed: 4,
    quality: 4,
    contextWindow: 'N/A',
    pricing: 'Budget',
    features: ['Lightweight', 'Fast', 'Compact'],
    endpoint: 'https://api.aichixia.xyz/models/nano',
  },
  {
    id: 'starling-tts',
    name: 'Starling TTS',
    icon: SiSecurityscorecard,
    color: 'from-violet-500 to-purple-500',
    category: 'Text-to-Speech',
    description: 'Natural voice synthesis with emotional control',
    speed: 4,
    quality: 4,
    contextWindow: '2K chars',
    pricing: 'Standard',
    features: ['Emotional', 'Natural', 'Multi-language'],
    endpoint: 'https://api.aichixia.xyz/models/starling',
  },
  {
    id: 'lindsay-tts',
    name: 'Lindsay TTS',
    icon: SiLapce,
    color: 'from-rose-500 to-pink-500',
    category: 'Text-to-Speech',
    description: 'Enhanced voice quality with advanced prosody',
    speed: 4,
    quality: 5,
    contextWindow: '2K chars',
    pricing: 'Premium',
    features: ['Premium', 'Prosody', 'Enhanced'],
    endpoint: 'https://api.aichixia.xyz/models/lindsay',
  },
];

const SpeedIndicator = ({ level }: { level: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`w-1 h-2.5 sm:h-3 rounded-full transition-all ${i < level ? 'bg-sky-500 dark:bg-sky-400' : 'bg-zinc-300 dark:bg-zinc-700'}`}
        />
      ))}
    </div>
  );
};

const QualityIndicator = ({ level }: { level: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <FiStar
          key={i}
          className={`${i < level ? 'text-sky-500 dark:text-sky-400 fill-sky-500 dark:fill-sky-400' : 'text-zinc-300 dark:text-zinc-700'}`}
          size={8}
        />
      ))}
    </div>
  );
};

const PRICING_CONFIG = {
  Premium: { color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' },
  Standard: { color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800' },
  Budget: { color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
};

const CATEGORY_ICONS: Record<string, any> = {
  'Text Generation': FiCpu,
  'Image Generation': FiImage,
  'Text-to-Speech': HiSpeakerWave,
};

export default function Models({ settings, onCopy, copiedKey }: ModelProps) {
  const [modelSearch, setModelSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModal, setActiveModal] = useState<any>(null);

  const isModelLocked = (model: any) => {
    if (!model.requiresPlan) return false;
    if (!settings) return true;
    if (settings.plan === 'free') return true;
    if (model.requiresPlan === 'enterprise' && settings.plan === 'pro') return true;
    return false;
  };

  const categories = ['All', ...Array.from(new Set(AVAILABLE_MODELS.map(m => m.category)))];
  const filteredModels = AVAILABLE_MODELS.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      model.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
      model.description.toLowerCase().includes(modelSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || model.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedModels = filteredModels.reduce((acc, model) => {
    if (!acc[model.category]) acc[model.category] = [];
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_MODELS>);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">Available Models</h3>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {filteredModels.length} models • {filteredModels.filter(m => !isModelLocked(m)).length} accessible
              </p>
            </div>
            <div className="w-full sm:w-auto relative">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs sm:text-sm" />
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                placeholder="Search models..."
                className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs sm:text-sm text-zinc-900 dark:text-white outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-semibold text-[10px] sm:text-xs whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-400/30'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {Icon && <Icon size={12} />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {Object.keys(groupedModels).length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FiSearch className="text-xl sm:text-3xl text-zinc-400" />
              </div>
              <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-medium">No models found</p>
              <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 mt-1">Try a different search term</p>
            </div>
          ) : (
            Object.entries(groupedModels).map(([category, models]) => {
              const CategoryIcon = CATEGORY_ICONS[category];
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    {CategoryIcon && (
                      <div className="p-1.5 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg shadow-lg">
                        <CategoryIcon className="text-white text-xs" />
                      </div>
                    )}
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">{category}</h4>
                    <div className="flex-1 h-px bg-gradient-to-r from-zinc-200 dark:from-zinc-700 to-transparent" />
                    <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">{models.length} models</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                    {models.map((model) => {
                      const locked = isModelLocked(model);
                      const Icon = model.icon;
                      const pricingConfig = PRICING_CONFIG[model.pricing as keyof typeof PRICING_CONFIG];
                      const displayValue = model.category === 'Text Generation' ? model.id : model.endpoint;

                      return (
                        <div
                          key={model.id}
                          className={`group relative rounded-lg sm:rounded-xl transition-all duration-300 ${
                            locked
                              ? 'bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800'
                              : 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-xl hover:shadow-sky-400/10 dark:hover:shadow-sky-400/20 hover:-translate-y-0.5'
                          }`}
                        >
                          {locked && (
                            <div className="absolute inset-0 bg-zinc-900/5 dark:bg-zinc-900/20 rounded-lg sm:rounded-xl backdrop-blur-[2px] z-10 flex items-center justify-center">
                              <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md sm:rounded-lg border border-orange-500 shadow-lg">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <FiLock className="text-orange-500 text-xs sm:text-sm" />
                                  <span className="text-[10px] sm:text-xs font-bold text-zinc-900 dark:text-white">
                                    {model.requiresPlan === 'enterprise' ? 'Enterprise' : 'Pro'} Required
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="p-3 sm:p-4">
                            <div className="flex items-start gap-2 sm:gap-2.5 mb-2.5 sm:mb-3">
                              <div className={`p-1.5 sm:p-2 bg-gradient-to-br ${model.color} rounded-lg shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                <Icon className="text-white text-sm sm:text-base" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                                  <h5 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">{model.name}</h5>
                                  {locked && <FiLock className="text-orange-400 text-[10px] flex-shrink-0" />}
                                  {(model as any).limited && !locked && (
                                    <span className="text-[8px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-full font-bold flex-shrink-0">
                                      LIMITED
                                    </span>
                                  )}
                                </div>
                                <code className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded block truncate">
                                  {displayValue}
                                </code>
                              </div>
                              <button
                                onClick={() => onCopy(displayValue, model.id)}
                                disabled={locked}
                                className="p-1 sm:p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {copiedKey === model.id ? (
                                  <FiCheck className="text-green-500 text-xs sm:text-sm" />
                                ) : (
                                  <FiCopy className="text-zinc-400 text-xs sm:text-sm" />
                                )}
                              </button>
                            </div>

                            <p className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 mb-2.5 sm:mb-3 line-clamp-2 leading-relaxed">
                              {model.description}
                            </p>

                            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
                              <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-md sm:rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <FiZap className="text-[10px] sm:text-xs text-sky-500 dark:text-sky-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[8px] sm:text-[9px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-semibold mb-0.5">Speed</p>
                                  <SpeedIndicator level={model.speed} />
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-md sm:rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <FiTrendingUp className="text-[10px] sm:text-xs text-purple-500 dark:text-purple-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[8px] sm:text-[9px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-semibold mb-0.5">Quality</p>
                                  <QualityIndicator level={model.quality} />
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-2.5 sm:py-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-md sm:rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <FiCpu className="text-[10px] sm:text-xs text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[8px] sm:text-[9px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-semibold mb-0.5">Context</p>
                                  <p className="text-[10px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-200 truncate">
                                    {model.contextWindow}
                                  </p>
                                </div>
                              </div>

                              <div className={`flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-md sm:rounded-lg border ${pricingConfig.color}`}>
                                <FiDollarSign className="text-[10px] sm:text-xs flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[8px] sm:text-[9px] opacity-70 uppercase tracking-wide font-semibold mb-0.5">Pricing</p>
                                  <p className="text-[10px] sm:text-xs font-bold truncate">
                                    {model.pricing}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {model.features.map((feature, idx) => (
                                <span
                                  key={idx}
                                  className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 rounded-full border border-sky-200 dark:border-sky-800 font-medium"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 mt-0">
                            <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-mono truncate mr-2">
                              {model.category === 'Text Generation' ? 'OpenAI-compatible' : model.endpoint.replace('https://api.aichixia.xyz', '')}
                            </span>
                            <button
                              onClick={() => setActiveModal(model)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-150 flex-shrink-0"
                            >
                              <FiInfo className="w-3 h-3" />
                              Details
                            </button>
                          </div>


                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full sm:max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 bg-gradient-to-br ${activeModal.color} rounded-xl shadow-lg flex-shrink-0`}>
                    <activeModal.icon className="text-white text-base sm:text-lg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">{activeModal.name}</h3>
                      {(activeModal as any).limited && (
                        <span className="text-[8px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-full font-bold">
                          LIMITED
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{activeModal.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-150"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5">
                {activeModal.description}
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-[9px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-500 mb-1">Context Window</p>
                  <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">{activeModal.contextWindow}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-[9px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-500 mb-1">Pricing Tier</p>
                  <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">{activeModal.pricing}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-[9px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">Speed</p>
                  <SpeedIndicator level={activeModal.speed} />
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-[9px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">Quality</p>
                  <QualityIndicator level={activeModal.quality} />
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[9px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-500 mb-2">Capabilities</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeModal.features.map((feature: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-1 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 rounded-lg border border-sky-200 dark:border-sky-800 font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <p className="text-[9px] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-500 mb-2">Endpoint</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[10px] sm:text-xs font-mono text-zinc-700 dark:text-zinc-300 break-all leading-relaxed">
                    {activeModal.category === 'Text Generation' ? (
                      <>
                        <span className="text-zinc-400 dark:text-zinc-500">Base URL: </span>https://api.aichixia.xyz/v1{'
'}
                        <span className="text-zinc-400 dark:text-zinc-500">Model ID: </span>{activeModal.id}
                      </>
                    ) : activeModal.endpoint}
                  </code>
                  <button
                    onClick={() => onCopy(activeModal.category === 'Text Generation' ? activeModal.id : activeModal.endpoint, activeModal.id + '-modal')}
                    className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all flex-shrink-0"
                  >
                    {copiedKey === activeModal.id + '-modal' ? <FiCheck className="w-3.5 h-3.5 text-emerald-500" /> : <FiCopy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
