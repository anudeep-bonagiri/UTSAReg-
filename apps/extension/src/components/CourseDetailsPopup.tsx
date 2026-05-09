import React, { useState, useEffect } from 'react';
import { X, Star, FileText, BarChart2, Calendar, Save } from 'lucide-react';
import { saveCourse } from '../utils/storage';
import GradeChart from './GradeChart';

interface CourseDetailsPopupProps {
    course: any;
    onClose: () => void;
}

const CourseDetailsPopup: React.FC<CourseDetailsPopupProps> = ({ course, onClose }) => {
    const [rating, setRating] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showGrades, setShowGrades] = useState(false);

    const mockGrades = { A: 35, B: 30, C: 15, D: 5, F: 5, W: 10 };

    useEffect(() => {
        // Simulate API fetch for professor rating
        const timer = setTimeout(() => {
            setRating({ score: 4.2, count: 18, url: '#' });
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, [course]);

    const handleSave = async () => {
        setIsSaving(true);
        await saveCourse(course);
        setTimeout(() => {
            setIsSaving(false);
            onClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 font-sans">
            <div className="bg-white w-[500px] max-h-[85vh] overflow-hidden rounded-xl shadow-2xl flex flex-col border border-utsa-blue animation-fade-in">
                {/* Header */}
                <header className="bg-utsa-blue text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-utsa-orange p-1.5 rounded-lg">
                            <BarChart2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-tight">{course.subject} {course.courseNumber}</h2>
                            <p className="text-xs opacity-80">{course.title} • Section {course.section}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </header>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-utsa-limestone bg-opacity-30">
                    {/* Professor Section */}
                    <section className="bg-white p-4 rounded-lg shadow-sm border border-utsa-concrete">
                        <h3 className="text-sm font-bold text-utsa-blue uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Star className="w-4 h-4 text-utsa-orange" />
                            Instructor: {course.instructor}
                        </h3>

                        {loading ? (
                            <div className="animate-pulse flex space-x-4">
                                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <span className="text-3xl font-black text-utsa-blue">{rating?.score}</span>
                                        <span className="text-sm text-gray-500 block">/ 5.0</span>
                                    </div>
                                    <div className="h-10 w-[1px] bg-gray-200"></div>
                                    <div className="text-xs text-gray-600">
                                        <p className="font-bold">Very Good</p>
                                        <p>{rating?.count} reviews</p>
                                    </div>
                                </div>
                                <a
                                    href={rating?.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-utsa-orange text-sm font-bold hover:underline flex items-center gap-1"
                                >
                                    View on RMP <X className="w-3 h-3 rotate-45" />
                                </a>
                            </div>
                        )}
                    </section>

                    {/* Visualization Section */}
                    {showGrades && (
                        <section className="bg-white p-4 rounded-lg shadow-sm border border-utsa-orange animation-slide-down">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-bold text-utsa-blue uppercase tracking-widest">Historical Grade Distribution</h3>
                                <button onClick={() => setShowGrades(false)} className="text-[10px] text-utsa-orange font-bold uppercase hover:underline">Close</button>
                            </div>
                            <GradeChart data={mockGrades} />
                            <p className="text-[9px] text-gray-400 mt-2 italic text-center text-balance">Data based on the last 3 regular semesters for this instructor.</p>
                        </section>
                    )}

                    {/* Quick Links */}
                    <section className="grid grid-cols-2 gap-4">
                        <a
                            href={`https://utsa.simplesyllabus.com/en-US/syllabus-library?query=${course.subject}%20${course.courseNumber}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-utsa-concrete hover:border-utsa-orange hover:bg-utsa-limestone transition-all group no-underline"
                        >
                            <FileText className="w-6 h-6 text-utsa-blue group-hover:text-utsa-orange mb-2" />
                            <span className="text-sm font-bold text-utsa-blue">View Syllabi</span>
                            <span className="text-[10px] text-gray-500">Historical Archive</span>
                        </a>
                        <button
                            onClick={() => setShowGrades(!showGrades)}
                            className={`flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm border ${showGrades ? 'border-utsa-orange bg-utsa-limestone' : 'border-utsa-concrete'} hover:border-utsa-orange hover:bg-utsa-limestone transition-all group`}
                        >
                            <BarChart2 className="w-6 h-6 text-utsa-blue group-hover:text-utsa-orange mb-2" />
                            <span className="text-sm font-bold text-utsa-blue">Grade Distribution</span>
                            <span className="text-[10px] text-gray-500">See A-F History</span>
                        </button>
                    </section>

                    {/* Course Details */}
                    <section className="bg-white p-4 rounded-lg shadow-sm border border-utsa-concrete">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Schedule Info</h3>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <div>
                                <p className="text-gray-500 text-[10px] uppercase">Days & Time</p>
                                <p className="font-medium text-utsa-blue">{course.days} {course.time}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-[10px] uppercase">Location</p>
                                <p className="font-medium text-utsa-blue">{course.room}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-[10px] uppercase">CRN</p>
                                <p className="font-medium text-utsa-blue tracking-widest">{course.crn}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-[10px] uppercase">Credits</p>
                                <p className="font-medium text-utsa-blue">{course.credits} hrs</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <footer className="p-4 bg-white border-t border-utsa-concrete flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex-1 bg-utsa-orange text-white font-bold py-2 rounded-lg shadow-md hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Course'}
                    </button>
                    <button className="flex-1 bg-utsa-blue text-white font-bold py-2 rounded-lg shadow-md hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" /> View Schedule
                    </button>
                </footer>
            </div>

            <style>{`
        .animation-fade-in { animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
        </div>
    );
};

export default CourseDetailsPopup;
