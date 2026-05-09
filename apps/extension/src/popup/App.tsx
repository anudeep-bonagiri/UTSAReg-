import React, { useState, useEffect } from 'react';
import SearchHeader from '../components/SearchHeader';
import PremiumCourseCard from '../components/PremiumCourseCard';
import { getSavedCourses, removeCourse, saveCourse } from '../utils/storage';
import { Calendar, Bookmark, Search, Trash2, LayoutDashboard } from 'lucide-react';

import coursesData from '../assets/courses.json';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'schedule' | 'explore' | 'saved'>('explore');
    const [searchQuery, setSearchQuery] = useState('');
    const [savedCourses, setSavedCourses] = useState<any[]>([]);

    const filteredCourses = searchQuery.length > 0
        ? (coursesData as any[]).filter(c =>
            c.CRN.includes(searchQuery) ||
            `${c.Subject} ${c["Course Number"]}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.Title.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
        : [];

    useEffect(() => {
        loadSaved();
    }, [activeTab]);

    const loadSaved = async () => {
        const courses = await getSavedCourses();
        setSavedCourses(courses);
    };

    const handleSave = async (course: any) => {
        await saveCourse(course);
        loadSaved();
        setActiveTab('saved');
    };

    const handleRemove = async (crn: string) => {
        await removeCourse(crn);
        loadSaved();
    };

    return (
        <div className="min-h-[550px] flex flex-col font-sans select-none overflow-hidden bg-[#032044]">
            <SearchHeader onSearch={setSearchQuery} />

            {/* Tabs */}
            <nav className="flex px-5 border-b border-white/5 bg-black/10">
                {[
                    { id: 'schedule', icon: Calendar, label: 'Schedule' },
                    { id: 'explore', icon: Search, label: 'Explore' },
                    { id: 'saved', icon: Bookmark, label: 'Saved' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 text-sm font-bold transition-all relative flex items-center justify-center gap-2 ${activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-utsa-orange' : ''}`} />
                        <span className="text-[10px] uppercase tracking-widest">{tab.label}</span>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-utsa-orange shadow-[0_-2px_10px_rgba(241,90,34,0.5)]" />
                        )}
                    </button>
                ))}
            </nav>

            {/* Content Area */}
            <main className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                {activeTab === 'explore' && (
                    <div className="space-y-4">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <PremiumCourseCard
                                    key={course.CRN}
                                    course={{
                                        crn: course.CRN,
                                        subject: course.Subject,
                                        courseNumber: course["Course Number"],
                                        section: course.Section,
                                        title: course.Title,
                                        instructor: course.Instructor
                                    }}
                                    onAdd={() => console.log('Add to Schedule')}
                                    onSave={() => handleSave({
                                        crn: course.CRN,
                                        subject: course.Subject,
                                        courseNumber: course["Course Number"],
                                        section: course.Section,
                                        title: course.Title,
                                        instructor: course.Instructor
                                    })}
                                />
                            ))
                        ) : searchQuery.length > 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                                <Search className="w-12 h-12 text-utsa-orange" />
                                <p className="text-sm font-medium">No courses found matching "{searchQuery}"<br />(Search currently limited to CS)</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                                <Search className="w-12 h-12 text-utsa-orange" />
                                <p className="text-sm font-medium">Search for your next class<br />to see the magic happen.</p>
                            </div>
                        )}

                        {/* Quick Suggestions */}
                        {searchQuery.length === 0 && (
                            <div className="pt-10 space-y-3">
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Quick Suggestions</p>
                                <div className="flex flex-wrap gap-2">
                                    {['CS 3443', 'MAT 1214', 'IS 1403', 'CS 3843'].map(tag => (
                                        <button key={tag} onClick={() => setSearchQuery(tag)} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all">
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="space-y-3">
                        {savedCourses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                                <Bookmark className="w-12 h-12" />
                                <p className="text-sm font-medium">No saved courses yet.</p>
                            </div>
                        ) : (
                            savedCourses.map((course) => (
                                <div key={course.crn} className="glass-card p-4 flex items-center justify-between group animate-premium">
                                    <div>
                                        <h3 className="text-sm font-bold text-white">{course.subject} {course.courseNumber}</h3>
                                        <p className="text-[10px] text-white/40">{course.title} • {course.instructor}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(course.crn)}
                                        className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="glass-card p-6 text-center space-y-6">
                        <div className="relative inline-block">
                            <Calendar className="w-16 h-16 mx-auto text-utsa-orange opacity-20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-utsa-orange animate-ping" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-white">Visual Schedule Upgrading</h3>
                            <p className="text-xs text-white/40 leading-relaxed">The schedule engine is being re-designed for our new premium visuals. Check back soon for the visual outlook.</p>
                        </div>
                        <button className="w-full bg-utsa-orange/20 border border-utsa-orange/30 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-utsa-orange hover:bg-utsa-orange/30 transition-all">
                            Sync ASAP Data
                        </button>
                    </div>
                )}
            </main>

            <footer className="p-4 text-center border-t border-white/5 bg-black/40 flex items-center justify-between">
                <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">UTSA Reg+ v1.2.0</p>
                <button
                    onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') })}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all group"
                >
                    Dashboard <LayoutDashboard className="w-3 h-3 text-utsa-orange group-hover:scale-110 transition-transform" />
                </button>
            </footer>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
        </div>
    );
};

export default App;
