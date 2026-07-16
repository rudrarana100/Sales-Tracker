import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Video } from "lucide-react";

export default function ScheduleCard({
  lead, setShowFollowUpForm, setFollowUpDate, setFollowUpTime, setShowMeetingForm,
}) {
  return (
    <div className="rounded-xl border border-ash bg-canvas-white p-5">
      <h2 className="mb-4 text-sm font-medium text-charcoal">Next Action</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <CalendarDays size={16} className="text-fog" />
          <div>
            <p className="text-[11px] text-fog">Follow-up Date</p>
            <p className="text-sm font-medium text-charcoal">{lead.follow_up_date || "--"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-fog" />
          <div>
            <p className="text-[11px] text-fog">Follow-up Time</p>
            <p className="text-sm font-medium text-charcoal">{lead.follow_up_time || "--"}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => {
            setFollowUpDate(lead.follow_up_date || "");
            setFollowUpTime(lead.follow_up_time || "");
            setShowFollowUpForm(true);
          }}>
            Schedule Follow-up
          </Button>
          <Button size="sm" onClick={() => setShowMeetingForm(true)}>
            <Video className="mr-1.5 h-3.5 w-3.5" />
            Book Meeting
          </Button>
        </div>
      </div>
    </div>
  );
}
