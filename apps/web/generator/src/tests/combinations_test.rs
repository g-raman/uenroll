use crate::generator::get_sub_section_combinations_by_type;
use crate::types::CourseWithSectionAlternatives;
use std::fs;

#[test]
fn test_get_sub_section_combinations() {
    let json_data =
        fs::read_to_string("src/tests/data/course_data.json").expect("Could not read JSON file");

    let course: CourseWithSectionAlternatives =
        serde_json::from_str(&json_data).expect("JSON parse failed");

    let combinations = get_sub_section_combinations_by_type(&course);
    assert!(!combinations.is_empty(), "Expected non-empty combinations");
    assert_eq!(combinations.len(), 4);

    println!("Found {} combinations", combinations.len());
    for (i, combo) in combinations.iter().enumerate() {
        println!("Combination {}:", i + 1);
        for item in combo {
            println!(
                "  {} - {} ({})",
                item.section,
                item.r#type,
                item.sub_section.as_deref().unwrap_or("None")
            );
        }
    }
}
