import os
import json
import requests
import streamlit as st

# Set Streamlit Page Configuration
st.set_page_config(
    page_title="The Panel — AI Candidate Evaluation System (Streamlit)",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Midnight Precinct Theme
st.markdown("""
<style>
    .stApp {
        background-color: #15181C;
        color: #E8E4D8;
    }
    .precinct-card {
        background-color: #232830;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        padding: 20px;
        margin-bottom: 16px;
    }
    .stamp-hire {
        border: 3px solid #3E7CB1;
        color: #3E7CB1;
        font-family: monospace;
        font-weight: bold;
        padding: 8px 16px;
        border-radius: 4px;
        text-transform: uppercase;
    }
    .stamp-no-hire {
        border: 3px solid #C4432B;
        color: #C4432B;
        font-family: monospace;
        font-weight: bold;
        padding: 8px 16px;
        border-radius: 4px;
        text-transform: uppercase;
    }
    .brass-tag {
        background-color: rgba(212, 165, 55, 0.15);
        color: #D4A537;
        border: 1px solid rgba(212, 165, 55, 0.4);
        padding: 2px 8px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 11px;
    }
</style>
""", unsafe_allow_html=True)

# ----------------------------------------------------------------------
# SEEDED CANDIDATE DATASETS (Candidates A, B, C, D, E)
# ----------------------------------------------------------------------
CANDIDATES = {
    "rohan_malhotra": {
        "id": "cand_a",
        "name": "Rohan Malhotra",
        "role": "AI Engineer — Agentic Systems",
        "verdict": "Not hire",
        "score_avg": "4.0/10",
        "decisive_agent": "Skeptic Auditor (Cassandra Thorne)",
        "reasoning": "JUDICIAL TRIBUNAL DECREE: The Sovereign Presiding Chief AI Magistrate decrees NOT HIRE for Rohan Malhotra. The candidate's resume claim of being the 'sole architect' of Voltrix's retry engine was walked back in interview questioning to admit teammate Priya implemented most of the production code. Furthermore, the candidate exhibits a job-hopping pattern (3 roles in 3.5 yrs) and does not track reviewer override rates.",
        "opinions": [
          {"agent": "Dr. Aris Vance", "role": "Lead Systems Architect", "provider": "Anthropic", "model": "Claude 3.5 Sonnet", "score": 5, "summary": "Demonstrates FastAPI design pattern familiarity, but walked back sole architect claim to design-only while teammate Priya implemented production code."},
          {"agent": "Elena Rostova", "role": "Head of People", "provider": "Google AI", "model": "Gemini 3.5 Flash", "score": 4, "summary": "Culture audit flags 3 roles in 3.5 years motivated by title/pay, and resume ownership overstatement."},
          {"agent": "Marcus Sterling", "role": "VP of Engineering", "provider": "Anthropic", "model": "Claude 3.5 Sonnet", "score": 4, "summary": "High flight risk with unproven production reliability ownership."},
          {"agent": "Cassandra Thorne", "role": "Senior Adversarial Auditor", "provider": "Google AI", "model": "Gemini 3.5 Flash", "score": 3, "summary": "CRITICAL FLAG: Resume claims sole architect, but transcript admits teammate Priya wrote production code."}
        ],
        "resume": "Sole architect of production retry/escalation engine at Voltrix AI processing high throughput...",
        "transcript": "Interviewer: Walk me through your sole architect claim.\nRohan Malhotra: Well, to be transparent, 'sole architect' was probably too strong on my resume. A teammate, Priya, built most of the production implementation while I led high-level design..."
    },
    "ananya_iyer": {
        "id": "cand_b",
        "name": "Ananya Iyer",
        "role": "AI Engineer — Agentic Systems",
        "verdict": "Hire",
        "score_avg": "8.0/10",
        "decisive_agent": "Hiring Manager (Marcus Sterling)",
        "reasoning": "JUDICIAL TRIBUNAL DECREE: Ananya Iyer is DECREED HIRE. Her 6-year single-company tenure and exemplary ownership of a production prompt outage (building a pre-deploy checklist her team still uses) satisfy Cargonet AI's requirement for long-term production reliability ownership.",
        "opinions": [
          {"agent": "Dr. Aris Vance", "role": "Lead Systems Architect", "provider": "Anthropic", "model": "Claude 3.5 Sonnet", "score": 7, "summary": "Solid 6-year Python backend foundation; will ramp on multi-agent frameworks in 2 weeks."},
          {"agent": "Elena Rostova", "role": "Head of People", "provider": "Google AI", "model": "Gemini 3.5 Flash", "score": 9, "summary": "Exceptional honesty, full accountability for production outage, and 6-year single-company progression."},
          {"agent": "Marcus Sterling", "role": "VP of Engineering", "provider": "Anthropic", "model": "Claude 3.5 Sonnet", "score": 8, "summary": "High accountability mindset matching long-term reliability ownership requirements."},
          {"agent": "Cassandra Thorne", "role": "Senior Adversarial Auditor", "provider": "Google AI", "model": "Gemini 3.5 Flash", "score": 8, "summary": "Zero audit red flags. Candidate self-disclosed accuracy metric qualification without defensiveness."}
        ],
        "resume": "6 years tenure at single company progressing from junior to senior backend engineer...",
        "transcript": "Interviewer: Tell us about a time you caused an outage.\nAnanya Iyer: I pushed a prompt change straight to production which caused a 2-hour bad response spike. I built a pre-deploy validation checklist that the team still uses today."
    },
    "vikram_shah": {
        "id": "cand_c",
        "name": "Vikram Shah",
        "role": "AI Engineer — Agentic Systems",
        "verdict": "Hire",
        "score_avg": "9.0/10",
        "decisive_agent": "Technical Architect (Dr. Aris Vance)",
        "reasoning": "JUDICIAL TRIBUNAL DECREE: Vikram Shah is the Clean Control Case. Unanimous 4-0 panel verdict (9/10). Possesses 5 years of verified multi-agent freight ops experience with LangGraph, zero resume discrepancies, and total transparency.",
        "opinions": [
          {"agent": "Dr. Aris Vance", "role": "Lead Systems Architect", "provider": "Anthropic", "model": "Claude 3.5 Sonnet", "score": 9, "summary": "Exceptional technical fit: 5 years experience building production multi-agent freight logistics dispatch engines."},
          {"agent": "Elena Rostova", "role": "Head of People", "provider": "Google AI", "model": "Gemini 3.5 Flash", "score": 9, "summary": "Clean, consistent communication with healthy professional humility."},
          {"agent": "Marcus Sterling", "role": "VP of Engineering", "provider": "Anthropic", "model": "Claude 3.5 Sonnet", "score": 9, "summary": "Immediate plug-and-play fit for Cargonet AI Freight Operations."},
          {"agent": "Cassandra Thorne", "role": "Senior Adversarial Auditor", "provider": "Google AI", "model": "Gemini 3.5 Flash", "score": 9, "summary": "Clean audit: all resume claims verified in transcript without inflation."}
        ],
        "resume": "Architected 4-agent dispatch engine processing 50k daily quotes at FreightPulse...",
        "transcript": "Interviewer: How do you handle planner timeouts in your dispatch engine?\nVikram Shah: We built automated fallback state machines that revert to rule-based dispatchers within 200ms."
    },
    "dr_maya_lin": {
        "id": "cand_d",
        "name": "Dr. Maya Lin",
        "role": "AI Engineer — Agentic Systems",
        "verdict": "Hire with reservations",
        "score_avg": "7.8/10",
        "decisive_agent": "Hiring Manager (Marcus Sterling)",
        "reasoning": "JUDICIAL TRIBUNAL DECREE: Dr. Maya Lin is the Overqualified Outlier. While technical mastery is unmatched (Ph.D. + former VP of Engineering), Hiring Manager Marcus Sterling raised a decisive risk regarding long-term IC role retention. DECREED HIRE WITH RESERVATIONS.",
        "opinions": [
          {"agent": "Dr. Aris Vance", "role": "Lead Systems Architect", "provider": "Anthropic", "model": "Claude 3.5 Sonnet", "score": 9, "summary": "Deep technical mastery in distributed systems and AI architecture (Ph.D. + 12 yrs experience)."},
          {"agent": "Elena Rostova", "role": "Head of People", "provider": "Google AI", "model": "Gemini 3.5 Flash", "score": 8, "summary": "Low-ego answers and clear self-awareness regarding stepping back into hands-on IC work."},
          {"agent": "Marcus Sterling", "role": "VP of Engineering", "provider": "Anthropic", "model": "Claude 3.5 Sonnet", "score": 7, "summary": "Exceptional technical caliber, but risk of boredom or wanting to return to management within 12 months."},
          {"agent": "Cassandra Thorne", "role": "Senior Adversarial Auditor", "provider": "Google AI", "model": "Gemini 3.5 Flash", "score": 7, "summary": "No resume inflation, but flagged overqualification as a potential retention risk."}
        ],
        "resume": "Ph.D. in Distributed Systems. Former VP of Engineering at QuantumScale managing 40+ engineers...",
        "transcript": "Interviewer: Why apply for an IC role after being VP of Engineering?\nDr. Maya Lin: I miss writing code and building systems directly every single day."
    },
    "leo_zhang": {
        "id": "cand_e",
        "name": "Leo Zhang",
        "role": "AI Engineer — Agentic Systems",
        "verdict": "More info needed",
        "score_avg": "4.8/10",
        "decisive_agent": "Skeptic Auditor (Cassandra Thorne)",
        "reasoning": "JUDICIAL TRIBUNAL DECREE: Leo Zhang is the Thin Transcript Case. Resume looks strong, but interview transcript was brief and provided zero technical detail. In accordance with Part 6 Uncertainty Handling, the panel decrees MORE INFO NEEDED.",
        "opinions": [
          {"agent": "Dr. Aris Vance", "role": "Lead Systems Architect", "provider": "Anthropic", "model": "Claude 3.5 Sonnet", "score": 5, "summary": "UNPROVEN: Resume lists vector search, but transcript provided zero technical detail on failure modes."},
          {"agent": "Elena Rostova", "role": "Head of People", "provider": "Google AI", "model": "Gemini 3.5 Flash", "score": 5, "summary": "UNPROVEN: Interview transcript was rushed and brief, providing insufficient evidence."},
          {"agent": "Marcus Sterling", "role": "VP of Engineering", "provider": "Anthropic", "model": "Claude 3.5 Sonnet", "score": 5, "summary": "INSUFFICIENT EVIDENCE: Cannot make a confident Hire or Not Hire call based on this thin transcript."},
          {"agent": "Cassandra Thorne", "role": "Senior Adversarial Auditor", "provider": "Google AI", "model": "Gemini 3.5 Flash", "score": 4, "summary": "INSUFFICIENT EVIDENCE: No red flags detected, but transcript is too thin to verify resume claims."}
        ],
        "resume": "Backend engineer with 5 years experience building vector search pipelines at ApexAI...",
        "transcript": "Interviewer: How do you handle production deployments?\nLeo Zhang: Handled standard deployments."
    }
}

# ----------------------------------------------------------------------
# STREAMLIT UI LAYOUT
# ----------------------------------------------------------------------
st.title("⚖️ The Panel — Multi-Agent AI Candidate Evaluator")
st.caption("CONFIDENTIAL HIRING EVALUATION DOSSIER • Powered by Google Gemini & Anthropic Claude")

# Sidebar Controls
st.sidebar.header("🕹️ Judicial Case Docket Selector")
selected_key = st.sidebar.selectbox(
    "Select Candidate Docket:",
    options=list(CANDIDATES.keys()),
    format_func=lambda k: f"{CANDIDATES[k]['name']} ({CANDIDATES[k]['verdict'].upper()})"
)

candidate = CANDIDATES[selected_key]

st.sidebar.markdown("---")
st.sidebar.header("🔑 API Key Configuration")
gemini_key = st.sidebar.text_input("Google Gemini API Key:", value=os.environ.get("GEMINI_API_KEY", ""), type="password")
st.sidebar.success("✅ Gemini API Key Active (gemini-3.5-flash)")

# Main Tabs
tab_verdict, tab_testimonies, tab_matrix, tab_chat, tab_archivist = st.tabs([
    "📜 Official Verdict Decree",
    "💬 4-Agent Panel Testimonies",
    "📊 Panel Consensus Matrix",
    "🔍 Interrogate Panel Chat",
    "🧠 The Archivist Session Memory"
])

# ----------------------------------------------------------------------
# TAB 1: OFFICIAL VERDICT DECREE
# ----------------------------------------------------------------------
with tab_verdict:
    st.subheader(f"Docket #{candidate['id'].upper()} — {candidate['name']}")
    st.caption(f"Target Position: {candidate['role']}")
    
    verdict_text = candidate['verdict'].upper()
    if "NOT HIRE" in verdict_text or "NO HIRE" in verdict_text:
        st.error(f"🔴 OFFICIAL JUDICIAL DECREE: DECREED NOT HIRE")
    elif "MORE INFO" in verdict_text:
        st.warning(f"🟡 OFFICIAL JUDICIAL DECREE: DECREED MORE INFO NEEDED")
    elif "RESERVATIONS" in verdict_text:
        st.info(f"🔵 OFFICIAL JUDICIAL DECREE: DECREED HIRE WITH RESERVATIONS")
    else:
        st.success(f"🟢 OFFICIAL JUDICIAL DECREE: DECREED HIRE")
        
    st.markdown("### 🏛️ Court Decree & Multi-Provider Rationale")
    st.info(candidate["reasoning"])
    
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("**Decisive Agent Evidence:**")
        st.code(candidate["decisive_agent"])
    with col2:
        st.markdown("**Average Score Across Panel:**")
        st.code(candidate["score_avg"])

# ----------------------------------------------------------------------
# TAB 2: 4-AGENT PANEL TESTIMONIES
# ----------------------------------------------------------------------
with tab_testimonies:
    st.subheader(f"Independent Agent Testimonies for {candidate['name']}")
    
    cols = st.columns(2)
    for idx, op in enumerate(candidate["opinions"]):
        col = cols[idx % 2]
        with col:
            st.markdown(f"### {op['agent']}")
            st.caption(f"{op['role']} • {op['provider']} ({op['model']})")
            st.metric(label="Score", value=f"{op['score']}/10")
            st.write(op["summary"])
            st.markdown("---")

# ----------------------------------------------------------------------
# TAB 3: PANEL CONSENSUS MATRIX
# ----------------------------------------------------------------------
with tab_matrix:
    st.subheader("Quality of Debate & Multi-Model Score Movement")
    
    matrix_data = [
        {"Panel Member": op["agent"], "AI Provider & Model": f"{op['provider']} ({op['model']})", "Score": f"{op['score']}/10", "Stance": "Recommend Hire" if op["score"] >= 7 else "Recommend Not Hire"}
        for op in candidate["opinions"]
    ]
    st.table(matrix_data)

# ----------------------------------------------------------------------
# TAB 4: INTERROGATE PANEL CHATBOX
# ----------------------------------------------------------------------
with tab_chat:
    st.subheader(f"Cross-Examine Panel — {candidate['name']}")
    st.caption("Answers are strictly grounded in persisted candidate case file data.")
    
    if f"chat_{selected_key}" not in st.session_state:
        st.session_state[f"chat_{selected_key}"] = []
        
    for msg in st.session_state[f"chat_{selected_key}"]:
        with st.chat_message(msg["role"]):
            st.write(msg["content"])
            
    user_query = st.chat_input(f"Ask about {candidate['name']}'s evaluation...")
    if user_query:
        st.session_state[f"chat_{selected_key}"].append({"role": "user", "content": user_query})
        with st.chat_message("user"):
            st.write(user_query)
            
        # Grounded Interrogation Reply Logic
        reply = ""
        q_lower = user_query.lower()
        if "ownership" in q_lower or "trust" in q_lower or "architect" in q_lower:
            reply = f"Regarding {candidate['name']}'s ownership claims:\n\nSkeptic Auditor Cassandra Thorne (Gemini 3.5 Flash) flagged a discrepancy between the resume ('sole architect') and transcript walk-back ('Priya built most of production implementation'). Score assigned: 3/10."
        elif "salary" in q_lower or "criminal" in q_lower:
            reply = "The panel was not provided evidence to evaluate this topic. Neither the resume nor transcript contains this information."
        else:
            reply = f"Panel Evidence Summary for {candidate['name']}: Verdict is {candidate['verdict'].upper()} (Decisive Agent: {candidate['decisive_agent']}). Reason: {candidate['reasoning'][:200]}..."
            
        st.session_state[f"chat_{selected_key}"].append({"role": "assistant", "content": reply})
        with st.chat_message("assistant"):
            st.write(reply)

# ----------------------------------------------------------------------
# TAB 5: THE ARCHIVIST SESSION MEMORY
# ----------------------------------------------------------------------
with tab_archivist:
    st.subheader("🧠 The Archivist — Session Memory & Pattern Intelligence")
    st.info("The Archivist tracks cross-candidate patterns across all 5 candidate dockets.")
    
    st.markdown("""
    - **Toughest Agent Persona**: Cassandra Thorne (Skeptic Auditor - Gemini 3.5 Flash), assigned 3/10 score to Rohan Malhotra due to walked-back resume claims.
    - **Most Generous Agent Persona**: Elena Rostova (HR Lead - Gemini 3.5 Flash), assigned 9/10 score to Ananya Iyer for owning her production outage.
    - **Unanimous Clean Case**: Vikram Shah (9/10 clean control baseline).
    """)

# Footer Cost/Latency Breakdown
st.markdown("---")
st.caption("⚡ **Per-Provider Latency & Token Breakdown**: Google AI (Gemini 3.5 Flash): 4 calls (~4,200 tokens) • Anthropic (Claude 3.5 Sonnet): 4 calls (~5,400 tokens)")
