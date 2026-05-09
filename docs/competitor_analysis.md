# Competitor Analysis: UT Registration Plus

Analysis based on the [Longhorn-Developers/UT-Registration-Plus](https://github.com/Longhorn-Developers/UT-Registration-Plus) repository.

## 🏗 Architecture

- **Framework**: React 18 + Vite.
- **Language**: TypeScript.
- **Manifest Version**: V3.
- **Data Handling**: Uses `sql.js` (WebAssembly SQLite) to query course data locally from a downloaded `.db` file.

## ✨ Core Features to Replicate

1.  **Course Breakdown Overlay**: A React-injected popup that appears directly on the registration portal.
2.  **Visual Schedule Builder**: A weekly calendar view in the extension popup.
3.  **Conflict Highlighting**: Crossing out courses that overlap with currently saved ones.
4.  **Grade Visualization**: Historical A-F bar charts for instructors.
5.  **Exporter**: Exporting schedules to ICS (iCal) and high-quality images.

## 📝 Key Takeaways for UTSA implementation

- **Injection Strategy**: Use a persistent sidecar container or portal-based injection to avoid breaking the host site's layout.
- **Communication**: Use clear messaging between `content` and `background` scripts for fetching external data like RateMyProfessor scores.
