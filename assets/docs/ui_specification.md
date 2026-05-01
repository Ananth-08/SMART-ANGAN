# UI Specification: SmartAngan App

## Tech Stack
- **Framework:** React Native (Expo/CLI)
- **Database:** SQLite (Offline-First)
- **Language:** TypeScript
- **Styling:** Premium UI with a focus on accessibility and high contrast.

## 1. Login Screen
- **Purpose:** Secure access for Anganwadi Workers.
- **UI Elements:**
    - Logo and App Name (SmartAngan).
    - Staff ID / Username input.
    - Password input (Secure text entry).
    - Login Button.
- **Logic:** 
    - Hardcoded password with local encryption (AES or similar) stored in the app.
    - No "Forgot Password" for the prototype.
    - Offline authentication against local SQLite store.

## 2. Home Screen (Dashboard)
- **Purpose:** Daily overview and quick actions.
- **UI Elements:**
    - **Welcome Header:** "Welcome, [Staff Name]!" with current date/time.
    - **Attendance Stats Card:** 
        - Total students enrolled.
        - Present today.
        - Absent today.
        - Progress bar for the 8-hour shift.
    - **Quick Actions:** Buttons for "Mark Attendance", "Add Student", "Growth Entry".
- **Logic:** 
    - Real-time updates of stats from SQLite.

## 3. Attendance Page
- **Purpose:** Daily attendance logging.
- **UI Elements:**
    - List of students with Present/Absent toggles.
    - **Auto-populated Hour:** Current hour (1-8) automatically selected based on system time.
    - "Submit Attendance" button.
- **Logic:** 
    - Auto-detection of the current hour slot.
    - Offline storage of attendance records.

## 4. Absent Students List
- **Purpose:** Tracking missing children for follow-ups.
- **UI Elements:**
    - Filterable list of students marked "Absent" for the day.
    - Action buttons: "Call Parent", "Send WhatsApp".

## 5. Student Management (Onboarding & Profiles)
- **Purpose:** Enrollment and historical health tracking.
- **Features:**
    - **Class Enrollment:** Ability to select/assign a class/batch.
    - **Student Onboarding Form:**
        - Basic Details: Name, Age, DOB, Gender.
        - Communication: Mother/Father name, Phone number.
        - Physicals: Height (cm), Weight (kg).
        - Guardian/Emergency contacts.
    - **Growth History:**
        - List of monthly H/W updates.
        - **WHO Z-Score Engine:** Automatic classification (Normal, MAM - Moderate Acute Malnutrition, SAM - Severe Acute Malnutrition, Overweight).
        - Visualization: Mini growth chart.
    - **Nutrition Module:** Tracking provided supplements/meals.

## 6. Message Trigger (Communication)
- **Purpose:** Notifying parents.
- **Features:**
    - **Individual Messaging:** Send specific health updates to a student's guardian.
    - **Bulk Messaging:** Send announcements to the entire class/batch (e.g., "Meeting tomorrow").
    - Integration: WhatsApp or SMS API (mocked for prototype).

## 7. QR Code Module
- **Purpose:** Identification and quick check-in.
- **Features:**
    - Generate a unique QR code for each student based on their ID.
    - "Print ID Card" preview showing QR, Name, and Photo.

## 8. Settings & Multi-language
- **Purpose:** Localization.
- **Options:**
    - Language Switcher: **English** and **Tamil**.
    - Sync Status: Check last sync with the "Pi Hub".
    - Logout.

---

## Design Aesthetics (Premium Focus)
- **Color Palette:** Professional Greens and Earthy tones (reflecting healthcare and growth).
- **Typography:** Clear, readable fonts (e.g., Outfit or Inter).
- **Interactions:** Smooth transitions between screens, micro-animations for success states (e.g., when a measurement is saved).
- **Accessibility:** Large touch targets and high-contrast text for outdoor use.
