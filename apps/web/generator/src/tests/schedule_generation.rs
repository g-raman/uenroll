use crate::datetime::is_overlapping_time;
use crate::generator::generate_schedules;
use crate::types::{CourseWithSectionAlternatives, Session};
use std::fs;

#[test]
fn test_generate_schedule() {
    let json = fs::read_to_string("src/tests/data/course_data.json").unwrap();
    let course: CourseWithSectionAlternatives = serde_json::from_str(&json).unwrap();
    let schedules = generate_schedules(&[course]);
    println!("Found {} possible schedules", schedules.len());
    assert!(!schedules.is_empty());
}

#[test]
fn test_has_conflict() {
    println!(
        "{}",
        is_overlapping_time(
            &Session {
                start_date: "2025-09-03".to_string(),
                start_time: "11:30:00".to_string(),
                end_time: "12:50:00".to_string(),
                end_date: "2025-12-02".to_string(),
                day_of_week: "Th".to_string(),
                instructor: "test".to_string(),
            },
            &Session {
                start_date: "2025-12-18".to_string(),
                start_time: "10:00:00".to_string(),
                end_time: "12:50:00".to_string(),
                end_date: "2025-12-18".to_string(),
                day_of_week: "Th".to_string(),
                instructor: "test".to_string(),
            },
        )
    );
}
