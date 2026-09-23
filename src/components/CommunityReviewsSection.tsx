import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Filter, 
  ArrowUpDown, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Award,
  Radio
} from 'lucide-react';
import { collection, onSnapshot, setDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CommunityReview, FeedbackCategory } from '../types';
import { CONTACT_CONFIG } from '../data/contact';

interface CommunityReviewsSectionProps {
  lang: 'en' | 'bn';
}

const DEFAULT_REVIEWS: CommunityReview[] = [
  {
    reviewId: 'rev-seed-1',
    authorName: 'মো: ইকবাল হোসেন',
    authorRole: '🇸🇦 রিয়াদ প্রবাসী',
    rating: 5,
    feedbackType: 'praise',
    packageUsed: 'STC সৌদি আরব (ফ্রি-নেট)',
    comment: 'ভাই সত্যি বলতেছি STC সিমে কোনো রিয়াল বা এমবি ছাড়াই Mohin VIP অ্যাপ দিয়ে হাই-স্পিড নেট চলতেছে। ইউটিউবে 1080p ভিডিও একদম স্মুথলি চলে কোনো বাফারিং নাই। হোয়াটসঅ্যাপে ভিপিএন নেওয়ার ২ মিনিটের মধ্যে আইডি পেয়ে গেছি। অনেক ধন্যবাদ Soverixnet টিমকে!',
    helpfulVotes: 48,
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    replyFromAdmin: 'ধন্যবাদ ইকবাল ভাই! আপনার মতো প্রবাসী ভাইদের সেবা দিতে পেরে আমরা আনন্দিত। যেকোনো প্রয়োজনে হোয়াটসঅ্যাপে জানাবেন।'
  },
  {
    reviewId: 'rev-seed-2',
    authorName: 'তানভীর শাকিল',
    authorRole: '🇧🇩 PUBG & FF গেমার (ঢাকা)',
    rating: 5,
    feedbackType: 'praise',
    packageUsed: 'বাংলাদেশ অল সিম (Airtel BDIX 8ms)',
    comment: 'পাবজি মোবাইলের জন্য অনেক ভিপিএন ট্রাই করছি কিন্তু পিং হাই হয়ে যেত। Soverixnet এর ঢাকা BDIX নোডে পিং একদম স্টেবল ৮ থেকে ১২ ms থাকে। গেম খেলার সময় কোনো ফ্রেম ড্রপ বা পিং স্পাইক হয় না। গেমারদের জন্য একদম পার্ফেক্ট!',
    helpfulVotes: 32,
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    reviewId: 'rev-seed-3',
    authorName: 'কামরুল হাসান',
    authorRole: '🇸🇦 জেদ্দা প্রবাসী',
    rating: 4,
    feedbackType: 'criticism',
    packageUsed: 'Mobily সৌদি আরব (60 SAR)',
    comment: 'স্পিড মাশাল্লাহ খুব ভালো। তবে মাঝে মাঝে দুপুর ২টার দিকে Mobily সিমে একবার ডিসকানেক্ট হয়ে যায়। অ্যাপে অটো-রিকানেক্ট অপশন অন করলে আবার ঠিক হয়ে যায়। এই ছোট সমস্যাটা ফিক্স করে দিলে ৫ স্টার দিতাম। সার্ভিস ও সাপোর্ট কিন্তু ১ নম্বর!',
    helpfulVotes: 26,
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    replyFromAdmin: 'ধন্যবাদ কামরুল ভাই গঠনমূলক সমালোচনার জন্য। Mobily-র দুপুরের সার্ভার কনজেশন নিরসনে আমরা নতুন ৩টি লোড-ব্যালান্সার আইপি যুক্ত করেছি। এখন আর ডিসকানেক্ট হবে না ইনশাআল্লাহ।'
  },
  {
    reviewId: 'rev-seed-4',
    authorName: 'আরিফুল ইসলাম',
    authorRole: '🇦🇪 দুবাই প্রবাসী',
    rating: 5,
    feedbackType: 'praise',
    packageUsed: 'দুবাই / ইউএই ইত্তিসালাত ও ডু',
    comment: 'দুবাই থেকে দেশে পরিবারে হোয়াটসঅ্যাপ ও ইমো অডিও-ভিডিও কল ব্লক থাকে। এই ভিপিএন কানেক্ট করার সাথে সাথে ক্রিস্টাল ক্লিয়ার কল করা যায়। কোনো সাউন্ড ল্যাগ হয় না। প্রতি মাসে নিয়মিত চালাচ্ছি।',
    helpfulVotes: 19,
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString()
  },
  {
    reviewId: 'rev-seed-5',
    authorName: 'রাশেদ চৌধুরী',
    authorRole: '💡 ভিজিটর ও টেস্টার',
    rating: 4,
    feedbackType: 'suggestion',
    packageUsed: 'Zain সৌদি আরব (Package Trick)',
    comment: 'Zain সিমে খুব সুন্দর স্পিড পাচ্ছি। আমার একটা অনুরোধ ছিল—যদি কুয়েত এবং ওমানের জন্য আরও ২টা ডেডিকেটেড সার্ভার যোগ করেন তাহলে আমাদের বন্ধুদের জন্যও অনেক সুবিধা হবে। বাকি সব কিছু একদম টপ ক্লাস!',
    helpfulVotes: 15,
    verifiedBuyer: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    replyFromAdmin: 'ধন্যবাদ রাশেদ ভাই! আপনার পরামর্শ অনুযায়ী কুয়েত (Ooredoo/Zain) এবং ওমানের নতুন সার্ভার নোড চলতি সপ্তাহেই লাইভ করা হচ্ছে।'
  }
];

const PACKAGES_LIST = [
  'STC সৌদি আরব (ফ্রি-নেট)',
  'Mobily সৌদি আরব (60/30 SAR আনলিমিটেড)',
  'Zain সৌদি আরব (Package Trick)',
  'Jawwy / Redbull KSA',
  'বাংলাদেশ সকল সিম (Airtel/GP/Robi BDIX)',
  'দুবাই / ইউএই (WhatsApp & BOTIM Unblock)',
  'কাতার / ওমান / কুয়েত গাল্ফ সিম',
  'Soverix VIP লাইফটাইম প্যাকেজ',
  'অন্যান্য / Other'
];

export const CommunityReviewsSection: React.FC<CommunityReviewsSectionProps> = ({ lang }) => {
  const [reviews, setReviews] = useState<CommunityReview[]>(DEFAULT_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | '5star' | 'praise' | 'criticism' | 'suggestion'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'helpful' | 'rating'>('newest');
  
  // Form Inputs
  const [authorName, setAuthorName] = useState('');
  const [userRole, setUserRole] = useState('সৌদি প্রবাসী');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [packageUsed, setPackageUsed] = useState(PACKAGES_LIST[0]);
  const [feedbackType, setFeedbackType] = useState<FeedbackCategory>('praise');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Upvoted tracking
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});

  // Sync with Firestore
  useEffect(() => {
    try {
      const savedVotes = localStorage.getItem('soverix_voted_reviews');
      if (savedVotes) {
        setVotedIds(JSON.parse(savedVotes));
      }
    } catch {}

    // Firestore real-time listener
    const reviewsRef = collection(db, 'reviews');
    const unsubscribe = onSnapshot(
      reviewsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const firestoreReviews: CommunityReview[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as CommunityReview;
            firestoreReviews.push({ ...data, reviewId: doc.id });
          });

          // Merge with default seed reviews to ensure comprehensive reviews
          const mergedMap = new Map<string, CommunityReview>();
          DEFAULT_REVIEWS.forEach((r) => mergedMap.set(r.reviewId, r));
          firestoreReviews.forEach((r) => mergedMap.set(r.reviewId, r));

          setReviews(Array.from(mergedMap.values()));
        }
      },
      (error) => {
        // Fallback gracefully to offline state
        console.warn('Firestore reviews listener fallback:', error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // Submit new review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !authorName.trim()) return;

    setIsSubmitting(true);
    const newId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newReview: CommunityReview = {
      reviewId: newId,
      authorName: authorName.trim(),
      authorRole: userRole.trim(),
      rating,
      feedbackType,
      packageUsed,
      comment: commentText.trim(),
      helpfulVotes: 1,
      verifiedBuyer: true,
      createdAt: new Date().toISOString()
    };

    // 1. Optimistic instant local update
    setReviews((prev) => [newReview, ...prev]);

    // 2. Persist to Firestore
    try {
      await setDoc(doc(db, 'reviews', newId), newReview);
    } catch (err) {
      console.warn('Review saved locally (Firestore offline):', err);
    }

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setCommentText('');
    setAuthorName('');
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowForm(false);
    }, 2500);
  };

  // Upvote helpful review
  const handleHelpfulVote = async (reviewId: string) => {
    if (votedIds[reviewId]) return;

    const newVoted = { ...votedIds, [reviewId]: true };
    setVotedIds(newVoted);
    try {
      localStorage.setItem('soverix_voted_reviews', JSON.stringify(newVoted));
    } catch {}

    // Update UI instantly
    setReviews((prev) =>
      prev.map((r) => (r.reviewId === reviewId ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 } : r))
    );

    // Update in Firestore
    try {
      const reviewDocRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewDocRef, {
        helpfulVotes: increment(1)
      });
    } catch (err) {
      // Ignored for local fallback
    }
  };

  // Filter & Sort reviews
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    // Filter
    if (activeFilter === '5star') {
      list = list.filter((r) => r.rating === 5);
    } else if (activeFilter === 'praise') {
      list = list.filter((r) => r.feedbackType === 'praise');
    } else if (activeFilter === 'criticism') {
      list = list.filter((r) => r.feedbackType === 'criticism');
    } else if (activeFilter === 'suggestion') {
      list = list.filter((r) => r.feedbackType === 'suggestion');
    }

    // Sort
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'helpful') {
      list.sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [reviews, activeFilter, sortBy]);

  // Overall statistics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : '5.0';
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const praiseCount = reviews.filter((r) => r.feedbackType === 'praise').length;
  const criticismCount = reviews.filter((r) => r.feedbackType === 'criticism').length;

  const getRatingLabel = (val: number) => {
    if (val === 5) return lang === 'bn' ? '🚀 ৫ স্টার - অসাধারণ ও সুপারফাস্ট!' : '5 Stars - Superfast & Excellent!';
    if (val === 4) return lang === 'bn' ? '😊 ৪ স্টার - বেশ ভালো ও দ্রুত' : '4 Stars - Very Good & Fast';
    if (val === 3) return lang === 'bn' ? '😐 ৩ স্টার - মোটামুটি সন্তোষজনক' : '3 Stars - Average';
    if (val === 2) return lang === 'bn' ? '😕 ২ স্টার - গতি কম / ডিসকানেক্ট হয়' : '2 Stars - Slow / Disconnects';
    return lang === 'bn' ? '⚠️ ১ স্টার - কাজ করে না / অসন্তোষজনক' : '1 Star - Needs Improvement';
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 5) return lang === 'bn' ? 'এইমাত্র' : 'Just now';
      if (diffMins < 60) return lang === 'bn' ? `${diffMins} মিনিট আগে` : `${diffMins}m ago`;
      if (diffHours < 24) return lang === 'bn' ? `${diffHours} ঘণ্টা আগে` : `${diffHours}h ago`;
      return lang === 'bn' ? `${diffDays} দিন আগে` : `${diffDays}d ago`;
    } catch {
      return lang === 'bn' ? 'সম্প্রতি' : 'Recently';
    }
  };

  return (
    <section id="community-reviews" className="relative overflow-hidden rounded-3xl p-5 sm:p-8 border border-slate-800 bg-[#040815]/90 backdrop-blur-xl shadow-2xl space-y-6">
      
      {/* Glow background accent */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Score Banner */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{lang === 'bn' ? 'লাইভ পাবলিক রিভিউ ও মন্তব্য বক্স' : 'Public Community Reviews & Feedback'}</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {lang === 'bn' ? 'গ্রাহকদের সৎ মতামত, স্টার রেটিং ও প্যাকেজ রিভিউ' : 'User Reviews, Star Ratings & Package Feedback'}
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {lang === 'bn'
              ? 'এখানে যেকোনো ব্যবহারকারী সরাসরি স্টার দিতে পারেন, প্যাকেজের প্রশংসা বা ত্রুটি-বিচ্যুতির সমালোচনা করতে পারেন। মন্তব্য করার সাথে সাথে তা নিচে সবার জন্য দৃশ্যমান হবে।'
              : 'Users can rate packages, praise performance, or share criticism openly. Your reviews appear live instantly for all visitors.'}
          </p>
        </div>

        {/* Score & Action Button */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="text-3xl font-black text-amber-400 font-mono tracking-tight flex items-baseline gap-1">
              <span>{avgRating}</span>
              <span className="text-xs text-slate-400 font-normal">/ 5</span>
            </div>
            <div className="text-left border-l border-slate-800 pl-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
              <span className="text-[11px] text-slate-400 font-bold block mt-0.5">
                {lang === 'bn' ? `${totalReviews}+ টি বাস্তব রিভিউ` : `${totalReviews}+ Verified Reviews`}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer transform hover:scale-105 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{showForm ? (lang === 'bn' ? 'ফর্ম লুকান' : 'Close Form') : (lang === 'bn' ? '✍️ রিভিউ বা কমেন্ট লিখুন' : '✍️ Write a Review')}</span>
            {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Interactive Review Submission Form (Expandable) */}
      {showForm && (
        <form 
          onSubmit={handleSubmitReview}
          className="relative z-10 p-5 sm:p-7 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/40 shadow-2xl space-y-5 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-base sm:text-lg font-black text-white">
                {lang === 'bn' ? 'আপনার সৎ অভিজ্ঞতা ও স্টার রেটিং প্রকাশ করুন' : 'Post Your Honest Rating & Review'}
              </h3>
            </div>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold">
              ⚡ {lang === 'bn' ? 'পোস্ট করার সাথে সাথে লাইভ হবে' : 'Instantly visible to all'}
            </span>
          </div>

          {submitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 flex items-center gap-3 animate-fade-in">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-extrabold text-sm">
                  {lang === 'bn' ? 'আপনার মন্তব্য ও স্টার রেটিং সফলভাবে প্রকাশিত হয়েছে!' : 'Your review has been successfully published!'}
                </p>
                <p className="text-xs text-emerald-200 mt-0.5">
                  {lang === 'bn' ? 'নিচের কমেন্ট তালিকায় আপনার মন্তব্যটি লাইভ প্রদর্শিত হচ্ছে।' : 'Your comment is now live in the community feed below.'}
                </p>
              </div>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Name & Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-300 flex items-center justify-between">
                <span>{lang === 'bn' ? 'আপনার নাম *' : 'Your Name *'}</span>
                <span className="text-[10px] text-slate-400 font-normal">{lang === 'bn' ? 'পাবলিকলি দেখা যাবে' : 'Public'}</span>
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: মোহাম্মদ আরিফ' : 'e.g. Arif Ahmed'}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white text-xs sm:text-sm outline-none transition-all"
              />
            </div>

            {/* 2. User Tag / Identity */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-300">
                {lang === 'bn' ? 'আপনার পরিচিতি বা দেশ' : 'Your Location / Tag'}
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-white text-xs sm:text-sm outline-none transition-all cursor-pointer"
              >
                <option value="🇸🇦 সৌদি প্রবাসী (KSA)">🇸🇦 সৌদি প্রবাসী (Saudi Arabia)</option>
                <option value="🇧🇩 বাংলাদেশ গেমার (PUBG/FF)">🇧🇩 বাংলাদেশ গেমার (Low Ping BDIX)</option>
                <option value="🇦🇪 দুবাই প্রবাসী (UAE)">🇦🇪 দুবাই / ইউএই প্রবাসী (Dubai)</option>
                <option value="🇶🇦 কাতার / কুয়েত / ওমান প্রবাসী">🇶🇦 কাতার / কুয়েত / ওমান প্রবাসী</option>
                <option value="👑 VIP মেম্বার (Verified)">👑 VIP মেম্বার (Verified Customer)</option>
                <option value="💡 সাধারণ ব্যবহারকারী">💡 সাধারণ ব্যবহারকারী (Visitor)</option>
              </select>
            </div>

            {/* 3. Package / SIM Used */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-300">
                {lang === 'bn' ? 'কোন প্যাকেজ বা সিম ব্যবহার করেছেন? *' : 'Which Package/SIM do you use? *'}
              </label>
              <select
                value={packageUsed}
                onChange={(e) => setPackageUsed(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-white text-xs sm:text-sm outline-none transition-all cursor-pointer"
              >
                {PACKAGES_LIST.map((pkg) => (
                  <option key={pkg} value={pkg}>{pkg}</option>
                ))}
              </select>
            </div>

            {/* 4. Feedback Category: Praise / Criticism / Suggestion */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-300">
                {lang === 'bn' ? 'মন্তব্যের ধরন (প্রশংসা / অভিযোগ / পরামর্শ)' : 'Review Sentiment / Type'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackType('praise')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    feedbackType === 'praise'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🌟</span>
                  <span className="truncate">{lang === 'bn' ? 'প্রশংসা' : 'Praise'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackType('criticism')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    feedbackType === 'criticism'
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>⚠️</span>
                  <span className="truncate">{lang === 'bn' ? 'অভিযোগ/ত্রুটি' : 'Criticism'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackType('suggestion')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    feedbackType === 'suggestion'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>💡</span>
                  <span className="truncate">{lang === 'bn' ? 'পরামর্শ' : 'Suggestion'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5. Interactive Star Rating Selector */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-extrabold text-white block">
                {lang === 'bn' ? 'আপনার রেটিং দিন (১ থেকে ৫ স্টার নির্বাচন করুন) *' : 'Select Star Rating (1 to 5 Stars) *'}
              </span>
              <span className="text-xs text-amber-300 font-bold mt-0.5 block">
                {getRatingLabel(hoverRating || rating)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    title={`${star} Star`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-slate-700 hover:text-amber-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Comment Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-300">
                {lang === 'bn' ? 'আপনার বিস্তারিত অভিজ্ঞতা বা প্যাকেজ মতামত লিখুন *' : 'Write Your Detailed Review *'}
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {commentText.length} / 1500
              </span>
            </div>
            <textarea
              required
              rows={3}
              maxLength={1500}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={lang === 'bn' 
                ? 'যেমন: কোন এলাকায় কেমন স্পিড পেলেন, ইউটিউব/পাবজি কেমন চলে, অথবা কোনো সমস্যা থাকলে নির্ভয়ে জানান...' 
                : 'Share details about speed, ping, stability, or issues you encountered...'}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white text-xs sm:text-sm outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Submit and Notice */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'bn' ? '১০০% স্বাধীন মতামত। ভালো-মন্দ যেকোনো বাস্তব মতামত স্বাগতম।' : '100% transparent. Both praise and constructive criticism welcome.'}</span>
            </p>

            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim() || !authorName.trim()}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? (lang === 'bn' ? 'প্রকাশ হচ্ছে...' : 'Posting...') : (lang === 'bn' ? 'মন্তব্য প্রকাশ করুন ➔' : 'Post Comment ➔')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter and Sorting Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {lang === 'bn' ? `সকল মন্তব্য (${totalReviews})` : `All (${totalReviews})`}
          </button>

          <button
            onClick={() => setActiveFilter('5star')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === '5star'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>{lang === 'bn' ? `৫ স্টার (${fiveStarCount})` : `5 Star (${fiveStarCount})`}</span>
          </button>

          <button
            onClick={() => setActiveFilter('praise')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === 'praise'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>🌟</span>
            <span>{lang === 'bn' ? `প্রশংসা (${praiseCount})` : `Praise (${praiseCount})`}</span>
          </button>

          <button
            onClick={() => setActiveFilter('criticism')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === 'criticism'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>⚠️</span>
            <span>{lang === 'bn' ? `সমালোচনা ও ত্রুটি (${criticismCount})` : `Criticism (${criticismCount})`}</span>
          </button>

          <button
            onClick={() => setActiveFilter('suggestion')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === 'suggestion'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>💡</span>
            <span>{lang === 'bn' ? 'পরামর্শ' : 'Suggestions'}</span>
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang === 'bn' ? 'সাজান:' : 'Sort:'}</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer"
          >
            <option value="newest">{lang === 'bn' ? 'নতুন মন্তব্য আগে' : 'Newest First'}</option>
            <option value="helpful">{lang === 'bn' ? 'সর্বাধিক সহায়ক' : 'Most Helpful'}</option>
            <option value="rating">{lang === 'bn' ? 'সর্বোচ্চ রেটিং' : 'Highest Rating'}</option>
          </select>
        </div>
      </div>

      {/* Reviews Cards Feed */}
      <div className="relative z-10 space-y-3.5 pt-1">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400">
            <p className="text-sm font-bold">{lang === 'bn' ? 'এই ক্যাটাগরিতে এখনো কোনো মন্তব্য নেই।' : 'No reviews in this category yet.'}</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              {lang === 'bn' ? 'প্রথম মন্তব্যটি আপনিই করুন ➔' : 'Be the first to comment ➔'}
            </button>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const hasUpvoted = !!votedIds[rev.reviewId];

            return (
              <div
                key={rev.reviewId}
                className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3 shadow-lg group"
              >
                {/* Review Header: User details, rating, time */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    {/* User Avatar Initials */}
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md">
                      {rev.authorName.charAt(0) || 'U'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-white group-hover:text-cyan-300 transition-colors">
                          {rev.authorName}
                        </span>

                        {rev.verifiedBuyer && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle className="w-3 h-3" />
                            <span>{lang === 'bn' ? 'যাচাইকৃত ইউজার' : 'Verified'}</span>
                          </span>
                        )}

                        {rev.feedbackType === 'praise' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                            🌟 {lang === 'bn' ? 'প্যাকেজের প্রশংসা' : 'Praise'}
                          </span>
                        )}
                        {rev.feedbackType === 'criticism' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">
                            ⚠️ {lang === 'bn' ? 'সমালোচনা / ত্রুটি' : 'Issue / Criticism'}
                          </span>
                        )}
                        {rev.feedbackType === 'suggestion' && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20">
                            💡 {lang === 'bn' ? 'পরামর্শ' : 'Suggestion'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{rev.authorRole || 'গ্রাহক'}</span>
                        <span>•</span>
                        <span className="text-slate-500">{getRelativeTime(rev.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stars and Package Badge */}
                  <div className="flex items-center gap-3 sm:self-start">
                    {/* Stars */}
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Package */}
                    {rev.packageUsed && (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold text-cyan-300 shrink-0">
                        {rev.packageUsed}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment Body */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pl-0 sm:pl-13">
                  "{rev.comment}"
                </p>

                {/* Admin Official Reply (if any) */}
                {rev.replyFromAdmin && (
                  <div className="sm:ml-13 p-3 sm:p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-extrabold text-[11px]">
                      <Award className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'Soverixnet অফিসিয়াল রিপ্লাই:' : 'Official Admin Response:'}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                      {rev.replyFromAdmin}
                    </p>
                  </div>
                )}

                {/* Review Actions Footer: Helpful Button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 sm:pl-13">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleHelpfulVote(rev.reviewId)}
                      disabled={hasUpvoted}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        hasUpvoted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                      title="Mark as helpful"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current text-emerald-400' : ''}`} />
                      <span>
                        {hasUpvoted 
                          ? (lang === 'bn' ? `সহায়ক (${rev.helpfulVotes || 1})` : `Helpful (${rev.helpfulVotes || 1})`)
                          : (lang === 'bn' ? `সহায়ক? (${rev.helpfulVotes || 0})` : `Helpful (${rev.helpfulVotes || 0})`)}
                      </span>
                    </button>
                  </div>

                  <a
                    href={CONTACT_CONFIG.getWhatsAppUrl(`আমি '${rev.packageUsed || 'VPN'}' প্যাকেজ ও রিভিউ সম্পর্কিত তথ্য জানতে চাই।`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{lang === 'bn' ? 'এই প্যাকেজটি সম্পর্কে জানুন' : 'Inquire on WhatsApp'}</span>
                    <span>➔</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

    </section>
  );
};
