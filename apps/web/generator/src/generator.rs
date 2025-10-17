use crate::types::{CourseWithSectionAlternatives, ScheduleItem, SectionWithAlternatives};
use std::collections::HashMap;

pub fn get_sub_section_combinations_by_type(
    course: &CourseWithSectionAlternatives,
) -> Vec<Vec<ScheduleItem>> {
    let mut grouped_by_type: HashMap<String, Vec<SectionWithAlternatives>> = HashMap::new();

    for section_list in course.sections.values() {
        for section in section_list {
            grouped_by_type
                .entry(section.r#type.clone())
                .or_default()
                .push(section.clone())
        }
    }

    let required_types: Vec<String> = grouped_by_type.keys().cloned().collect();
    let mut combinations: Vec<Vec<ScheduleItem>> = Vec::new();

    fn backtrack(
        index: usize,
        chosen: &mut Vec<ScheduleItem>,
        required_types: &[String],
        grouped_by_type: &HashMap<String, Vec<SectionWithAlternatives>>,
        course: &CourseWithSectionAlternatives,
        combinations: &mut Vec<Vec<ScheduleItem>>,
    ) {
        if index == required_types.len() {
            combinations.push(chosen.clone());
            return;
        }

        let r#type = &required_types[index];

        if let Some(sub_sections) = grouped_by_type.get(r#type) {
            for sub_section in sub_sections {
                let current_section = chosen
                    .first()
                    .map(|s| s.section.clone())
                    .unwrap_or_else(|| sub_section.section.clone());

                if sub_section.section != current_section {
                    continue;
                }

                let new_item = ScheduleItem {
                    course_code: course.course_code.clone(),
                    course_title: course.course_title.clone(),
                    colour: course.colour.clone(),
                    term: course.term.clone(),
                    alternatives: sub_section.alternatives.clone(),
                    sub_section: sub_section.sub_section.clone(),
                    section: sub_section.section.clone(),
                    is_open: sub_section.is_open,
                    r#type: sub_section.r#type.clone(),
                    sessions: sub_section.sessions.clone(),
                };

                chosen.push(new_item.clone());
                backtrack(
                    index + 1,
                    chosen,
                    required_types,
                    grouped_by_type,
                    course,
                    combinations,
                );
                chosen.pop();
            }
        }
    }

    backtrack(
        0,
        &mut Vec::new(),
        &required_types,
        &grouped_by_type,
        course,
        &mut combinations,
    );

    combinations
}
