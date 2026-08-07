import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ItemRating } from '../types';
import {
  X,
  Star,
  CheckCircle2,
  Trash2,
  User,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Filter,
  ThumbsUp,
  Award,
  Zap,
  ShoppingBag,
  Plus
} from 'lucide-react';
import { getStoredRatings, saveRatings } from '../lib/ratings';
import { broadcastNotification } from '../lib/messaging';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    category?: string;
    image?: string;
    priceUSD?: number;
    priceSYP?: number;
  } | null;
  onRatingsUpdated?: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  item,
  onRatingsUpdated
}) => {
  const { language } = useLanguage();

  const [ratings, setRatings] = useState<ItemRating[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form State
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [authorName, setAuthorName] = useState<string>('');
  const [authorRole, setAuthorRole] = useState<'customer' | 'visitor' | 'buyer'>('buyer');
  const [commentText, setCommentText] = useState<string>('');
  const [hoverStar, setHoverStar] = useState<number>(0);

  // Filter rating filter
  const [starFilter, setStarFilter] = useState<number>(0); // 0 = all

  useEffect(() => {
    if (isOpen) {
      const all = getStoredRatings();
      setRatings(all);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentItemRatings = item
    ? ratings.filter((r) => r.itemId === item.id)
    : ratings;

  const filteredRatings = starFilter > 0
    ? currentItemRatings.filter((r) => r.rating === starFilter)
    : currentItemRatings;

  // Average calculation
  const totalCount = currentItemRatings.length;
  const avgScore = totalCount > 0
    ? (currentItemRatings.reduce((a, b) => a + b.rating, 0) / totalCount).toFixed(1)
    : '5.0';

  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleAddRating = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!commentText.trim()) {
      setErrorMessage(
        language === 'ar'
          ? '⚠️ إجباري: يجب كتابة سبب وتفاصيل التقييم للحفظ والمتابعة.'
          : '⚠️ Required: You must enter a reason/feedback explaining your rating.'
      );
      return;
    }

    const newRatingItem: ItemRating = {
      id: `rat-${Date.now()}`,
      itemId: item ? item.id : 'general',
      itemTitle: item ? item.title : 'أداة / قطعة كهربائية عامة',
      itemCategory: item?.category || 'tools',
      rating: selectedStars,
      comment: commentText.trim(),
      authorName: authorName.trim() || (language === 'ar' ? 'زائر OMS' : 'OMS Visitor'),
      authorRole: authorRole,
      createdAt: language === 'ar' ? 'الآن' : 'Just now'
    };

    const updated = [newRatingItem, ...ratings];
    setRatings(updated);
    saveRatings(updated);

    // Reset Form
    setCommentText('');
    setAuthorName('');
    setShowAddForm(false);

    // Broadcast Notification
    broadcastNotification({
      title: language === 'ar' ? 'تقييم جديد للسلعة/الأداة الكهربائية ⭐️' : 'New Product Rating Added ⭐️',
      body: language === 'ar'
        ? `قام (${newRatingItem.authorName}) بوضع تقييم ${selectedStars} نجوم على: "${newRatingItem.itemTitle}".`
        : `${newRatingItem.authorName} rated ${selectedStars} stars on "${newRatingItem.itemTitle}".`,
      category: 'system',
      type: 'system'
    });

    if (onRatingsUpdated) {
      onRatingsUpdated();
    }
  };

  const handleDeleteRating = (ratingId: string) => {
    const updated = ratings.filter((r) => r.id !== ratingId);
    setRatings(updated);
    saveRatings(updated);

    if (onRatingsUpdated) {
      onRatingsUpdated();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4 max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Gold Border */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-2xl">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'تقييمات الزوار والعملاء المشتريين' : 'Visitor & Customer Ratings'}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  {totalCount} {language === 'ar' ? 'تقييم' : 'Reviews'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">
                {item
                  ? item.title
                  : (language === 'ar' ? 'جميع تقييمات الأدوات والقطع الكهربائية والمنتجات' : 'All tool & product reviews')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary Card */}
        {item && (
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-xl border border-slate-800 shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl flex items-center justify-center shrink-0 font-bold">
                  OMS
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-0.5">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= Math.round(Number(avgScore))
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold font-mono">{avgScore} / 5</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إضافة تقييمك ✍️' : 'Add Rating ✍️'}</span>
            </button>
          </div>
        )}

        {/* Add Rating Form Dropdown */}
        {showAddForm && (
          <form onSubmit={handleAddRating} className="bg-slate-950 border border-amber-500/40 p-3.5 rounded-2xl space-y-3 shrink-0 text-xs animate-fadeIn">
            <div className="font-bold text-white border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>{language === 'ar' ? 'اكتب تقييمك وتجربتك للسلعة/الأداة:' : 'Write your rating & experience:'}</span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                {language === 'ar' ? 'تقييم معتمد' : 'Verified Review'}
              </span>
            </div>

            {/* Star Picker */}
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-bold">{language === 'ar' ? 'حدد عدد النجوم:' : 'Select Stars:'}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => setSelectedStars(star)}
                    className="p-1 text-slate-700 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverStar || selectedStars)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Author Name & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">{language === 'ar' ? 'اسمك أو لقبك' : 'Your Name'}</label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'مثال: المهندس أحمد' : 'e.g. Eng. Ahmad'}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">{language === 'ar' ? 'صفة صاحب التقييم' : 'Reviewer Role'}</label>
                <select
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="buyer">{language === 'ar' ? 'مشتري معتمد للسلعة 🛒' : 'Verified Buyer 🛒'}</option>
                  <option value="customer">{language === 'ar' ? 'عميل جرب الأداة 🛠️' : 'Customer 🛠️'}</option>
                  <option value="visitor">{language === 'ar' ? 'زائر ومطلع 👤' : 'Visitor 👤'}</option>
                </select>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-2.5 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 font-bold text-[11px] animate-fadeIn flex items-center gap-1.5">
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Comment Text / Rating Reason (Mandatory) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <span>{language === 'ar' ? 'سبب التقييم وتفاصيل التجربة:' : 'Reason for rating & feedback:'}</span>
                </label>
                <span className="text-[10px] bg-red-500/20 text-red-400 font-black px-2 py-0.5 rounded-full border border-red-500/30">
                  {language === 'ar' ? 'إجباري *' : 'Mandatory *'}
                </span>
              </div>
              <textarea
                rows={3}
                required
                minLength={3}
                placeholder={
                  language === 'ar'
                    ? 'اكتب سبب التقييم إجبارياً (مثال: جودة القطعة ممتازة، التعامل راقي، تم التسليم بالموعد...)'
                    : 'Mandatory: Explain the reason for your rating (e.g. excellent quality, fast delivery...)'
                }
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-white focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                {language === 'ar' ? 'حفظ ونشر التقييم ⭐️' : 'Submit Rating ⭐️'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        )}

        {/* Filter Ratings by Star */}
        <div className="flex items-center justify-between gap-2 bg-slate-950 p-2 border border-slate-800 rounded-2xl text-xs shrink-0">
          <span className="text-slate-400 font-bold px-1">{language === 'ar' ? 'تصفية حسب النجوم:' : 'Filter Ratings:'}</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setStarFilter(0)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                starFilter === 0 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'All'}
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                onClick={() => setStarFilter(s)}
                className={`px-2 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  starFilter === s ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{s}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Ratings List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 scrollbar-none">
          {filteredRatings.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-2xl space-y-2">
              <Star className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-bold text-xs">
                {language === 'ar' ? 'لا توجد تقييمات مطابقة لهذه الفئة بعد' : 'No ratings found for this filter'}
              </p>
            </div>
          ) : (
            filteredRatings.map((rat) => (
              <div
                key={rat.id}
                className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-2 text-xs relative group hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{rat.authorName}</span>
                        {rat.authorRole === 'buyer' && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                            {language === 'ar' ? 'مشتري معتمد 🛒' : 'Verified Buyer'}
                          </span>
                        )}
                        {rat.authorRole === 'customer' && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-bold">
                            {language === 'ar' ? 'عميل 🛠️' : 'Customer'}
                          </span>
                        )}
                        {rat.authorRole === 'visitor' && (
                          <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-bold">
                            {language === 'ar' ? 'زائر 👤' : 'Visitor'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">{rat.createdAt}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl text-amber-400 font-mono font-bold text-xs gap-1">
                      <span>{rat.rating}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>

                    <button
                      onClick={() => handleDeleteRating(rat.id)}
                      title={language === 'ar' ? 'حذف التقييم' : 'Remove rating'}
                      className="p-1 bg-slate-900 hover:bg-rose-950 hover:text-rose-400 text-slate-500 rounded-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  "{rat.comment}"
                </p>

                {!item && rat.itemTitle && (
                  <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-900 pt-1.5">
                    <span className="truncate max-w-[250px]">{language === 'ar' ? `السلعة: ${rat.itemTitle}` : `Item: ${rat.itemTitle}`}</span>
                    <span className="text-amber-400 font-bold">{rat.itemCategory || 'أدوات'}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'ar' ? 'تظل التقييمات محفوظة ومتاحة للاطلاع الدائم لحين حذفها' : 'Ratings remain stored for public reference until removed'}</span>
        </div>

      </div>
    </div>
  );
};
