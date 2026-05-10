# ClarityMD
## Real-Time Medical Translation with Cultural Intelligence
### Product Requirements Document

---

| Field | Detail |
|---|---|
| **Version** | 1.1 — HackDavis 2026 |
| **Date** | May 2026 |
| **Status** | Draft — Hackathon Prototype Scope |
| **Target Tracks** | Social Good, Interdisciplinary, AI/ML, Creative, UI/UX, Gemini API, ElevenLabs, Vultr, Blackboard |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [System Architecture](#4-system-architecture)
5. [Feature Specifications](#5-feature-specifications)
6. [UI/UX Requirements](#6-uiux-requirements)
7. [Ethical Considerations & Compliance](#7-ethical-considerations--compliance)
8. [HackDavis 2026 Track Alignment](#8-hackdavis-2026-track-alignment)
9. [MVP Scope & Build Priority](#9-mvp-scope--build-priority)
10. [Risks & Mitigations](#10-risks--mitigations)
11. [Appendix: Glossary](#appendix-glossary)

---

## 1. Executive Summary

ClarityMD is a real-time medical translation and cultural intelligence platform that puts patients in control of their own healthcare communication. Patients use ClarityMD independently — before, during, or after a clinical encounter — to understand medical information in their own language, at their own health literacy level, adapted to their cultural context. No clinician setup or involvement is required.

Language barriers in healthcare are not a minor inconvenience. They cause misdiagnosis, medication errors, delayed care, and patients avoiding treatment entirely. Over 25 million Americans have limited English proficiency. Existing solutions — human interpreters, phone translation lines, static translation apps — are slow, expensive, inconsistent, and culturally tone-deaf. ClarityMD is built to change that — and to give patients the agency to navigate it themselves.

> **Core Value Proposition**
>
> ClarityMD is not a translation app. It is a cultural intelligence layer that patients carry with them — ensuring that medical information is not just linguistically accurate, but emotionally appropriate, culturally resonant, and genuinely understood, on the patient's own terms.

---

## 2. Problem Statement

### 2.1 The Language Barrier Crisis in Healthcare

The United States healthcare system serves an extraordinarily diverse population, yet operates almost exclusively in English. The consequences are severe and well-documented:

- Patients with limited English proficiency (LEP) are 2–3x more likely to experience adverse medical events
- LEP patients have lower rates of preventive care, higher rates of hospitalization, and lower patient satisfaction
- Medical interpreters cost $75–$150/hour and are unavailable in most clinics, emergency rooms, and rural settings
- Phone-based interpretation is slow, disruptive, and creates no lasting patient record
- Machine translation tools (e.g. Google Translate) are linguistically literal and clinically dangerous — they do not simplify jargon, do not adapt culturally, and hallucinate medical terminology

### 2.2 The Missing Patient Agency Layer

Current tools are designed to be operated by or on behalf of a clinician. Patients are passive recipients. ClarityMD flips this model: the patient owns and operates the tool, independently, without needing a clinician to initiate or manage anything. Patients can use ClarityMD to:

- Understand a diagnosis, prescription, or treatment plan after leaving an appointment
- Prepare questions before an appointment
- Look up a medication their doctor prescribed
- Replay and review what was discussed, in their own language

### 2.3 The Missing Cultural Layer

Translation alone is insufficient. Medical communication is deeply cultural. The same diagnosis delivered in the same language can be received very differently depending on:

- Whether the patient's culture is individual-decision or family-decision oriented
- Religious beliefs about specific treatments (blood products, pork-derived medications, end-of-life interventions)
- Historical medical trauma (distrust of the healthcare system, particularly among Black, Indigenous, and immigrant communities)
- Varying norms around discussing death, mental illness, reproductive health, and substance use
- Health literacy — education level in any language affects comprehension, not just English proficiency

---

## 3. Target Users

### 3.1 Primary User: The Patient

ClarityMD is built for and operated by the patient. No clinician involvement is required at any point. Target patients include:

- Recent immigrants and refugees navigating an unfamiliar healthcare system
- Elderly patients whose dominant language is not English
- Family members acting as medical decision-makers or caregivers for a patient
- Patients from communities with historically low healthcare trust
- Anyone who received medical information in English and needs to genuinely understand it

The patient opens ClarityMD on their own device, sets up their cultural and language profile, and uses the tool independently — before appointments to prepare, during appointments to listen and translate in real time, or after appointments to review and understand what was communicated.

### 3.2 Secondary User: Medical Educators (Blackboard Integration)

Medical and nursing students learning to communicate across cultural and linguistic lines. ClarityMD's Blackboard integration surfaces the platform as a training tool for cultural competency in clinical communication — a growing requirement in healthcare education accreditation.

> **Note on Clinicians:** Clinicians are not users of ClarityMD. They do not set up sessions, manage profiles, or operate the interface. ClarityMD is the patient's tool. A patient may choose to use it during an appointment, in which case the clinician simply speaks normally — the patient's app handles the rest — but this requires no action or enrollment from the clinician.

---

## 4. System Architecture

### 4.1 High-Level Pipeline

```
Patient Opens App  →  Cultural Profile Loaded  →  Audio Input (Doctor or Recorded Speech)  →  Transcription (Deepgram)  →  Gemini Processing  →  Cultural Adaptation  →  ElevenLabs TTS  →  Patient Hears & Reads
```

### 4.2 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js + Tailwind CSS | Patient-facing UI |
| **Real-Time Audio** | WebSockets + Deepgram Streaming API | Live speech-to-text transcription |
| **AI / NLP** | Google Gemini API (gemini-2.0-flash) | Jargon simplification, translation, cultural adaptation |
| **Voice Output** | ElevenLabs TTS API | Natural, emotionally expressive voice playback |
| **Cloud Infrastructure** | Vultr Cloud GPU | Backend hosting, model inference, low-latency API routing |
| **Database** | MongoDB Atlas | Patient profiles, session history, cultural configurations |
| **Auth** | Clerk / Auth.js | Secure account management |
| **LMS Integration** | Blackboard REST API | Medical education mode, course assignments |

### 4.3 Gemini System Prompt Architecture

Every API call to Gemini is prefaced with a dynamically constructed system prompt that injects the patient's full cultural profile. This is the engine behind the cultural nuance layer.

**System Prompt Template (simplified):**

```
You are ClarityMD, a medical translation and cultural liaison AI.
The patient profile is as follows:

- Name: [First name only]
- Language: Spanish (Mexican dialect preferred)
- Health Literacy: Low — use simple words, short sentences, and everyday analogies
- Cultural Background: Rural Mexican, Catholic, family-centered decision making
- Decision Maker: Patient defers to husband; include family in framing
- Religious Considerations: No pork-derived medications; discuss faith as a
  source of strength if helpful
- Medical Trust: Moderate distrust of Western medicine; acknowledge and
  validate concerns
- Tone: Warm, respectful, unhurried. Never clinical or bureaucratic.

The following medical speech was captured:  [TRANSCRIBED SPEECH]

Translate and adapt this message appropriately for the patient. Do not add
medical information not present in the original. Flag any content that may
need clinician review.
```

---

## 5. Feature Specifications

### 5.1 Real-Time Audio Translation

The patient activates the microphone on their own device to capture speech — whether a doctor speaking during an appointment, a recorded message, or any spoken medical information. ClarityMD transcribes, adapts, and plays back a translated, plain-language version within 1–3 seconds.

| Attribute | Specification |
|---|---|
| **Input** | Patient device microphone — browser-native WebAudio API |
| **Transcription** | Deepgram Nova-2 streaming model via WebSocket — continuous, punctuated output |
| **Processing** | Gemini API with cultural profile injected into system prompt |
| **Output — Audio** | ElevenLabs TTS in patient's preferred language and voice |
| **Output — Text** | Translated text displayed on patient's screen simultaneously |
| **Latency Target** | < 3 seconds end-to-end from end of speech to audio playback start |
| **Supported Languages (MVP)** | Spanish, Mandarin, Vietnamese, Tagalog, Arabic, Portuguese, Hindi, Korean |
| **Fallback** | If audio fails, text output is always displayed |

---

### 5.2 Cultural Nuance Layer

The cultural nuance layer adapts not just the language but the framing, tone, and relational context of medical information. It is powered by the patient's cultural profile, collected at onboarding and editable at any time by the patient.

#### 5.2.1 Cultural Profile Inputs

The following inputs are collected during account setup via a friendly, multi-step onboarding form. Required fields are marked; all others are optional but improve adaptation quality.

| Category | Input Field | Required? |
|---|---|---|
| **Language** | Primary language spoken at home | Yes |
| **Language** | Preferred language for medical information | Yes |
| **Language** | Preferred dialect or regional variant | No |
| **Health Literacy** | Reading ability in preferred language (fluent / some / prefer audio) | Yes |
| **Health Literacy** | Medical terminology familiarity (clinical / plain / very simple) | Yes |
| **Health Literacy** | Preferred explanation complexity (adult / high school / elementary) | No |
| **Cultural Background** | Country of origin / ethnic background | Yes |
| **Cultural Background** | Time in the US (recent arrival / 1–5 yrs / 5+ yrs / born here) | No |
| **Cultural Background** | Familiarity with Western medicine (comfortable / some exposure / traditional medicine background) | No |
| **Religion & Spirituality** | Religious affiliation | No |
| **Religion & Spirituality** | Specific treatment considerations (blood products, pork-derived meds, Sabbath, fasting, end-of-life) | No |
| **Religion & Spirituality** | Openness to faith being referenced in medical conversations | No |
| **Family & Decision-Making** | Who makes medical decisions? (myself / shared / family decides) | Yes |
| **Family & Decision-Making** | Should family be included in adapted messaging? | Yes |
| **Family & Decision-Making** | Primary caregiver / family spokesperson name | No |
| **Family & Decision-Making** | Comfort with direct diagnosis disclosure vs. family first | No |
| **Medical Trust** | Prior healthcare experience (positive / mixed / negative / distrust) | No |
| **Medical Trust** | Known sensitive topics to handle carefully (e.g., mental health stigma, reproductive topics) | No |
| **Medical Trust** | Use of traditional or herbal medicine (yes / no / open to discussion) | No |
| **Communication Style** | Preferred tone (direct / warm and conversational / very gentle and slow) | No |
| **Communication Style** | Preferred output format (voice only / text only / both) | Yes |
| **Accessibility** | Font size preference | No |
| **Accessibility** | Visual or hearing impairment notes | No |

---

### 5.3 Session Conversation History

ClarityMD maintains a full, structured log of each session initiated by the patient. This serves as the patient's personal record of what was communicated and understood.

- Sessions are started and ended by the patient
- Each utterance is stored: original captured speech, simplified English, translated output, and timestamp
- Gemini uses the rolling session history as context — follow-up questions are answered with full awareness of prior discussion
- Patients can view and export their session history in their preferred language
- No real Protected Health Information (PHI) is stored in the MVP — demo uses synthetic patient profiles

---

### 5.4 Medication & Side Effect Explainer

The patient inputs a medication name or reads a prescription label, and ClarityMD generates a plain-language, culturally adapted explanation covering:

- What the medication does in simple terms
- How and when to take it
- What side effects to watch for, and which are normal vs. concerning
- When to call a doctor or go to an emergency room
- Any religious or cultural considerations (e.g., gelatin capsules, alcohol content)

Output is delivered as both text and voice in the patient's language. No clinician input is needed.

---

### 5.5 Patient-Driven Q&A

After receiving translated medical information, the patient can ask follow-up questions by voice or text in their own language. ClarityMD answers in plain language, adapted to the patient's cultural profile.

- Patient voice or text input is accepted in the patient's preferred language
- Gemini responds within the context of the current session history
- All exchanges are logged in session history
- The system is explicitly instructed never to add clinical information beyond what has already been discussed in the session — this is not a medical advice tool

---

### 5.6 Family Consent Toggle

Based on the patient's cultural profile, a family mode can be activated by the patient. In this mode:

- Information framing shifts to include family members in the conversation
- The AI acknowledges the family spokesperson by name if provided
- The patient can toggle this on or off at any time

---

### 5.7 Blackboard / Education Mode

ClarityMD integrates with the Blackboard LMS to serve as a training tool for medical and nursing students. In Education Mode:

- Instructors can assign ClarityMD scenarios to students as coursework
- Students experience medical communication from the patient's perspective and receive AI feedback
- Scenario library includes common clinical communication challenges across diverse patient profiles
- Progress and completion data syncs back to Blackboard gradebook via REST API

---

## 6. UI/UX Requirements

### 6.1 Design Principles

ClarityMD is used by patients who may be stressed, in pain, unfamiliar with technology, or navigating a healthcare system they don't fully trust. The interface must prioritize clarity, accessibility, and trust above all else.

| Principle | Design Implication |
|---|---|
| **Clarity above cleverness** | No animations that delay content. Every screen has one primary action. |
| **Accessible by default** | WCAG 2.1 AA contrast ratios. Minimum 16px body text. Large touch targets (48px+). |
| **Culturally neutral visual design** | No imagery or iconography that skews toward a single cultural context. |
| **Trust signals everywhere** | AI disclaimer visible on every screen. Clear indication of what is AI-generated vs. clinical advice. |
| **Patient-owned interface** | Single screen architecture. The patient is always the operator. No clinician view. |
| **Voice-first** | Interface defaults to large text + audio. Text is supplementary, not primary. |

---

### 6.2 Key Screens

#### Home / Session Screen
- Large, prominent start session button
- Patient profile summary visible (language, key cultural flags)
- Session history panel with past sessions
- Medication explainer quick-access button

#### Active Session Screen
- Live transcription display — what is being captured in real time
- Translated output in large text, delivered simultaneously with audio playback
- Visual waveform indicator during audio playback
- Patient Q&A input — voice or text
- Start/stop controls operated by the patient
- AI disclaimer banner — persistent, non-intrusive

#### Medication Explainer Screen
- Text or voice input for medication name or prescription details
- Plain-language output with cultural adaptation
- Audio playback with visual indicator

#### Onboarding Form
- Multi-step, progress-indicated flow (not a single long form)
- Available in the patient's detected or selected language from step one
- All required fields completable in under 2 minutes
- Optional fields clearly labeled as "helps us serve you better"
- Sensitive fields (religion, medical trust) include a "prefer not to say" option on every question

---

## 7. Ethical Considerations & Compliance

### 7.1 AI Hallucination Risk

> ⚠️ **Critical Disclaimer — Displayed on Every Screen**
>
> ClarityMD is an AI-assisted communication tool. It is not a licensed medical interpreter and does not provide medical advice. All clinical decisions must be made by a qualified healthcare provider. AI-generated translations may contain errors. If you are uncertain about any information, please consult your doctor.

- Gemini is explicitly instructed never to add medical information not present in the captured speech or patient-provided input
- The patient Q&A feature is bounded to session context — ClarityMD will not speculate beyond what has been discussed
- All outputs are logged — patients can review the record at any time

---

### 7.2 HIPAA Posture

Full HIPAA compliance requires business associate agreements (BAAs), encrypted data storage, audit logging, and more — infrastructure that cannot be completed in a hackathon window. ClarityMD's MVP is designed as **HIPAA-ready**:

- No real PHI is stored or transmitted in the MVP — all demo data is synthetic
- Architecture is designed for BAA-compatible API providers (Google Cloud, ElevenLabs enterprise)
- Data encryption at rest and in transit is implemented for all stored session data
- User authentication is required for all sessions
- Full HIPAA compliance is a pre-production milestone, not an MVP requirement

---

### 7.3 Cultural Representation

- Cultural profile inputs are grounded in literature on cultural humility in healthcare
- No cultural profile creates stereotyped outputs — the AI is instructed to treat profiles as context, not prescriptions
- Patients can override any cultural adaptation in real time
- Sensitive categories (religion, medical trust history) are always optional

---

### 7.4 Equity by Design

- ClarityMD is free at point of use for patients
- Audio-first design ensures patients with low literacy can use the tool independently
- Vultr edge deployment minimizes latency for users on lower-bandwidth connections
- No clinician enrollment or approval is required — any patient can access the tool

---

## 8. HackDavis 2026 Track Alignment

| Track | Fit | How ClarityMD Qualifies |
|---|:---:|---|
| **Best Hack for Social Good** *(auto)* | ✅ | Directly addresses healthcare inequity for 25M+ LEP Americans. Patient-owned model gives agency to the most underserved. Life-or-death impact. |
| **Best Interdisciplinary Hack** | ✅ | Integrates medicine, linguistics, cultural studies, public health, and CS. Team includes non-CS majors. |
| **Best AI/ML Hack** | ✅ | Gemini is central — not a wrapper. Dynamic prompt engineering, cultural reasoning, jargon simplification, multilingual NLP. |
| **Best Creative Hack** | ✅ | The cultural nuance layer is the novel insight. No existing tool adapts medical information this way, patient-controlled. |
| **Best UI/UX Hack** | ✅ | Single-screen patient-first architecture designed for clinical stress contexts. Accessibility-first. Voice-first interface. |
| **Best Use of Gemini API** | ✅ | Core intelligence layer — cultural profile injection, simplification, translation, patient Q&A, side effect explanation. |
| **Best Use of ElevenLabs** | ✅ | Voice delivery of every patient-facing output. Emotionally warm tone selection by cultural context. |
| **Best Use of Vultr** | ✅ | Cloud GPU backend for real-time inference. Edge deployment for low-latency access. |
| **Best Use of Blackboard** | ⚠️ | Education mode for medical students. Scenario assignments synced to Blackboard gradebook. Needs API integration work. |

> **Submission Strategy Note:** HackDavis 2026 allows a maximum of 4 track submissions beyond the automatic Social Good consideration. Recommended priority: **AI/ML, ElevenLabs, Interdisciplinary, UI/UX**. Gemini, Creative, Vultr, and Blackboard are strong secondary targets depending on final implementation depth.

---

## 9. MVP Scope & Build Priority

### 9.1 Must Have (Demo Day)

1. Working real-time audio transcription via Deepgram WebSocket (patient-operated)
2. Gemini API integration with cultural profile system prompt injection
3. ElevenLabs voice output in at least 3 languages (Spanish, Mandarin, Vietnamese)
4. Onboarding form capturing all required cultural profile fields (self-serve, patient-facing)
5. Session history display (current session only)
6. Medication / side effect explainer (text input → plain-language output)
7. AI disclaimer visible on every screen
8. Single patient-facing screen (no clinician view)
9. Vultr deployment (not just localhost)

### 9.2 Should Have (If Time Allows)

1. Patient voice Q&A (follow-up questions in patient's language)
2. Family mode toggle
3. 5+ language support
4. Session history persistence across sessions
5. Blackboard education mode (basic)

### 9.3 Won't Have (Post-Hackathon Roadmap)

1. True HIPAA compliance infrastructure
2. EHR / Epic integration
3. Native mobile app
4. Human interpreter escalation workflow
5. Full Blackboard gradebook sync

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **Deepgram latency spikes on demo day** | Test on Vultr-hosted backend, not local network. Prepare text-input fallback. |
| **Gemini API rate limits under load** | Use streaming responses. Cache common jargon simplifications. Apply for higher rate limits. |
| **ElevenLabs voice sounds robotic in some languages** | Pre-test all target languages. Select voice models per language. Use multilingual v2 model. |
| **Cultural profile stereotyping in AI outputs** | Gemini system prompt explicitly instructs treating profiles as context, not deterministic rules. Include patient override. |
| **Blackboard API integration complexity** | Scope Blackboard to a simple scenario assignment display if REST API is complex. Prioritize other tracks. |
| **Medical accuracy concerns from judges** | Lead with the disclaimer. Frame as a patient communication aid, not a clinical tool. Emphasize human clinician is always present in a real appointment. |
| **Patient misuse as medical advice tool** | Strict session-bounding in Gemini instructions. Clear UI copy distinguishing translation from advice. |

---

## Appendix: Glossary

| Term | Definition |
|---|---|
| **LEP** | Limited English Proficiency — individuals who do not speak English as their primary language and have limited ability to read, speak, write, or understand English |
| **Cultural Humility** | A framework for cross-cultural clinical communication that emphasizes ongoing self-reflection and patient-centered adaptation, beyond static cultural competency checklists |
| **TTS** | Text-to-Speech — technology that converts written text to spoken audio |
| **PHI** | Protected Health Information — any information about health status, healthcare provision, or payment that can be linked to an individual, regulated under HIPAA |
| **HIPAA** | Health Insurance Portability and Accountability Act — US federal law governing the privacy and security of medical information |
| **BAA** | Business Associate Agreement — a HIPAA-required contract between a covered entity and a vendor who handles PHI |
| **WebSocket** | A protocol enabling persistent, bidirectional communication between browser and server — essential for real-time audio streaming |
| **Gemini** | Google's large language model family, used in ClarityMD for translation, simplification, and cultural adaptation |
| **ElevenLabs** | AI voice synthesis platform providing realistic, multilingual, emotionally expressive text-to-speech |
| **Vultr** | Cloud infrastructure provider offering GPU-accelerated compute used for ClarityMD's backend and AI inference |
| **Patient-Owned Tool** | A tool operated entirely by the patient, requiring no clinician enrollment, setup, or participation |

---

*ClarityMD — HackDavis 2026 | Team ClarityMD | CONFIDENTIAL*
*v1.1 — Updated to reflect patient-owned model. Clinician is not a user or operator.*
