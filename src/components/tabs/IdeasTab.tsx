import React, { useState, useCallback } from 'react';
import { CelebrationEvent, PersonalizedIdea, BrainstormIdea } from '../../types/planner';
import { generateSpeechWithAI, brainstormIdeasWithAI } from '../../services/aiPlannerService';
import { getErrorMessage } from '../../utils/plannerCalculations';
import {
  Sparkles,
  Lightbulb,
  Mic,
  Copy,
  Check,
  Plus,
  Loader2,
  Bookmark,
  BookmarkCheck,
  Palette,
  Wine,
  HelpCircle
} from 'lucide-react';

interface IdeasTabProps {
  event: CelebrationEvent;
  onUpdateEvent: (updated: CelebrationEvent) => void;
}

export const IdeasTab: React.FC<IdeasTabProps> = ({ event, onUpdateEvent }) => {
  // Brainstorm state
  const [brainstormTopic, setBrainstormTopic] = useState('Signature Cocktails & Mocktails');
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [brainstormResults, setBrainstormResults] = useState<BrainstormIdea[]>([]);

  // Speech writer state
  const [speakerRole, setSpeakerRole] = useState('Best Friend / Host');
  const [honoreeName, setHonoreeName] = useState('');
  const [relationship, setRelationship] = useState('Close companion of 10 years');
  const [tone, setTone] = useState('Warm, heartfelt, with tasteful humor');
  const [stories, setStories] = useState('How we met during college hiking trip, their unfailing kindness, and celebration of new beginnings.');
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [speechResult, setSpeechResult] = useState<{
    title: string;
    estimatedDuration: string;
    speechText: string;
    deliveryTips: string[];
  } | null>(null);
  const [copiedSpeech, setCopiedSpeech] = useState(false);

  const brainstormTopics = [
    'Signature Cocktails & Mocktails',
    'Interactive Guest Activities & Icebreakers',
    'Favors & Handcrafted Keepsakes',
    'Atmospheric Lighting & Floral Backdrops',
    'Late-Night Food & Dessert Stations',
    'Weather & Rain Contingency Hacks',
  ];

  const handleToggleSaveIdea = useCallback((id: string) => {
    const updated = {
      ...event,
      ideas: event.ideas.map((i) =>
        i.id === id ? { ...i, saved: !i.saved } : i
      ),
    };
    onUpdateEvent(updated);
  }, [event, onUpdateEvent]);

  const handleAddBrainstormIdeaToSaved = useCallback((item: BrainstormIdea) => {
    const newIdea: PersonalizedIdea = {
      id: `i-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: brainstormTopic,
      title: item.title,
      description: `${item.description} (Pro-Tip: ${item.proTip})`,
      estimatedCost: item.costLevel || '$$',
      diyFriendly: true,
      saved: true,
    };

    const updated = {
      ...event,
      ideas: [newIdea, ...event.ideas],
    };
    onUpdateEvent(updated);
  }, [brainstormTopic, event, onUpdateEvent]);

  const handleRunBrainstorm = useCallback(async (topicToUse?: string) => {
    const topic = topicToUse || brainstormTopic;
    setIsBrainstorming(true);
    try {
      const data = await brainstormIdeasWithAI({
        eventType: event.eventType,
        topic,
        vibe: event.vibe,
        guestCount: event.guestCount,
      });
      setBrainstormResults(data.ideas || []);
    } catch (err: unknown) {
      alert(`Could not brainstorm ideas: ${getErrorMessage(err)}`);
    } finally {
      setIsBrainstorming(false);
    }
  }, [brainstormTopic, event.eventType, event.vibe, event.guestCount]);

  const handleGenerateSpeech = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingSpeech(true);
    setSpeechResult(null);
    setCopiedSpeech(false);

    try {
      const data = await generateSpeechWithAI({
        speakerRole,
        honoreeName: honoreeName || event.title,
        relationship,
        tone,
        memorableStories: stories,
        eventType: event.eventType,
      });
      setSpeechResult(data);
    } catch (err: unknown) {
      alert(`Could not generate speech: ${getErrorMessage(err)}`);
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const handleCopySpeech = useCallback(() => {
    if (!speechResult) return;
    navigator.clipboard.writeText(speechResult.speechText);
    setCopiedSpeech(true);
    setTimeout(() => setCopiedSpeech(false), 2500);
  }, [speechResult]);

  return (
    <div className="space-y-8">
      {/* SECTION 1: Curated Bespoke Ideas for this Celebration */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Personalized Creative Concepts
            </h2>
            <p className="text-xs text-stone-600">
              High-impact touches tailored to your aesthetic, guest count, and celebration format.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {event.ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                    {idea.category}
                  </span>
                  <button
                    onClick={() => handleToggleSaveIdea(idea.id)}
                    className="text-stone-400 hover:text-stone-900 p-1"
                    title={idea.saved ? 'Saved to vision board' : 'Save idea'}
                  >
                    {idea.saved ? (
                      <BookmarkCheck className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <h3 className="text-base font-serif font-bold text-stone-900">
                  {idea.title}
                </h3>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                  {idea.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-stone-100 text-xs text-stone-500 font-medium">
                <span className="font-mono tabular-nums text-stone-900">
                  Cost: {idea.estimatedCost}
                </span>
                <span className="text-stone-600">
                  {idea.diyFriendly ? 'Handcrafted / DIY Friendly' : 'Requires Vendor Execution'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Interactive AI Brainstorm Studio */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="text-lg font-serif font-bold text-white">
                GenAI Concept Brainstorm Studio
              </h3>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Select any celebration facet to generate 5 fresh creative concepts with practical execution pro-tips.
            </p>
          </div>

          <button
            onClick={() => handleRunBrainstorm()}
            disabled={isBrainstorming}
            className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-300 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            {isBrainstorming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Brainstorm This Topic</span>
          </button>
        </div>

        {/* Topic Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {brainstormTopics.map((topic) => {
            const isSelected = brainstormTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => {
                  setBrainstormTopic(topic);
                  handleRunBrainstorm(topic);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border whitespace-nowrap ${
                  isSelected
                    ? 'bg-stone-100 text-stone-900 border-stone-100 font-semibold shadow-xs'
                    : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700 hover:text-white'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {isBrainstorming && (
          <div className="py-12 flex flex-col items-center justify-center text-stone-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
            <span className="text-xs">Generating bespoke celebration ideas for "{brainstormTopic}"...</span>
          </div>
        )}

        {/* Results Grid */}
        {!isBrainstorming && brainstormResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {brainstormResults.map((item, idx) => (
              <div
                key={idx}
                className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-amber-300 font-mono mb-1">
                    <span>Idea 0{idx + 1}</span>
                    <span>{item.costLevel}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                  {item.proTip && (
                    <p className="text-[11px] text-amber-200/90 mt-2 bg-stone-900/60 p-2 rounded-lg border border-stone-700/50">
                      <span className="font-semibold">Pro-Tip: </span>{item.proTip}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleAddBrainstormIdeaToSaved(item)}
                  className="w-full py-1.5 px-2 text-[11px] font-semibold text-stone-200 hover:text-white bg-stone-700/70 hover:bg-stone-700 rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Pin to Event Plan</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: Speech & Toast Speechwriter Studio */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
        <div className="pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-stone-900" />
            <h3 className="text-lg font-serif font-bold text-stone-900">
              Celebration Toast & Speech Assistant
            </h3>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Craft authentic, moving, and well-paced toasts with scripted stage cues, pauses, and speaker delivery coaching.
          </p>
        </div>

        <form onSubmit={handleGenerateSpeech} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Your Role
            </label>
            <select
              value={speakerRole}
              onChange={(e) => setSpeakerRole(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:ring-1 focus:ring-stone-900"
            >
              <option value="Best Friend / Maid of Honor">Maid of Honor / Best Friend</option>
              <option value="Best Man / Brother">Best Man / Brother</option>
              <option value="Host / Birthday Celebrant">Host / Birthday Celebrant</option>
              <option value="Parent of the Couple / Child">Proud Parent</option>
              <option value="Community Director / Organizer">Community Director / Organizer</option>
              <option value="Colleague / Mentor">Colleague / Mentor</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Honoree / Subject Name
            </label>
            <input
              type="text"
              value={honoreeName}
              onChange={(e) => setHonoreeName(e.target.value)}
              placeholder="e.g. Elena & Marcus, or Leo"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Tone & Flavor
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:ring-1 focus:ring-stone-900"
            >
              <option value="Warm, heartfelt, with tasteful humor">Warm & Tearful with Subtle Laughs</option>
              <option value="Lighthearted, funny, and joyful">Playful & Witty</option>
              <option value="Concise, elegant, and poetic">Concise & Elegant (Under 3 mins)</option>
              <option value="Inspiring, energetic, and celebratory">Inspiring & Uplifting Community Toast</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Key Anecdotes, Shared Memories, or Inside Stories
            </label>
            <textarea
              rows={3}
              value={stories}
              onChange={(e) => setStories(e.target.value)}
              placeholder="e.g. When we got lost in Joshua Tree, how they always support their friends, their passion for baking..."
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isGeneratingSpeech}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs disabled:opacity-60"
            >
              {isGeneratingSpeech ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Composing Bespoke Toast...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-amber-300" />
                  <span>Draft Speech with AI</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Speech Output Box */}
        {speechResult && (
          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
              <div>
                <h4 className="text-base font-serif font-bold text-stone-900">
                  {speechResult.title}
                </h4>
                <span className="text-xs text-stone-500 font-mono">
                  Estimated Pace: {speechResult.estimatedDuration}
                </span>
              </div>

              <button
                onClick={handleCopySpeech}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
              >
                {copiedSpeech ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied Toast!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>
            </div>

            <div className="font-serif text-sm text-stone-800 whitespace-pre-line leading-relaxed p-4 bg-white rounded-xl border border-stone-200/60 max-h-96 overflow-y-auto">
              {speechResult.speechText}
            </div>

            {speechResult.deliveryTips && speechResult.deliveryTips.length > 0 && (
              <div className="p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-950">
                <span className="font-bold uppercase tracking-wider text-[10px] text-amber-900 block mb-1">
                  Speaker Delivery Cues:
                </span>
                <ul className="list-disc list-inside space-y-1">
                  {speechResult.deliveryTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
