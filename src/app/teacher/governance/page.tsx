"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, UserCheck, MessageSquare, Send, CheckCircle2, XCircle, AlertTriangle, Sparkles, Brain, RefreshCw } from "lucide-react";
import { getStudentProfile, sendTeacherDiscovery, approveRemediation } from "@/lib/api";
import { LongitudinalProfile, RemediationPlan, ChatMessage } from "@/types";
import CognitiveRadar from "@/components/CognitiveRadar";

export default function TeacherGovernancePage() {
  const [studentId, setStudentId] = useState("student_demo_101");
  const [profile, setProfile] = useState<LongitudinalProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("Can you analyze student_demo_101's biggest learning gaps and draft an intervention plan?");
  const [loadingChat, setLoadingChat] = useState(false);
  const [stagedPlan, setStagedPlan] = useState<RemediationPlan | null>(null);
  const [planApproved, setPlanApproved] = useState<boolean | null>(null);

  useEffect(() => {
    getStudentProfile(studentId)
      .then((data) => setProfile(data.profile))
      .catch((err) => console.warn("Load profile err:", err));
  }, [studentId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loadingChat) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoadingChat(true);

    try {
      const res = await sendTeacherDiscovery({
        teacher_id: "teacher_admin",
        student_id: studentId,
        message: userMsg.content,
      });

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: res.reply,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // If reply suggests a staged plan, create visual HITL proposal
      if (res.reply.toLowerCase().includes("remediation") || res.reply.toLowerCase().includes("photosynthesis")) {
        setStagedPlan({
          plan_id: `plan_${Math.random().toString(36).substring(2, 8)}`,
          student_id: studentId,
          created_at: new Date().toISOString(),
          identified_learning_gaps: [
            "Photosynthesis: Light-dependent reactions vs dark reactions",
            "ATP synthesis conceptual confusion with direct solar absorption",
          ],
          proposed_interventions: [
            {
              rule_id: "rule_visual_scaffold_01",
              action_type: "insert_visual_scaffold",
              description: "Present dual-coded chloroplast diagrams prior to text explanations",
            },
            {
              rule_id: "rule_analogy_02",
              action_type: "analogy_anchoring",
              description: "Anchor ATP battery energy storage analogy before chemical formulas",
            },
          ],
          status: "proposed",
          expected_outcome: "Accelerate conceptual mastery from 45% to >80% with visual dual-coding",
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
        teacher_id: "teacher_admin",
        teacher_comments: approved ? "Approved: Apply dual-coding scaffolding on next sitting." : "Rejected for revision.",
      });
      setPlanApproved(approved);
      // Refresh profile
      getStudentProfile(studentId).then((data) => setProfile(data.profile));
    } catch (err: any) {
      console.error("Approval error:", err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
            Workflow 4 &bull; Human-In-The-Loop (HITL) Governance
          </span>
          <h1 className="text-3xl font-extrabold text-white">
            Teacher Governance & AI Copilot
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Collaborative discovery with AI Strategist <strong>Athena</strong>. Review longitudinal friction maps and sign-off on remediation rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Student ID:</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="rounded-lg bg-black/40 border border-white/10 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Longitudinal Profile & HITL Gate */}
        <div className="lg:col-span-6 space-y-6">
          {profile ? (
            <CognitiveRadar profile={profile} />
          ) : (
            <div className="glass-panel p-8 text-center text-slate-500 text-xs">
              Loading student cognitive profile...
            </div>
          )}

          {/* HITL Remediation Gate Card */}
          {stagedPlan && (
            <div className="glass-panel p-6 border border-purple-500/40 bg-purple-950/20 space-y-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-purple-400" /> Staged Remediation Proposal (HITL Gate)
                </span>
                <span className="text-xs font-mono text-slate-400">{stagedPlan.plan_id}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <strong className="text-slate-200">Target Gaps:</strong>
                  <ul className="list-disc pl-5 mt-1 text-slate-300 space-y-0.5">
                    {stagedPlan.identified_learning_gaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong className="text-slate-200">Proposed Scaffolding Rules:</strong>
                  <div className="space-y-1.5 mt-1">
                    {stagedPlan.proposed_interventions.map((rule, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-black/40 border border-white/5 font-mono text-[11px] text-purple-200">
                        <strong>{rule.action_type}:</strong> {rule.description}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                  <strong>Expected Outcome:</strong> {stagedPlan.expected_outcome}
                </div>
              </div>

              {/* Approval Actions */}
              {planApproved === null ? (
                <div className="flex gap-3 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleApprovePlan(true)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve & Persist Rule
                  </button>
                  <button
                    onClick={() => handleApprovePlan(false)}
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              ) : (
                <div className={`p-3 rounded-xl text-center text-xs font-semibold ${planApproved ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"}`}>
                  {planApproved ? "✓ Rule Approved & Synced with Student Profile in Firestore" : "✗ Remediation Proposal Rejected"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Athena Teacher Discovery Dialogue */}
        <div className="lg:col-span-6 flex flex-col h-[700px] glass-panel border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-purple-400 animate-pulse"></span>
              <div>
                <h3 className="text-xs font-bold text-white">Athena &bull; Teacher Copilot Agent</h3>
                <p className="text-[10px] text-slate-400">Collaborative Pedagogical Strategist</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 p-6">
                <MessageSquare className="h-8 w-8 text-purple-400/40" />
                <p className="text-xs text-slate-300 font-semibold">Start Discovery Dialogue</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Ask Athena about student learning patterns, concept mastery friction, or request automated remediation drafting.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-purple-600 text-white shadow-md rounded-br-none"
                        : "glass-panel bg-white/[0.04] border border-white/10 text-slate-200 rounded-bl-none whitespace-pre-wrap"
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
                </div>
              ))
            )}

            {loadingChat && (
              <div className="flex items-center gap-2 text-xs text-purple-300 p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 animate-pulse">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Athena is analyzing longitudinal trends...</span>
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 bg-black/30 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Athena for pedagogical insights..."
              className="flex-1 rounded-xl bg-black/50 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loadingChat || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
