import { Course } from "@/types/Types";

export const course: Course[] = [
  {
    term: "2255",
    sections: [
      {
        section: "Z00",
        components: [
          {
            type: "LEC",
            isOpen: true,
            isSelected: true,
            sessions: [
              {
                endDate: "2025-07-25",
                endTime: "11:20:00",
                dayOfWeek: "We",
                startDate: "2025-05-05",
                startTime: "10:00:00",
                instructor: "Paria Shirani",
              },
              {
                endDate: "2025-07-25",
                endTime: "09:50:00",
                dayOfWeek: "Fr",
                startDate: "2025-05-05",
                startTime: "08:30:00",
                instructor: "Staff",
              },
            ],
            subSection: "Z00",
          },
          {
            type: "LAB",
            isOpen: true,
            isSelected: true,
            sessions: [
              {
                endDate: "2025-07-25",
                endTime: "15:50:00",
                dayOfWeek: "Mo",
                startDate: "2025-05-05",
                startTime: "14:30:00",
                instructor: "Paria Shirani",
              },
            ],
            subSection: "Z01",
          },
          {
            type: "LAB",
            isOpen: true,
            isSelected: true,
            sessions: [
              {
                endDate: "2025-07-25",
                endTime: "15:50:00",
                dayOfWeek: "Fr",
                startDate: "2025-05-05",
                startTime: "14:30:00",
                instructor: "Paria Shirani",
              },
            ],
            subSection: "Z02",
          },
          {
            type: "LAB",
            isOpen: true,
            isSelected: true,
            sessions: [
              {
                endDate: "2025-07-25",
                endTime: "18:50:00",
                dayOfWeek: "Tu",
                startDate: "2025-05-05",
                startTime: "17:30:00",
                instructor: "Paria Shirani",
              },
            ],
            subSection: "Z03",
          },
          {
            type: "TUT",
            isOpen: true,
            isSelected: true,
            sessions: [
              {
                endDate: "2025-07-25",
                endTime: "09:50:00",
                dayOfWeek: "Th",
                startDate: "2025-05-05",
                startTime: "08:30:00",
                instructor: "Paria Shirani",
              },
            ],
            subSection: "Z04",
          },
        ],
      },
    ],
    courseCode: "CSI3140",
    courseTitle: "WWW Structures, Techniques and Standards",
  },
  {
    term: "2255",
    sections: [
      {
        section: "Z00",
        components: [
          {
            type: "LEC",
            isOpen: true,
            isSelected: true,
            sessions: [
              {
                endDate: "2025-07-25",
                endTime: "17:20:00",
                dayOfWeek: "Tu",
                startDate: "2025-05-05",
                startTime: "16:00:00",
                instructor: "Mohamed Ali Ibrahim",
              },
              {
                endDate: "2025-07-25",
                endTime: "17:20:00",
                dayOfWeek: "Fr",
                startDate: "2025-05-05",
                startTime: "16:00:00",
                instructor: "Staff",
              },
            ],
            subSection: "Z00",
          },
          {
            type: "LAB",
            isOpen: false,
            isSelected: true,
            sessions: [
              {
                endDate: "2025-07-25",
                endTime: "15:50:00",
                dayOfWeek: "Tu",
                startDate: "2025-05-05",
                startTime: "14:30:00",
                instructor: "Mohamed Ali Ibrahim",
              },
            ],
            subSection: "Z01",
          },
          {
            type: "LAB",
            isOpen: true,
            isSelected: true,
            sessions: [
              {
                endDate: "2025-07-25",
                endTime: "12:50:00",
                dayOfWeek: "Fr",
                startDate: "2025-05-05",
                startTime: "11:30:00",
                instructor: "Mohamed Ali Ibrahim",
              },
            ],
            subSection: "Z02",
          },
          {
            type: "LAB",
            isOpen: true,
            isSelected: true,
            sessions: [
              {
                endDate: "2025-07-25",
                endTime: "18:50:00",
                dayOfWeek: "We",
                startDate: "2025-05-05",
                startTime: "17:30:00",
                instructor: "Mohamed Ali Ibrahim",
              },
            ],
            subSection: "Z03",
          },
          {
            type: "LAB",
            isOpen: true,
            isSelected: true,
            sessions: [
              {
                endDate: "2025-07-25",
                endTime: "18:50:00",
                dayOfWeek: "Th",
                startDate: "2025-05-05",
                startTime: "17:30:00",
                instructor: "Mohamed Ali Ibrahim",
              },
            ],
            subSection: "Z04",
          },
          {
            type: "LAB",
            isOpen: true,
            isSelected: true,
            sessions: [
              {
                endDate: "2025-07-25",
                endTime: "11:20:00",
                dayOfWeek: "Fr",
                startDate: "2025-05-05",
                startTime: "10:00:00",
                instructor: "Mohamed Ali Ibrahim",
              },
            ],
            subSection: "Z05",
          },
          {
            type: "TUT",
            isOpen: true,
            isSelected: true,
            sessions: [
              {
                endDate: "2025-07-25",
                endTime: "09:50:00",
                dayOfWeek: "Mo",
                startDate: "2025-05-05",
                startTime: "08:30:00",
                instructor: "Mohamed Ali Ibrahim",
              },
            ],
            subSection: "Z06",
          },
        ],
      },
    ],
    courseCode: "CSI3131",
    courseTitle: "Operating Systems",
  },
];
