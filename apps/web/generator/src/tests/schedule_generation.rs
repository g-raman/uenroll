use crate::generator::generate_schedules;
use crate::types::CourseWithSectionAlternatives;
use std::fs;

#[test]
fn test_generate_schedule() {
    let json = fs::read_to_string("src/tests/data/course_data.json").unwrap();
    let course: CourseWithSectionAlternatives = serde_json::from_str(&json).unwrap();
    let schedules = generate_schedules(&[course]);
    println!("Found {} possible schedules", schedules.len());
    assert!(!schedules.is_empty());
}
