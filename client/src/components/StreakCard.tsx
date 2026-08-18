import React from "react";
import { CalendarDays, Flame, Trophy } from "lucide-react";

type StreakCardProps = {
  currentStreak: number;
  longestStreak: number;
  isAuthenticated: boolean;
};

function encouragement(currentStreak: number, isAuthenticated: boolean) {
  if (!isAuthenticated) return "سجّل الدخول ليبدأ حفظ سلسلة إنجازاتك اليومية.";
  if (currentStreak === 0) return "ابدأ اليوم بدرس أو تمرين لتشعل سلسلتك.";
  if (currentStreak === 1) return "بداية ممتازة. عُد غدًا للحفاظ على السلسلة.";
  if (currentStreak < 7) return "استمر، كل يوم تعلم يقربك من إنجاز جديد.";
  return "سلسلة رائعة! حافظ على وقت تعلمك اليومي.";
}

export function StreakCard({ currentStreak, longestStreak, isAuthenticated }: StreakCardProps) {
  const activeDays = Math.min(currentStreak, 7);
  return <article className="streak-card" aria-label={`سلسلة الإنجازات اليومية: ${currentStreak} أيام`}>
    <div className="streak-card__head"><span className="streak-icon"><Flame size={20} /></span><span>سلسلة الإنجازات</span><strong>{currentStreak} يوم{currentStreak === 1 ? "" : ""}</strong></div>
    <div className="streak-days" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <span key={index} className={index < activeDays ? "streak-day streak-day--active" : "streak-day"} />)}</div>
    <p>{encouragement(currentStreak, isAuthenticated)}</p>
    <div className="streak-card__foot"><span><CalendarDays size={13} /> نشاط اليوم</span><span><Trophy size={13} /> أفضل سلسلة: {longestStreak}</span></div>
  </article>;
}
