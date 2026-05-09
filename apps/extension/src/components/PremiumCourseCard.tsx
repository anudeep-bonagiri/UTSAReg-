import React from 'react';
import { Star, CheckCircle2, Calendar, Bookmark } from 'lucide-react';
import GradeChart from './GradeChart';

interface PremiumCourseCardProps {
    course: any;
    onAdd: () => void;
    onSave: () => void;
}

const PremiumCourseCard: React.FC<PremiumCourseCardProps> = ({ course, onAdd, onSave }) => {
    // Mock data for the premium look
    const rating = 4.5;
    const reviews = 114;
    const enrollment = { current: 72, max: 80 };
    const mockGrades = { A: 40, B: 30, C: 15, D: 10, F: 5, W: 8 };

    return (
        <div className="glass-card animate-premium p-5 space-y-4 border-l-4 border-l-utsa-orange">
            <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Course Detail</span>
                <h2 className="text-lg font-bold text-white leading-tight">
                    {course.subject} {course.courseNumber} - {course.title}
                </h2>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-utsa-orange to-orange-600 flex items-center justify-center border-2 border-white/20 shadow-lg overflow-hidden">
                        <img
                            src={`https://ui-avatars.com/api/?name=${course.instructor}&background=F15A22&color=fff`}
                            alt={course.instructor}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">{course.instructor}</p>
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center text-utsa-orange">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-xs font-black ml-1">{rating}</span>
                            </div>
                            <span className="text-[10px] text-white/40">• {reviews} reviews</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 block">Section</span>
                    <span className="text-sm font-bold text-white">{course.section}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 text-white/70 text-xs bg-white/5 p-2 rounded-lg border border-white/5">
                <Calendar className="w-3.5 h-3.5 text-utsa-orange" />
                <span>TTh 11:00 AM - 12:15 PM (NPB 1.120)</span>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] uppercase font-bold text-white/40">Grade Distribution</span>
                    </div>
                    <div className="h-[80px]">
                        <GradeChart data={mockGrades} />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Enrollment</span>
                            <span className="text-xs font-bold text-white">{enrollment.current}/{enrollment.max} seats</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            <span className="text-[10px] font-bold uppercase">Open</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={onAdd}
                            className="w-full bg-utsa-orange text-white text-xs font-bold py-2 rounded-xl shadow-lg shadow-utsa-orange/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Add to Schedule
                        </button>
                        <button
                            onClick={onSave}
                            className="w-full bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold py-2 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <Bookmark className="w-3.5 h-3.5" />
                            Save Course
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumCourseCard;
