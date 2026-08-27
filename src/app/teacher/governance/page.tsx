'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, MessageSquare, Send, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { getStudentProfile, sendTeacherDiscovery, approveRemediation } from '@/lib/api';
import { LongitudinalProfile, RemediationPlan, ChatMessage } from '@/types';
import CognitiveRadar from '@/components/CognitiveRadar';

export default function TeacherGovernancePage() {
  const [studentId, setStudentId] = useState('student_demo_101');
  const [profile, setProfile] = useState<LongitudinalProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('Analyze student_demo_101 learning gaps and draft an intervention plan.');
  const [loadingChat, setLoadingChat] = useState(false);
  const [stagedPlan, setStagedPlan] = useState<RemediationPlan | null>(null);
  const [planApproved, setPlanApproved] = useState<boolean | null>(null);

  useEffect(() => {
    getStudentProfile(studentId)
      .then((data) => setProfile(data.profile))
      .catch((err) => console.warn('Load profile err:', err));
  }, [studentId]);

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
          identified_learning_gaps: [
            'Atmospheric re-entry thermodynamics & compression shock heating',
            'Photosynthesis light-dependent vs dark reaction staging',
          ],
          proposed_interventions: [
            {
              rule_id: 'rule_visual_01',
              action_type: 'insert_visual_scaffold',
              description: 'Render dual-coded structural diagrams before numerical formulas',
            },
            {
              rule_id: 'rule_analogy_02',
              action_type: 'analogy_anchoring',
              description: 'Anchor air piston compression analogy before shock wave aerodynamics',
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
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="ui-tag">Workflow 4 &bull; Human-In-The-Loop Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Teacher Governance & Copilot</h1>
          <p className="text-xs text-[#a1a1aa]">
            Collaborative discovery with AI Strategist <strong>Athena</strong>. Review cognitive friction maps and approve remediation plans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[#a1a1aa]">Student ID:</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="rounded bg-[#18181b] border border-[#27272a] px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#3f3f46]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Cognitive Profile & HITL Approval */}
        <div className="lg:col-span-6 space-y-6">
          {profile ? (
            <CognitiveRadar profile={profile} />
          ) : (
            <div className="ui-panel p-8 text-center text-xs text-[#71717a]">Loading student profile...</div>
          )}

          {/* HITL Card */}
          {stagedPlan && (
            <div className="ui-panel p-5 space-y-4 border border-[#3f3f46]">
              <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-white" /> Staged Remediation Gate (HITL)
                </h3>
                <span className="ui-tag">{stagedPlan.plan_id}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <strong className="text-white block mb-1">Target Gaps:</strong>
                  <ul className="list-disc pl-5 space-y-0.5 text-[#a1a1aa]">
                    {stagedPlan.identified_learning_gaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong className="text-white block mb-1">Proposed Interventions:</strong>
                  <div className="space-y-1.5">
                    {stagedPlan.proposed_interventions.map((rule, i) => (
                      <div key={i} className="p-2.5 rounded bg-[#18181b] border border-[#27272a] font-mono text-[11px] text-[#fafafa]">
                        <strong>{rule.action_type}:</strong> {rule.description}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#18181b] border border-[#27272a] text-[#fafafa]">
                  <strong>Expected Outcome:</strong> {stagedPlan.expected_outcome}
                </div>
              </div>

              {planApproved === null ? (
                <div className="flex gap-2 pt-2 border-t border-[#27272a]">
                  <button onClick={() => handleApprovePlan(true)} className="ui-btn-primary flex-1 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Sync Rule
                  </button>
                  <button onClick={() => handleApprovePlan(false)} className="ui-btn-secondary flex items-center justify-center gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded bg-[#18181b] border border-[#27272a] text-xs font-semibold text-center text-emerald-400">
                  {planApproved ? 'Approved and synced to Firestore' : 'Remediation plan rejected'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Athena Dialogue */}
        <div className="lg:col-span-6 flex flex-col h-[680px] ui-panel overflow-hidden">
          <div className="p-3.5 border-b border-[#27272a] bg-[#121215] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white">Athena &bull; Teacher AI Strategist</h3>
              <p className="text-[10px] text-[#71717a]">Longitudinal analysis and adaptive remediation drafting</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#71717a] space-y-2 p-6">
                <MessageSquare className="h-6 w-6 text-[#a1a1aa]" />
                <p className="text-xs text-white font-medium">Start Teacher Discovery</p>
                <p className="text-[11px] text-[#71717a] max-w-xs">
                  Ask Athena for student diagnostic trends or request a custom remediation proposal.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] rounded p-3 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-white text-black font-medium'
                        : 'bg-[#18181b] border border-[#27272a] text-white whitespace-pre-wrap'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-[#71717a] mt-0.5 px-1">{m.timestamp}</span>
                </div>
              ))
            )}

            {loadingChat && (
              <div className="flex items-center gap-2 text-xs text-[#a1a1aa] p-2 rounded bg-[#18181b]">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Athena is analyzing trends...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-2.5 border-t border-[#27272a] bg-[#121215] flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Athena for pedagogical insights..."
              className="flex-1 rounded bg-[#18181b] border border-[#27272a] px-3 py-2 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
            />
            <button type="submit" disabled={loadingChat || !inputMessage.trim()} className="ui-btn-primary">
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
