import { ColouredCourse, SectionWithAlternatives } from "@/types/Types";
import { isAlternativeSubSection } from "@/utils/course";

export const courseToCourseWithSectionAlternatives = (
  course: ColouredCourse,
) => {
  const newSections: Record<string, SectionWithAlternatives[]> = {};

  for (const [key, sectionList] of Object.entries(course.sections)) {
    const grouped: SectionWithAlternatives[] = [];
    const seen = new Set<string>();

    sectionList.forEach(subSection => {
      if (!subSection.subSection || seen.has(subSection.subSection)) return;

      const alternatives = sectionList
        .filter(toFilter => isAlternativeSubSection(subSection, toFilter))
        .map(alternative => alternative.subSection)
        .filter(alternative => alternative !== null);

      grouped.push({
        section: subSection.section,
        subSection: subSection.subSection,
        isOpen: subSection.isOpen,
        type: subSection.type,
        alternatives,
        sessions: subSection.sessions,
      });

      alternatives.forEach(alternative => seen.add(alternative));
    });

    newSections[key] = grouped;
  }

  return {
    courseCode: course.courseCode,
    courseTitle: course.courseTitle,
    colour: course.colour,
    term: course.term,
    sections: newSections,
  };
};
