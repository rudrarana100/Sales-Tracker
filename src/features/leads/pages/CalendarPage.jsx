import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { getFollowUps, completeFollowUp } from "@/features/leads/api/followUpsApi";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  User,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showMobileModal, setShowMobileModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getFollowUps();
        setFollowUps(data || []);
      } catch (err) {
        console.error("Calendar load error:", err);
      }
    }
    loadData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const statusColors = {
    cold: "bg-slate-400",
    contacted: "bg-blue-500",
    warm: "bg-amber-500",
    meeting_booked: "bg-purple-500",
    proposal_sent: "bg-indigo-500",
    closed_won: "bg-emerald-500",
    closed_lost: "bg-rose-500",
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  function getEventsForDay(dayNum) {
    if (!dayNum) return [];
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(dayNum).padStart(2, "0");
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    return followUps.filter((f) => f.scheduled_date === dateStr);
  }

  function handleDayClick(dayNum) {
    if (!dayNum) return;
    setSelectedDay(dayNum);
    if (window.innerWidth < 1280) {
      setShowMobileModal(true);
    }
  }

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Calendar"
        description="Plan and manage scheduled follow-ups, calls, and Google Meet bookings in one place."
        action={
          <button
            onClick={() => navigate("/follow-ups")}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <CalendarIcon className="h-4 w-4 text-purple-400" />
            <span>Manage Follow-ups</span>
          </button>
        }
      />

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold">
            <CalendarIcon className="h-4.5 w-4.5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDay(new Date().getDate());
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* CALENDAR BOARD */}
        <div className="xl:col-span-3">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs space-y-3">
            {/* Days Header */}
            <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((dayNum, i) => {
                const events = getEventsForDay(dayNum);

                const isToday =
                  dayNum &&
                  new Date().getDate() === dayNum &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                const isSelected = selectedDay === dayNum;

                return (
                  <div
                    key={i}
                    onClick={() => handleDayClick(dayNum)}
                    className={`min-h-[60px] sm:min-h-[95px] rounded-xl border p-1.5 sm:p-2 flex flex-col justify-between transition-all cursor-pointer ${
                      dayNum
                        ? isSelected
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/20"
                          : isToday
                          ? "bg-blue-50/50 dark:bg-slate-800 border-blue-400"
                          : "bg-slate-50/40 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-800/80 hover:border-blue-400"
                        : "border-transparent bg-transparent pointer-events-none"
                    }`}
                  >
                    {dayNum && (
                      <>
                        <div className="flex items-center justify-between">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-lg text-xs font-bold ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : isToday
                                ? "bg-blue-500 text-white"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {dayNum}
                          </span>

                          {events.length > 0 && (
                            <span className="text-[9px] font-extrabold text-blue-600 bg-blue-100 dark:bg-blue-950/80 px-1.5 py-0.5 rounded-full">
                              {events.length}
                            </span>
                          )}
                        </div>

                        {/* Event Pills for desktop */}
                        <div className="hidden sm:block space-y-1 mt-1">
                          {events.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/leads/${ev.lead_id || ev.leads?.id}`);
                              }}
                              className="group rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 hover:border-blue-500 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                    statusColors[ev.leads?.status?.toLowerCase()] || "bg-slate-400"
                                  }`}
                                />
                                <span className="truncate text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                                  {ev.leads?.lead_name || ev.title || "Follow-up"}
                                </span>
                              </div>
                            </div>
                          ))}

                          {events.length > 2 && (
                            <div className="w-full text-center text-[9px] font-bold text-slate-400 py-0.5">
                              +{events.length - 2} more
                            </div>
                          )}
                        </div>

                        {/* Mobile indicator dots */}
                        <div className="sm:hidden flex items-center justify-center gap-0.5 mt-1">
                          {events.slice(0, 3).map((_, idx) => (
                            <span key={idx} className="h-1 w-1 rounded-full bg-blue-500" />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DESKTOP SIDE PANEL */}
        <div className="hidden xl:block xl:col-span-1">
          <div className="sticky top-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedDay
                  ? `${selectedDay} ${monthNames[month]}`
                  : "Select a Day"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedDay
                  ? `${selectedEvents.length} scheduled follow-up(s)`
                  : "Click any date on the calendar to view schedule details."}
              </p>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {selectedDay && selectedEvents.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs font-semibold text-slate-400 space-y-1">
                  <p>No follow-ups scheduled.</p>
                  <p className="text-[10px] text-slate-400 font-normal">Ready to dial through new leads!</p>
                </div>
              )}

              {selectedDay &&
                selectedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3 hover:border-blue-500 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            statusColors[ev.leads?.status?.toLowerCase()] || "bg-slate-400"
                          }`}
                        />
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[140px]">
                          {ev.leads?.lead_name || ev.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                        {ev.scheduled_time ? ev.scheduled_time.slice(0, 5) : "All Day"}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                      {ev.leads?.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{ev.leads.phone}</span>
                        </p>
                      )}
                      {ev.leads?.contact_person && (
                        <p className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>{ev.leads.contact_person}</span>
                        </p>
                      )}
                      {ev.notes && (
                        <p className="text-[11px] italic text-slate-600 dark:text-slate-300 pt-1">
                          "{ev.notes}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/leads/${ev.lead_id || ev.leads?.id}`)}
                      className="w-full flex items-center justify-center gap-1 rounded-xl bg-slate-900 dark:bg-blue-600 text-white py-2 text-xs font-bold hover:bg-slate-800 dark:hover:bg-blue-500 transition-all cursor-pointer"
                    >
                      <span>Open Lead Details</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE POPUP DRAWER (Triggered on day tap for small screens) */}
      {showMobileModal && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200 xl:hidden">
          <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedDay} {monthNames[month]} {year}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedEvents.length} event(s) scheduled
                </p>
              </div>
              <button
                onClick={() => setShowMobileModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedEvents.length === 0 ? (
                <div className="py-8 text-center text-xs font-semibold text-slate-400">
                  No follow-ups scheduled for this day.
                </div>
              ) : (
                selectedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {ev.leads?.lead_name || ev.title}
                      </h4>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                        {ev.scheduled_time ? ev.scheduled_time.slice(0, 5) : "All Day"}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      {ev.leads?.phone && <p>Phone: {ev.leads.phone}</p>}
                      {ev.notes && <p className="italic">"{ev.notes}"</p>}
                    </div>

                    <button
                      onClick={() => {
                        setShowMobileModal(false);
                        navigate(`/leads/${ev.lead_id || ev.leads?.id}`);
                      }}
                      className="w-full rounded-xl bg-blue-600 text-white py-2 text-xs font-bold"
                    >
                      Open Lead
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}