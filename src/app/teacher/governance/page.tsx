'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, MessageSquare, Send, CheckCircle2, XCircle, RefreshCw, UserCheck } from 'lucide-react';
import { getStudentProfile, listStudentProfiles, sendTeacherDiscovery, approveRemediation } from '@/lib/api';
import { LongitudinalProfile, RemediationPlan, ChatMessage } from '@/types';
import CognitiveRadar from '@/components/CognitiveRadar';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useTheme } from '@/context/ThemeContext';

export default function TeacherGovernancePage() {
  const { theme } = useTheme();
  const isRefined = theme === 'refined';

  const [students, setStudents] = useState<LongitudinalProfile[]>([]);
  const [studentId, setStudentId] = useState('g1_sarah_jenkins');
  const [profile, setProfile] = useState<LongitudinalProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [stagedPlan, setStagedPlan] = useState<RemediationPlan | null>(null);
  const [planApproved, setPlanApproved] = useState<boolean | null>(null);

  const loadInitialData = async () => {
    try {
      const rosterRes = await listStudentProfiles().catch(() => ({ profiles: [] }));
      const roster = rosterRes.profiles || [];
      setStudents(roster);

      let defaultId = studentId;
      if (roster.length > 0) {
        const exists = roster.find((s) => s.student_id === studentId);
        if (!exists) defaultId = roster[0].student_id;
        setStudentId(defaultId);
      }

      const profRes = await getStudentProfile(defaultId);
      setProfile(profRes.profile);
      setInputMessage(`Analyze ${profRes.profile.display_name || defaultId}'s learning gaps and draft an intervention plan.`);
    } catch (err) {
      console.warn('Load governance data err:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleStudentSelect = async (selectedId: string) => {
    setStudentId(selectedId);
    setStagedPlan(null);
    setPlanApproved(null);
    setMessages([]);
    try {
      const res = await getStudentProfile(selectedId);
      setProfile(res.profile);
      setInputMessage(`Analyze ${res.profile.display_name || selectedId}'s learning gaps and draft an intervention plan.`);
    } catch (err) {
      console.warn('Select student err:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loadingChat) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoadingChat(true);

    try {
      const res = await sendTeacherDiscovery({
        teacher_id: 'teacher_admin',
        student_id: studentId,
        message: userMsg.content,
      });

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Stage remediation proposal
      if (res.reply.toLowerCase().includes('remediation') || res.reply.toLowerCase().includes('intervention') || res.reply.toLowerCase().includes('plan')) {
        setStagedPlan({
          plan_id: `plan_${Math.random().toString(36).substring(2, 8)}`,
          student_id: studentId,
          created_at: new Date().toISOString(),
          identified_learning_gaps: profile?.recurrent_misconceptions?.length
            ? profile.recurrent_misconceptions
            : [
                'Atmospheric re-entry thermodynamics & compression shock heating',
                'Photosynthesis light-dependent vs dark reaction staging',
              ],
          proposed_interventions: [
            {
              rule_id: 'rule_visual_01',
              action_type: 'insert_visual_scaffold',
              description: 'Render structural diagrams before numerical formulas',
            },
            {
              rule_id: 'rule_analogy_02',
              action_type: 'analogy_anchoring',
              description: 'Anchor concrete real-world analogy before abstract theory',
            },
          ],
          status: 'proposed',
          expected_outcome: 'Eliminate friction points and elevate mastery to >85%',
        });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleApprovePlan = async (approved: boolean) => {
    if (!stagedPlan) return;
    try {
      await approveRemediation({
        plan_id: stagedPlan.plan_id,
        student_id: stagedPlan.student_id,
        approved,
        teacher_id: 'teacher_admin',
        teacher_comments: approved ? 'Approved for next study session.' : 'Rejected.',
      });
      setPlanApproved(approved);
      getStudentProfile(studentId).then((data) => setProfile(data.profile));
    } catch (err: any) {
      console.error('Approval error:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className={`flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 ${isRefined ? 'border-b border-[#1a1714]/15' : 'border-b border-[#1a1714]'}`}>
        <div>
          {!isRefined && <span className="tag-ink mb-1">Human-In-The-Loop Governance</span>}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1714] font-serif tracking-tight">
            Teacher Governance
          </h1>
          <p className="text-xs sm:text-sm text-[#8a8075] mt-1">
            Review student comprehension profiles and approve targeted remediation strategies with Athena.
          </p>
        </div>

        {/* Student Selector */}
        <div className="flex flex-col sm:items-end gap-1">
          <label className="text-xs font-semibold text-[#1a1714] flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5 text-[#c84b2f]" /> Active Student:
          </label>
          <select
            value={studentId}
            onChange={(e) => handleStudentSelect(e.target.value)}
            className="border border-[#1a1714]/30 bg-[#ffffff] px-3 py-1.5 text-xs text-[#1a1714] focus:outline-none focus:border-[#1a1714]"
          >
            {students.length > 0 ? (
              students.map((st) => (
                <option key={st.student_id} value={st.student_id}>
                  {st.display_name || st.student_id} &bull; {st.reading_level || 'Grade 7-8'}
                </option>
              ))
            ) : (
              <option value="student_demo_101">student_demo_101</option>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cognitive Profile & HITL Approval */}
        <div className="lg:col-span-6 space-y-6">
          {profile ? (
            <CognitiveRadar profile={profile} />
          ) : (
            <div className="p-8 text-center text-xs text-[#8a8075]">Loading student profile...</div>
          )}

          {/* HITL Card */}
          {stagedPlan && (
            <div className={isRefined ? 'p-6 bg-[#ffffff] border border-[#1a1714]/15 space-y-4 shadow-sm' : 'border border-[#1a1714] bg-[#ebd9be] p-5 space-y-4 shadow-[4px_4px_0px_0px_#1a1714]'}>
              <div className={`flex items-center justify-between pb-2 ${isRefined ? 'border-b border-[#1a1714]/10' : 'border-b border-[#1a1714]'}`}>
                <h3 className="text-xs font-bold text-[#1a1714] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <ShieldCheck className="h-4 w-4 text-[#c84b2f]" /> Proposed Remediation Plan
                </h3>
                <span className="text-xs text-[#8a8075] font-mono">{stagedPlan.plan_id}</span>
              </div>

              <div className="space-y-3 text-xs text-[#1a1714]">
                <div>
                  <strong className="block mb-1">Identified Learning Gaps:</strong>
                  <ul className="list-disc pl-5 space-y-0.5 text-[#1a1714]/90">
                    {stagedPlan.identified_learning_gaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong className="block mb-1">Proposed Interventions:</strong>
                  <div className="space-y-1.5">
                    {stagedPlan.proposed_interventions.map((rule, i) => (
                      <div key={i} className="p-2.5 bg-[#f5f0e8] border border-[#1a1714]/15 text-xs">
                        <strong>{rule.action_type}:</strong> {rule.description}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 bg-[#f5f0e8] border-l-2 border-[#1a1714] text-xs">
                  <strong>Expected Outcome:</strong> {stagedPlan.expected_outcome}
                </div>
              </div>

              {planApproved === null ? (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleApprovePlan(true)}
                    className={isRefined ? 'bg-[#1a1714] text-[#f5f0e8] hover:bg-[#c84b2f] text-xs font-semibold py-2 px-4 flex-1 flex items-center justify-center gap-1' : 'btn-ink flex-1 flex items-center justify-center gap-1'}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Sync Rule
                  </button>
                  <button
                    onClick={() => handleApprovePlan(false)}
                    className={isRefined ? 'border border-[#1a1714]/30 hover:border-[#1a1714] text-xs py-2 px-3 flex items-center justify-center gap-1' : 'btn-paper flex items-center justify-center gap-1'}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-[#f5f0e8] border border-[#1a1714]/20 text-xs font-semibold text-center text-[#1a1714]">
                  {planApproved ? `Approved and synced to ${profile?.display_name || studentId}` : 'Remediation plan rejected'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Athena Dialogue with Markdown Rendering */}
        <div className={`lg:col-span-6 flex flex-col h-[680px] overflow-hidden ${isRefined ? 'bg-[#ffffff] border border-[#1a1714]/15 shadow-sm' : 'border border-[#1a1714] bg-[#ffffff]'}`}>
          <div className={`p-4 flex items-center justify-between ${isRefined ? 'border-b border-[#1a1714]/10 bg-[#f5f0e8]' : 'border-b border-[#1a1714] bg-[#e8e0d0]'}`}>
            <div>
              <h3 className="text-sm font-bold text-[#1a1714] font-serif">Athena (Teaching Assistant)</h3>
              <p className="text-xs text-[#8a8075]">Analyzing {profile?.display_name || studentId}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f5f0e8]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#8a8075] space-y-2 p-6">
                <MessageSquare className="h-6 w-6 text-[#1a1714]" />
                <p className="text-sm text-[#1a1714] font-bold font-serif">Start Discovery</p>
                <p className="text-xs text-[#8a8075] max-w-xs">
                  Ask Athena about {profile?.display_name || studentId}&apos;s progress trends or request an intervention proposal.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[90%] p-3.5 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#1a1714] text-[#f5f0e8]'
                        : isRefined
                        ? 'bg-[#ffffff] text-[#1a1714] border border-[#1a1714]/15 shadow-sm'
                        : 'bg-[#ffffff] text-[#1a1714] border border-[#1a1714] shadow-[3px_3px_0px_0px_#1a1714]'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      <MarkdownRenderer content={m.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-[#8a8075] mt-0.5 px-1 font-mono">{m.timestamp}</span>
                </div>
              ))
            )}

            {loadingChat && (
              <div className="flex items-center gap-2 text-xs text-[#1a1714] p-2.5 bg-[#ffffff] border border-[#1a1714]/15">
                <RefreshCw className="h-3 w-3 animate-spin text-[#c84b2f]" />
                <span>Athena is analyzing trends for {profile?.display_name || studentId}...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className={`p-3 flex gap-2 ${isRefined ? 'border-t border-[#1a1714]/10 bg-[#ffffff]' : 'border-t border-[#1a1714] bg-[#e8e0d0]'}`}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask Athena about ${profile?.display_name || studentId}...`}
              className="flex-1 border border-[#1a1714]/30 bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] placeholder-[#8a8075] focus:outline-none focus:border-[#1a1714]"
            />
            <button
              type="submit"
              disabled={loadingChat || !inputMessage.trim()}
              className={isRefined ? 'bg-[#1a1714] text-[#f5f0e8] hover:bg-[#c84b2f] px-3 py-2 text-xs font-semibold' : 'btn-ink'}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
