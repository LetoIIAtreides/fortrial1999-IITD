# AAROGYA LINK — Rule-Based Trust Scoring Engine

## 1. Overview
The trust engine scores emergency reports on a scale of 0 to 100 without automated rejections, blocks, or deletions. A human responder always makes the final decision. Requests are never labeled "false"; instead, requests with lower scores remain visible with clear indicators ("Needs review" or "Low confidence") to assist responder prioritization.

## 2. Score Categories & Thresholds
- **Likely genuine**: Score >= 70 (Strong evidence, multiple independent witnesses, or live geotagged capture)
- **Needs review**: Score 40 to 69 (Single unverified report, unknown impact boundary, or plausible need)
- **Low confidence**: Score < 40 (Location outside impact area, unverified device, or high plausibility disparity)

## 3. Weighting & Verification Rules

| Check | Input Evaluated | Maximum Points | Description |
|---|---|---|---|
| **Location in Impact Zone** | Report GPS vs GeoJSON Impact Polygon | +25 pts | Verifies if report coordinates fall within an active flood/disaster impact band |
| **Live Media Capture** | Live photo / audio timestamp agreement with server | +25 pts | Confirms photo/voice was captured inside the app with GPS & server time concordance |
| **Independent Reports** | Distinct devices within 200m & 30 min | +25 pts | Corroborating incident reports from separate community members |
| **Device History & Fingerprint** | Device age, reports in last hour, prior outcomes | +15 pts | Established community devices with positive history receive full confidence |
| **Plausibility Check** | Requested quantity vs people affected | +10 pts | Flags non-standard ratios (e.g. 500 vials requested for 1 person) |

## 4. AI-Assisted Modules (Backend Integration)
AI checks are strictly advisory and labeled "AI-assisted".
- **Visual Depth Estimation**: Estimates flood water depth (ankle, knee, waist, overhead) from live photo.
- **Category Verification**: Verifies photo relevance to chosen emergency category.
- **Voice Transcription**: Automated transcription of voice notes for responders.
- **Rule of Operation**: If AI service is unconfigured or unavailable, the status explicitly reads **"Not checked"**. AI never assigns a "false" label or automatically closes tickets.
