# Problem Statement: SmartAngan

## Context
Anganwadi centres under the Integrated Child Development Services (ICDS) system are the frontline of child and maternal healthcare in India. Currently, these centres rely heavily on manual, paper-based processes to record vital health data.

## The Problem
The traditional paper-based methods face several critical issues:
1. **Inaccuracy & Errors:** Manual data entry is highly susceptible to human error, leading to unreliable health records.
2. **Delayed Reporting:** The time-consuming nature of physical registers means data reaches supervisors late, hindering early detection of malnutrition (SAM/MAM).
3. **Inefficiency:** Frontline Workers (AWWs) face an overwhelming workload due to redundant data entry across multiple registers.
4. **Digital Divide:** Existing digital solutions often fail in rural areas due to poor internet connectivity and complex, non-user-friendly interfaces.
5. **Lack of Transparency:** Parents often have no visibility into their child's growth progress, leading to low trust and engagement with the Anganwadi system.

## The Solution: SmartAngan
SmartAngan is designed to be an **Offline-First Digital Health Platform** that empowers Anganwadi Workers with easy-to-use tools for real-time data capture and local processing.

### Core Pillars
- **Smart Measurement System:** Using BLE scales and camera-based height measurement (OCR/AR) to eliminate manual entry errors.
- **Parent Trust & Engagement:** Providing instant feedback to parents via "Health Passports" (WhatsApp/SMS) or physical cards.
- **Zero-Tech Inclusion:** Ensuring even parents without smartphones stay informed through IVR calls and printed reports.
- **Decentralisation:** A resilient system that works 100% offline, syncing to a local hub (Raspberry Pi) and eventually to the cloud.
- **Growth Intelligence:** Instant WHO Z-score calculation to identify SAM (Severe Acute Malnutrition) and MAM (Moderate Acute Malnutrition) cases in seconds.

## Objective
To build a scalable, reliable, and user-friendly React Native application that operates seamlessly in low-connectivity environments, ensuring every child's growth is tracked accurately and every parent is engaged in their child's health journey.
