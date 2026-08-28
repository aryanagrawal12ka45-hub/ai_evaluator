import os
import streamlit as st
import streamlit.components.v1 as components

# Configure Streamlit Page
st.set_page_config(
    page_title="The Panel — AI Candidate Evaluation System",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS to hide default Streamlit chrome & make Next.js app 100% fullscreen
st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stApp {
        background-color: #15181C !important;
    }
    .block-container {
        padding: 0rem !important;
        margin: 0rem !important;
        max-width: 100% !important;
    }
    iframe {
        width: 100vw !important;
        height: 100vh !important;
        border: none !important;
    }
</style>
""", unsafe_allow_html=True)

# Target URL: Uses live local Next.js server or Cloudflare HTTPS Tunnel
LOCAL_URL = "http://localhost:3000"
PUBLIC_URL = "https://flame-define-installed-programmers.trycloudflare.com"

# Select URL based on environment or fallback
target_url = os.environ.get("NEXTJS_APP_URL", PUBLIC_URL)

# Embed the exact flagship Next.js Web Application UI seamlessly in Streamlit
components.iframe(target_url, height=1000, scrolling=True)
