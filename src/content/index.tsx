import React from 'react';
import { createRoot } from 'react-dom/client';
import { scrapeAsapResults } from '../utils/scraper';
import CourseDetailsPopup from '../components/CourseDetailsPopup';
import '../styles/main.css';

console.log('UTSA Registration Plus: Content Script Initialized');

const App: React.FC = () => {
    const [activeCourse, setActiveCourse] = React.useState<any>(null);

    React.useEffect(() => {
        // This effect runs on mount to inject the initial buttons
        const courses = scrapeAsapResults();

        if (courses.length > 0) {
            const rows = document.querySelectorAll('.datadisplaytable tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length > 10) {
                    const crn = cells[1]?.textContent?.trim();
                    const course = courses.find(c => c.crn === crn);

                    if (course && !row.querySelector('.utsa-reg-plus-btn-container')) {
                        const instructorCell = cells[16];
                        if (instructorCell && course.instructor !== 'TBA') {
                            const container = document.createElement('span');
                            container.className = 'utsa-reg-plus-btn-container inline-flex ml-2';

                            const btn = document.createElement('button');
                            btn.className = 'bg-[#032044] hover:bg-utsa-orange text-white text-[9px] px-2 py-1 rounded-md transition-all duration-300 font-bold shadow-lg border border-white/10 flex items-center gap-1 group';
                            btn.innerHTML = `
                <span class="opacity-70 group-hover:opacity-100 italic">R+</span>
                <span>Details</span>
              `;
                            btn.onclick = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveCourse(course);
                            };

                            container.appendChild(btn);
                            instructorCell.appendChild(container);
                        }
                    }
                }
            });
        }
    }, []);

    if (!activeCourse) return null;

    return (
        <CourseDetailsPopup
            course={activeCourse}
            onClose={() => setActiveCourse(null)}
        />
    );
};

// Inject the React root for the popup overlays
const rootDiv = document.createElement('div');
rootDiv.id = 'utsa-reg-plus-root';
document.body.appendChild(rootDiv);
createRoot(rootDiv).render(<App />);
