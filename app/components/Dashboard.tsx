'use client';

import React from 'react';
import { useAchievements, useScores, useAppStore } from '../libs/store';
import { Trophy, Star, Clock, Target, Award, CheckCircle2, Lock } from 'lucide-react';

export function Dashboard() {
  const achievements = useAchievements();
  const scores = useScores();
  const totalPracticeTime = useAppStore((state) => state.totalPracticeTime);

  const totalScore = scores.reduce((acc, s) => acc + s.score, 0);
  const avgAccuracy = scores.length > 0 
    ? scores.reduce((acc, s) => acc + s.accuracy, 0) / scores.length 
    : 0;
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Trophy size={20} />
            </div>
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Score</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">{totalScore.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Target size={20} />
            </div>
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Avg Accuracy</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">{Math.round(avgAccuracy)}%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Clock size={20} />
            </div>
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Practice Time</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">{Math.floor(totalPracticeTime / 60)}m</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <Award size={20} />
            </div>
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Achievements</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">{unlockedCount}/{achievements.length}</div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-bottom border-slate-800 bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="text-indigo-400" />
            Achievements & Milestones
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                achievement.unlockedAt 
                  ? 'bg-indigo-500/5 border-indigo-500/20' 
                  : 'bg-slate-950 border-slate-800 opacity-60'
              }`}
            >
              <div className={`p-3 rounded-full ${
                achievement.unlockedAt ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-600'
              }`}>
                {achievement.unlockedAt ? <CheckCircle2 size={24} /> : <Lock size={24} />}
              </div>
              <div>
                <h3 className={`font-bold ${achievement.unlockedAt ? 'text-white' : 'text-slate-500'}`}>
                  {achievement.title}
                </h3>
                <p className="text-sm text-slate-400">{achievement.description}</p>
                {achievement.unlockedAt && (
                  <div className="text-[10px] text-indigo-400 font-mono mt-1 uppercase">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString('en-CA')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {scores.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-bottom border-slate-800 bg-slate-800/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="text-emerald-400" />
              Recent Practice Sessions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-500 text-xs uppercase tracking-wider font-mono">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Song</th>
                  <th className="px-6 py-4 font-medium">Accuracy</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {scores.slice().reverse().slice(0, 5).map((score, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(score.date).toLocaleDateString('en-CA')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {score.songId.startsWith('custom_') ? 'Custom Song' : score.songId}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-emerald-400">
                      {Math.round(score.accuracy)}%
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-white">
                      {score.score.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < (score.accuracy / 33) ? 'text-yellow-400 fill-current' : 'text-slate-700'}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
