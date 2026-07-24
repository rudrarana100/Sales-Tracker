import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { getFollowUps } from "@/features/leads/api/followUpsApi";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  completeFollowUp,
  updateFollowUp,
} from "@/features/leads/api/followUpsApi";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getFollowUps();
        setFollowUps(data);
      } catch (err) {
        console.error("Calendar load error:", err);
      }
    }
    loadData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const statusColors = {
    new: "bg-blue-500",
    contacted: "bg-yellow-500",
    qualified: "bg-orange-500",
    won: "bg-green-500",
    lost: "bg-red-500",
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
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
  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  async function handleComplete(id) {
    try {
      await completeFollowUp(id);

      const data = await getFollowUps();
      setFollowUps(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="View and manage scheduled follow-ups, calls, and Google Meets."
        action={
          <button
            onClick={() => navigate("/follow-ups")}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 px-3.5 py-2 text-xs font-bold shadow-xs transition-all"
          >
            <CalendarIcon className="h-4 w-4 text-purple-400" />
            <span>Manage Follow-ups</span>
          </button>
        }
      />

      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between bg-card border border-slate-200/70 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold">
            <CalendarIcon className="h-4.5 w-4.5" />
          </div>
          <h2 className="text-base font-bold text-card-foreground">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* ================= CALENDAR ================= */}
        <div className="xl:col-span-3">
          <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-card p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)] space-y-3">
            {/* Days Header */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar */}
            <div className="grid grid-cols-7 gap-2">
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
                    onClick={() => dayNum && setSelectedDay(dayNum)}
                    className={`cursor-pointer min-h-[90px] rounded-xl border p-2 flex flex-col justify-between transition-all ${
                      dayNum
                        ? isSelected
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                          : isToday
                            ? "bg-blue-50/50 dark:bg-slate-800 border-blue-400"
                            : "bg-slate-50/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 hover:border-blue-400"
                        : "border-transparent"
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
                                  : "text-card-foreground"
                            }`}
                          >
                            {dayNum}
                          </span>

                          {events.length > 0 && (
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-full">
                              {events.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mt-1">
                          {events.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/leads/${ev.leads.id}`);
                              }}
                              className="group rounded-lg border border-slate-200/70 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 hover:border-blue-500 transition"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    statusColors[
                                      ev.leads?.status?.toLowerCase()
                                    ] || "bg-slate-400"
                                  }`}
                                />

                                <span className="truncate text-[10px] font-semibold">
                                  {ev.leads?.lead_name}
                                </span>
                              </div>

                              {ev.scheduled_time && (
                                <div className="ml-4 text-[9px] text-slate-500 mt-0.5">
                                  {ev.scheduled_time.slice(0, 5)}
                                </div>
                              )}
                            </div>
                          ))}

                          {events.length > 2 && (
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="w-full rounded-md bg-slate-100 dark:bg-slate-800 py-1 text-[9px] font-semibold"
                            >
                              +{events.length - 2} more
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="xl:col-span-1">
          <div className="sticky top-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5">
            <h3 className="text-lg font-bold">
              {selectedDay
                ? `${selectedDay} ${monthNames[month]}`
                : "Select a Day"}
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              {selectedDay
                ? "Scheduled follow-ups"
                : "Click any date to view follow-ups."}
            </p>

            <div className="mt-5 space-y-3">
              {selectedDay && getEventsForDay(selectedDay).length === 0 && (
                <div className="rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">
                  No follow-ups scheduled.
                </div>
              )}

              {selectedDay &&
                getEventsForDay(selectedDay).map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-500 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          statusColors[ev.leads?.status?.toLowerCase()] ||
                          "bg-slate-400"
                        }`}
                      />

                      <h4 className="font-semibold truncate">
                        {ev.leads?.lead_name}
                      </h4>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <p>{ev.scheduled_time?.slice(0, 5)}</p>
                      <p>{ev.leads?.phone}</p>
                      <p>{ev.leads?.contact_person}</p>
                    </div>

                    <button
                      onClick={() => navigate(`/leads/${ev.leads.id}`)}
                      className="mt-4 w-full rounded-lg bg-slate-900 text-white dark:bg-blue-600 py-2 text-xs font-semibold hover:opacity-90 transition"
                    >
                      Open Lead
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
