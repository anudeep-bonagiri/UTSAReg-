# Technical Research - UTSA Ecosystem

## 🌐 Target Data Sources

### 1. UTSA Registration (ASAP)
*   **URL**: `asap.utsa.edu`
*   **Structure**: Table-based legacy layout.
*   **Key Fields**: CRN, Subject, Course Number, Instructor, Days/Time, Room, Status.
*   **DOM Strategy**: Need to parse `table.datadisplaytable` rows using positional indices since unique IDs are sparse.

### 2. UTSA Course Catalog
*   **URL**: `catalog.utsa.edu`
*   **Structure**: Well-structured semantic HTML.
*   **Key Fields**: Course Description, Prerequisites (parsed from text), Credit Hours.

### 3. Syllabi (Simple Syllabus)
*   **URL**: `utsa.simplesyllabus.com/en-US/syllabus-library`
*   **Functionality**: Public library searchable by CRN or Instructor. Extension will link directly to these results.

### 4. Grade Distributions
*   **Source**: UTSA Bluebook and Office of Institutional Research (OIR).
*   **Format**: PDF/Excel reports.
*   **Extension Integration**: We will pre-process this data into a compressed JSON cache for fast local lookup (matching Instructor + Course).

## 🛠 Extension Permissions (Manifest V3)
*   `scripting`: For injecting React root and buttons.
*   `activeTab`: To access current page data.
*   `storage`: For saving user schedules and preferences.
*   **Host Permissions**: `*://asap.utsa.edu/*`, `*://catalog.utsa.edu/*`, `*://utsa.simplesyllabus.com/*`.
