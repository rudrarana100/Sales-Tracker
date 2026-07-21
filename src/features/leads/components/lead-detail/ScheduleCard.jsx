import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Video } from "lucide-react";

export default function ScheduleCard({
  lead, setShowFollowUpForm, setFollowUpDate, setFollowUpTime, setShowMeetingForm,
}) {
  return (
    <div className="card-premium p-6">
      <h2 className="mb-4 text-sm font-medium text-card-foreground">Next Action</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <CalendarDays size={16} className="text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Follow-up Date</p>
            <p className="text-sm font-medium text-card-foreground">{lead.follow_up_date || "--"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Follow-up Time</p>
            <p className="text-sm font-medium text-card-foreground">{lead.follow_up_time || "--"}</p>
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
            <Video className="mr-1.5 h-4 w-4" />
            Book Meeting
          </Button>
        </div>
      </div>
    </div>
  );
}
