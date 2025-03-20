import { SelectedSession } from "@/types/Types"
import dayjs from "dayjs"
import { generateIcsCalendar, VEvent } from "ts-ics"
import { v4 } from "uuid"

const getEvents = (sessions: SelectedSession[]): VEvent[] => {
  return sessions.map(session => {
    const baseStartTime = dayjs(`${session.startRecur} ${session.startTime}`)
    const baseEndTime = dayjs(`${session.startRecur} ${session.endTime}`)
    const dayOffset = Math.abs(baseStartTime.get("d") - session.dayOfWeek)

    const startTime = baseStartTime.add(dayOffset, "days")
    const endTime = baseEndTime.add(dayOffset, "days")

    const recurrenceUntil = dayjs(`${session.endRecur} ${session.endTime}`)

    const event: VEvent = {
      uid: v4(),
      stamp: { date: new Date() },
      start: { date: startTime.toDate() },
      end: { date: endTime.toDate() },
      recurrenceRule: {
        frequency: "WEEKLY",
        until: { date: recurrenceUntil.toDate() },
      },
      summary: `${session.courseDetails.courseCode} ${session.courseDetails.courseTitle} - ${session.courseDetails.type}`,
    }

    return event
  })
}

export const getCalendar = (sessions: SelectedSession[]) => {
  const events = getEvents(sessions)
  return generateIcsCalendar({
    version: "2.0",
    prodId: "//uEnroll//Calendar Export 1.0//EN",
    events,
  })
}
