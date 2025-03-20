import { CourseAutocomplete, Term } from '@/types/Types'

export const fetchCourse = async (courseCode: string, term: Term | null) => {
  if (!term) {
    throw new Error('No Term Selected')
  }

  if (courseCode.length < 7) {
    throw new Error('Not a valid course code')
  }

  const containsNumber = (str: string): boolean => /\d/.test(str)
  const containsLetters = (str: string): boolean => /[a-zA-Z]/.test(str)

  if (!containsNumber(courseCode) || !containsLetters(courseCode)) {
    throw new Error('Not a valid course code')
  }
  const normalizedCourseCode = courseCode.replaceAll(' ', '').toUpperCase()

  const res = await fetch(`/api/v1/terms/${term.value}/courses/${normalizedCourseCode}`)

  const data = await res.json()
  if (data.error) {
    throw new Error(data.error)
  }
  return data.data
}

export const fetchTerms = async () => {
  const res = await fetch('/api/v1/terms')
  if (!res.ok) {
    throw new Error('Something went wrong. Please report this error.')
  }

  const data = await res.json()
  if (data.error) {
    throw new Error(data.error)
  }
  return data.data as Term[]
}

export const fetchAllCourses = async (term: Term | null): Promise<CourseAutocomplete[]> => {
  if (!term) {
    throw new Error('No Term Selected')
  }

  const res = await fetch(`/api/v1/terms/${term.value}/courses`)

  if (!res.ok) {
    throw new Error('Something went wrong. Please report this error.')
  }
  const data = await res.json()
  if (data.error) {
    throw new Error(data.error)
  }
  return data.data
}
