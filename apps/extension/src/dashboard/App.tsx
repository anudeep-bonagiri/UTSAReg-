import React, { useState } from 'react';
import SearchHeader from '../components/SearchHeader';
import PremiumCourseCard from '../components/PremiumCourseCard';
import { Search, Calendar, Bookmark, LayoutDashboard, Database, User, LogOut } from 'lucide-react';

import coursesData from '../assets/courses.json';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'explore' | 'schedule' | 'saved'>('explore');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCourses =
        searchQuery.length > 0
            ? (coursesData as any[])
                  .filter(
                      (c) =>
                          c.CRN.includes(searchQuery) ||
                          `${c.Subject} ${c['Course Number']}`
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                          c.Title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 10)
            : [];

    return (
        <div className="flex h-screen w-screen bg-[#032044] text-white overflow-hidden font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-64 glass-card m-4 mr-0 flex flex-col border-r-0 rounded-r-none">
                <div className="p-8">
                    <h1 className="text-2xl font-black tracking-tighter">
                        <span className="text-utsa-orange">UTSA</span>
                        <span className="text-white ml-2 italic">Reg+</span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold mt-1">
                        Student Command Center
                    </p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { id: 'explore', icon: Search, label: 'Course Explorer' },
                        { id: 'schedule', icon: Calendar, label: 'Weekly Schedule' },
                        { id: 'saved', icon: Bookmark, label: 'Saved Courses' },
                        { id: 'analytics', icon: Database, label: 'Data Registry' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                activeTab === item.id
                                    ? 'bg-utsa-orange text-white shadow-lg shadow-utsa-orange/20'
                                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm font-bold">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-utsa-orange flex items-center justify-center font-bold">
                                JS
                            </div>
                            <div>
                                <p className="text-sm font-bold leading-none">Justin Smith</p>
                                <p className="text-[10px] text-white/40 mt-1">Computer Science</p>
                            </div>
                        </div>
                        <button className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                            <LogOut className="w-3 h-3" /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="glass-card flex-1 flex flex-col overflow-hidden">
                    <SearchHeader onSearch={setSearchQuery} />

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/10">
                        {activeTab === 'explore' && (
                            <div className="max-w-4xl mx-auto space-y-8">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h2 className="text-3xl font-black text-white">
                                            Course Explorer
                                        </h2>
                                        <p className="text-white/40 text-sm mt-1">
                                            Search through 4,000+ classes with live RMP and Grade
                                            data.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {['Undergraduate', 'Face-to-Face', 'No Conflicts'].map(
                                            (filter) => (
                                                <span
                                                    key={filter}
                                                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/60"
                                                >
                                                    {filter}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                {searchQuery.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredCourses.length > 0 ? (
                                            filteredCourses.map((course) => (
                                                <PremiumCourseCard
                                                    key={course.CRN}
                                                    course={{
                                                        crn: course.CRN,
                                                        subject: course.Subject,
                                                        courseNumber: course['Course Number'],
                                                        section: course.Section,
                                                        title: course.Title,
                                                        instructor: course.Instructor
                                                    }}
                                                    onAdd={() => console.log('Add')}
                                                    onSave={() => console.log('Save')}
                                                />
                                            ))
                                        ) : (
                                            <div className="col-span-full py-20 text-center space-y-4 opacity-40">
                                                <Search className="w-12 h-12 mx-auto text-utsa-orange" />
                                                <p className="text-sm font-medium">
                                                    No courses found matching "{searchQuery}"<br />
                                                    (Search currently limited to CS)
                                                </p>
                                            </div>
                                        )}
                                        {filteredCourses.length > 0 && (
                                            <div className="glass-card p-6 flex flex-col items-center justify-center text-center space-y-4 border-dashed opacity-50">
                                                <LayoutDashboard className="w-12 h-12 text-utsa-orange" />
                                                <p className="text-sm font-medium">
                                                    Select more classes to compare
                                                    <br />
                                                    workload and instructor quality.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
                                        {[
                                            {
                                                icon: LayoutDashboard,
                                                label: 'Trend Analysis',
                                                desc: 'See which sections are filling up fast this term.'
                                            },
                                            {
                                                icon: User,
                                                label: 'Top Rated',
                                                desc: 'Faculty with 4.8+ ratings for your major.'
                                            },
                                            {
                                                icon: Database,
                                                label: 'Grade History',
                                                desc: 'Courses with historical 40%+ A-Grade distributions.'
                                            }
                                        ].map((box, i) => (
                                            <div
                                                key={i}
                                                className="glass-card p-8 space-y-4 hover:bg-white/5 transition-colors cursor-pointer group"
                                            >
                                                <box.icon className="w-8 h-8 text-utsa-orange group-hover:scale-110 transition-transform" />
                                                <h3 className="font-bold text-lg">{box.label}</h3>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    {box.desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'schedule' && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40">
                                <Calendar className="w-24 h-24 text-utsa-orange" />
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black">
                                        Desktop Schedule Visualizer
                                    </h2>
                                    <p className="text-sm">
                                        The full-screen weekly calendar is currently in the forge.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
