export interface Course {
  courseCode: string;
  courseTitle: string;
  term: string;
  sections: Section[];
  colour?: string;
}

export interface Section {
  section: string;
  components: Component[];
}

export interface Component {
  type: string;
  isOpen: boolean;
  subSection: string;
  isSelected: boolean;
  sessions: Session[];
}

export interface Session {
  endDate: string;
  endTime: string;
  dayOfWeek: string;
  startDate: string;
  startTime: string;
  instructor: string;
}

export interface Term {
  term: string;
  value: string;
}

export interface SelectedCourse extends Component {
  courseCode: string;
  courseTitle: string;
  term: string;
  subSection: string;
  colour: string;
}

export interface SelectedSession {
  startTime: string;
  endTime: string;
  startRecur: string;
  endRecur: string;
  dayOfWeek: number;
  courseDetails: {
    courseCode: string;
    courseTitle: string;
    term: string;
    subSection: string;
    instructor: string;
    type: string;
    isOpen: boolean;
    backgroundColour: string;
  };
}

export interface Selected {
  [key: string]: string[];
}

export interface SelectedKey {
  courseCode: string;
  subSection: string;
}

export interface CourseAutocomplete {
  course_code: string;
  course_title: string;
}
