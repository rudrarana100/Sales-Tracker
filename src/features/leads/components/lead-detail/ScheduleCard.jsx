import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Video } from "lucide-react";

export default function ScheduleCard({
  lead,
  setShowFollowUpForm,
  setFollowUpDate,
  setFollowUpTime,
  setShowMeetingForm,
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-6 text-xl font-semibold">
        Next Action
      </h2>

      <div className="space-y-5">

        <div className="flex items-center gap-3">
          <CalendarDays size={18} className="text-zinc-500" />

          <div>
            <p className="text-xs text-zinc-500">
              Follow-up Date
            </p>

            <p className="font-medium">
              {lead.follow_up_date || "--"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock size={18} className="text-zinc-500" />

          <div>
            <p className="text-xs text-zinc-500">
              Follow-up Time
            </p>

            <p className="font-medium">
              {lead.follow_up_time || "--"}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">

          <Button
            variant="outline"
            onClick={() => {
              setFollowUpDate(lead.follow_up_date || "");
              setFollowUpTime(lead.follow_up_time || "");
              setShowFollowUpForm(true);
            }}
          >
            Schedule Follow-up
          </Button>

          <Button
            onClick={() => setShowMeetingForm(true)}
          >
            <Video className="mr-2 h-4 w-4" />
            Book Meeting
          </Button>

        </div>

      </div>
    </div>
  );
}