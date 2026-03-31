import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import Footer from '../../components/student/Footer';
import { assets } from '../../assets/assets';

const QuizPage = () => {
    const { courseId } = useParams();
    const { backendUrl, token, user, navigate } = useContext(AppContext);
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchQuizzes();
        window.scrollTo(0, 0);
    }, [courseId]);

    const fetchQuizzes = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/quiz/course/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setQuizzes(data.quizzes);
            }
        } catch (error) {
            toast.error('Failed to load quizzes');
        }
        setLoading(false);
    };

    const startQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setAnswers(new Array(quiz.questions.length).fill(-1));
        setResult(null);
        window.scrollTo(0, 0);
    };

    const handleAnswer = (questionIndex, optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        const unanswered = answers.filter(a => a === -1).length;
        if (unanswered > 0) {
            if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
        }

        setSubmitting(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/quiz/submit`, {
                quizId: selectedQuiz._id,
                answers
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (data.success) {
                setResult(data.result);
                toast.success('Quiz submitted!');
            }
        } catch (error) {
            toast.error('Failed to submit quiz');
        }
        setSubmitting(false);
        window.scrollTo(0, 0);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0C132B] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-white/40 font-black uppercase text-[10px] tracking-widest animate-pulse">Syncing Question Bank...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* High-Impact Header */}
            <div className="bg-[#0C132B] pt-40 pb-24 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                <div className="container mx-auto px-6 md:px-12 lg:px-24相对 z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div>
                            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-indigo-400 hover:text-white mb-6 uppercase text-[10px] font-black tracking-widest transition-all group">
                                <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Course
                            </button>
                            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 leading-none">Knowledge Assessment</h1>
                            <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest leading-none">Demonstrate your mastery across {quizzes.length} available evaluations</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 md:px-12 lg:px-24 -mt-12 relative z-20 pb-32">
                {!selectedQuiz ? (
                    /* Elegant Quiz Selection */
                    <div className="space-y-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Select Path</span>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Available Quizzes</h2>
                        </div>

                        {quizzes.length === 0 ? (
                            <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 p-24 text-center border border-gray-50">
                                <div className="text-7xl mb-10 opacity-20 grayscale">📜</div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Assessments pending</h3>
                                <p className="text-gray-400 font-medium max-w-sm mx-auto uppercase text-[10px] tracking-widest leading-relaxed">The instructor has not deployed any knowledge gates for this course yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {quizzes.map((quiz) => (
                                    <div key={quiz._id} className="bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-gray-200/40 border border-gray-50 hover:shadow-indigo-500/10 transition-all duration-500 group">
                                        <div className="flex flex-col h-full justify-between">
                                            <div>
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:bg-indigo-500 group-hover:text-white transition-all">📝</div>
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-indigo-500 transition-colors">{quiz.title}</h3>
                                                <div className="flex items-center gap-4 mb-8">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{quiz.questions.length} Knowledge Checks</p>
                                                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">MIN Score: {quiz.passingScore || 50}%</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => startQuiz(quiz)}
                                                className="w-full bg-[#0C132B] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-black/10 group/btn"
                                            >
                                                Initiate Assessment <span className="ml-2 group-hover/btn:translate-x-1 inline-block transition-transform">→</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : result ? (
                    /* Premium Results Experience */
                    <div className="max-w-3xl mx-auto bg-white rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.05)] p-16 md:p-24 text-center border border-gray-50 relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mt-32"></div>

                        <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl ${result.percentage >= 70 ? 'bg-emerald-50 text-emerald-500 shadow-emerald-500/20' : result.percentage >= 40 ? 'bg-amber-50 text-amber-500 shadow-amber-500/20' : 'bg-rose-50 text-rose-500 shadow-rose-500/20'}`}>
                            <span className="text-5xl">{result.percentage >= 70 ? '🏆' : result.percentage >= 40 ? '⚖️' : '📖'}</span>
                        </div>

                        <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">Assessment Concluded</h2>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-16">{selectedQuiz.title}</p>

                        <div className="grid grid-cols-2 gap-8 mb-16">
                            <div className="bg-gray-50/50 rounded-[2rem] p-10 border border-gray-100">
                                <p className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{result.score}/{result.totalQuestions}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Questions Correct</p>
                            </div>
                             <div className={`rounded-[2rem] p-10 border ${result.isPassed ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                                <p className={`text-4xl font-black tracking-tighter mb-1 ${result.isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>{result.percentage}%</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{result.isPassed ? 'Mastery Verified' : 'Mastery Pending'}</p>
                            </div>
                        </div>

                        <div className="mb-12">
                            <h3 className={`text-2xl font-black tracking-tight ${result.isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {result.isPassed ? 'Verification Successful' : 'Verification Denied'}
                            </h3>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">
                                {result.isPassed ? 'You have officially mastered this curriculum unit.' : 'Minimum competency threshold not met. Additional study recommended.'}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={() => startQuiz(selectedQuiz)} className="btn-primary px-12 py-5">
                                Realize Higher Score
                            </button>
                            <button onClick={() => { setSelectedQuiz(null); setResult(null); }} className="bg-gray-50 text-gray-900 border border-gray-100 px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:shadow-xl transition-all">
                                Return to List
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Focused High-Stakes Assessment Interface */
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-[#0C132B] p-8 rounded-[2.5rem] text-white">
                            <div>
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">Live Engagement</span>
                                <h1 className="text-xl font-black tracking-tight">{selectedQuiz.title}</h1>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Progress</p>
                                    <p className="text-sm font-black">{answers.filter(a => a !== -1).length} / {selectedQuiz.questions.length}</p>
                                </div>
                                <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full transition-all duration-700" style={{ width: `${(answers.filter(a => a !== -1).length / selectedQuiz.questions.length) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {selectedQuiz.questions.map((question, qIndex) => (
                                <div key={qIndex} className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-gray-200/40 border border-gray-50 hover:shadow-indigo-500/10 transition-all duration-500">
                                    <div className="flex gap-6 mb-10">
                                        <span className="w-10 h-10 bg-indigo-50 rounded-xl flex-shrink-0 flex items-center justify-center text-indigo-500 text-[10px] font-black">
                                            {String(qIndex + 1).padStart(2, '0')}
                                        </span>
                                        <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-tight">{question.questionText}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {question.options.map((option, oIndex) => (
                                            <label
                                                key={oIndex}
                                                className={`flex items-center justify-between gap-6 p-6 rounded-2xl border-2 cursor-pointer transition-all ${answers[qIndex] === oIndex
                                                    ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10'
                                                    : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-200'
                                                    }`}
                                            >
                                                <span className={`text-xs font-black transition-colors ${answers[qIndex] === oIndex ? 'text-indigo-600' : 'text-gray-500'}`}>{option}</span>
                                                <input
                                                    type="radio"
                                                    name={`q-${qIndex}`}
                                                    checked={answers[qIndex] === oIndex}
                                                    onChange={() => handleAnswer(qIndex, oIndex)}
                                                    className="hidden"
                                                />
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${answers[qIndex] === oIndex ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`}>
                                                    {answers[qIndex] === oIndex && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-20 p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                            <button
                                onClick={() => { setSelectedQuiz(null); setResult(null); }}
                                className="text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-colors"
                            >
                                Terminate Session
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-[#0C132B] text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-black/10 disabled:opacity-50 min-w-[240px]"
                            >
                                {submitting ? 'Transmitting Data...' : 'Finalize and Submit'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default QuizPage;
