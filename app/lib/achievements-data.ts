// app/lib/achievements-data.ts v1.3.5
import { Achievement } from './store';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_song', title: 'First Steps', description: 'Play your first song', icon: 'Music', category: 'collection' },
  { id: 'perfect_10', title: 'Perfect 10', description: 'Get 10 Perfect notes in a row', icon: 'Star', category: 'skill' },
  { id: 'practice_1h', title: 'Dedicated', description: 'Practice for 1 hour total', icon: 'Clock', maxProgress: 3600, category: 'practice' },
  { id: 'score_90', title: 'Virtuoso', description: 'Score over 90% accuracy on any song', icon: 'Trophy', category: 'skill' },
  { id: 'play_3_styles', title: 'Versatile', description: 'Play songs from 3 different styles', icon: 'Palette', maxProgress: 3, category: 'collection' },
  { id: 'streak_3', title: 'Streak Master', description: 'Practice for 3 days in a row', icon: 'Flame', maxProgress: 3, category: 'practice' },
  { id: 'notes_1000', title: 'Keyboard Warrior', description: 'Hit 1000 notes total', icon: 'Zap', maxProgress: 1000, category: 'skill' },
  { id: 'full_combo', title: 'Perfectionist', description: 'Get a Full Combo on any song', icon: 'Crown', category: 'skill' },
  { id: 'early_bird', title: 'Early Bird', description: 'Practice before 8 AM', icon: 'Sun', category: 'practice' },
  { id: 'night_owl', title: 'Night Owl', description: 'Practice after 10 PM', icon: 'Moon', category: 'practice' },
];
