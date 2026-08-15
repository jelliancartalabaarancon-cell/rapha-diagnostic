import {
  getAppointmentSlots,
  isAppointmentSlotTooSoon,
} from "@/lib/data/appointment-slots";
import { AppointmentSlotActions } from "@/components/staff/appointment-slot-actions";
import { BackButton } from "@/components/staff/back-button";

export default async function AppointmentSlotsPage() {
  const slots = await getAppointmentSlots();

  // Get today's date in Philippine time.
  const now = new Date();

  const todayString = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Manila",
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />

          <h1 className="font-display text-2xl font-bold text-clinical-950">
            Appointment Slots
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage available dates, times, and appointment capacity.
          </p>
        </div>

        <a
          href="/staff/appointment-slots/new"
          className="rounded-xl bg-clinical-600 px-4 py-2 text-sm font-semibold text-white hover:bg-clinical-700"
        >
          Create Slot
        </a>
      </div>

      {/* Slots */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Booked</th>
                <th className="px-4 py-3 font-medium">Available</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {slots.map((slot) => {
                const available = Math.max(
                  slot.capacity - slot.bookedCount,
                  0,
                );

                /*
                 * Compare the slot's Philippine date with today's
                 * Philippine date.
                 */
                const slotDateString = slot.date.toLocaleDateString(
                  "en-CA",
                  {
                    timeZone: "Asia/Manila",
                  },
                );

                const isPastDate = slotDateString < todayString;

                /*
                 * A slot is too soon when its start time is less than
                 * one hour from the current Philippine time.
                 */
                const tooSoon = isAppointmentSlotTooSoon(
                  slot.date,
                  slot.startTime,
                );

                const isFull = available === 0;

                /*
                 * Any past date is expired.
                 *
                 * A slot on today's date that is inside the one-hour
                 * preparation window is also unavailable.
                 */
                const isExpired = isPastDate || tooSoon;

                return (
                  <tr
                    key={slot.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    {/* Date */}
                    <td className="px-4 py-4 font-medium text-clinical-950">
                      {slot.date.toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        timeZone: "Asia/Manila",
                      })}
                    </td>

                    {/* Time */}
                    <td className="px-4 py-4 text-slate-600">
                      {slot.startTime} - {slot.endTime}
                    </td>

                    {/* Capacity */}
                    <td className="px-4 py-4 text-slate-600">
                      {slot.capacity}
                    </td>

                    {/* Booked */}
                    <td className="px-4 py-4 text-slate-600">
                      {slot.bookedCount}
                    </td>

                    {/* Available */}
                    <td className="px-4 py-4">
                      <span
                        className={
                          isExpired || isFull
                            ? "font-semibold text-red-600"
                            : "font-semibold text-green-600"
                        }
                      >
                        {available}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {isPastDate ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          Expired
                        </span>
                      ) : tooSoon ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          Preparation Cutoff
                        </span>
                      ) : isFull ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          Full
                        </span>
                      ) : slot.isActive ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <AppointmentSlotActions
                        id={slot.id}
                        isActive={slot.isActive}
                        bookedCount={slot.bookedCount}
                        isExpired={isExpired}
                      />
                    </td>
                  </tr>
                );
              })}

              {slots.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No appointment slots have been created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}