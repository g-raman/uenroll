import { Term } from "@/types/Types";

export const fetchCourses = async (courseCode: string, term: Term | null) => {
  if (!term) {
    throw new Error("No Term Selected");
  }

  if (courseCode.length < 7) {
    throw new Error("Not a valid course code");
  }

  const containsNumber = (str: string): boolean => /\d/.test(str);
  const containsLetters = (str: string): boolean => /[a-zA-Z]/.test(str);

  if (!containsNumber(courseCode) || !containsLetters(courseCode)) {
    throw new Error("Not a valid course code");
  }

  const res = await fetch(`/api/v1/terms/${term.value}/courses/${courseCode}`);

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.data;
};

export const fetchTerms = async () => {
  const res = await fetch("/api/v1/terms");
  if (!res.ok) {
    throw new Error("Something went wrong. Please report this error.");
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.data as Term[];
};
