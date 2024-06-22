export type term = {
  value: string;
  term: string;
};

export type subject = {
  subject: string;
};

export type Course = {
  courseCode: string;
  courseTitle: string;
  term: string;
};

export type CourseComponent = {
  courseCode: string;
  subSection: string;
  type: string;
  isOpen: boolean;
  section: string;
  term: string;
};

export type Session = {
  courseCode: string;
  section: string;
  subSection: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  instructor: string;
  term: string;
};

export type CourseDetails = {
  courses: Course[];
  courseComponents: CourseComponent;
  sessions: Session[];
};
