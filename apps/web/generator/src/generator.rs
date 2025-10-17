use crate::{
    datetime::is_overlapping_time,
    types::{CourseWithSectionAlternatives, ScheduleItem, SectionWithAlternatives},
};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

pub fn generate_schedules(courses: &[CourseWithSectionAlternatives]) -> Vec<Vec<ScheduleItem>> {
    let course_combinations: Vec<Vec<Vec<ScheduleItem>>> = courses
        .iter()
        .map(|course| get_sub_section_combinations_by_type(course))
        .collect();

    let mut selected: Vec<ScheduleItem> = Vec::new();
    let mut results: Vec<Vec<ScheduleItem>> = Vec::new();

    fn backtrack(
        index: usize,
        course_combinations: &[Vec<Vec<ScheduleItem>>],
        selected: &mut Vec<ScheduleItem>,
        results: &mut Vec<Vec<ScheduleItem>>,
    ) {
        if index == course_combinations.len() {
            results.push(selected.clone());
            return;
        }

        for combination in &course_combinations[index] {
            if has_conflict(selected, combination) {
                continue;
            }

            selected.extend_from_slice(combination);
            backtrack(index + 1, course_combinations, selected, results);

            for _ in 0..combination.len() {
                selected.pop();
            }
        }
    }

    backtrack(0, &course_combinations, &mut selected, &mut results);
    results
}

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

                if has_conflict(&[new_item.clone()], &chosen) {
                    continue;
                }

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

pub fn has_conflict(selected: &[ScheduleItem], new_option: &[ScheduleItem]) -> bool {
    for chosen in selected {
        for section in new_option {
            let overlap = chosen.sessions.iter().any(|chosen_session| {
                section
                    .sessions
                    .iter()
                    .any(|new_session| is_overlapping_time(chosen_session, new_session))
            });

            if overlap {
                return true;
            }
        }
    }
    false
}

#[wasm_bindgen]
pub fn generate_schedules_wasm(courses_json: &str) -> String {
    let courses_result: Result<Vec<CourseWithSectionAlternatives>, _> =
        serde_json::from_str(courses_json);

    if let Ok(courses) = courses_result {
        let schedules = generate_schedules(&courses);
        serde_json::to_string(&schedules).expect("Failed to serialize schedules")
    } else {
        String::from("[]")
    }
}
