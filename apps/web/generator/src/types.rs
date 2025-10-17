use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    pub day_of_week: String,
    pub start_time: String,
    pub end_time: String,
    pub start_date: String,
    pub end_date: String,
    pub instructor: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SectionWithAlternatives {
    pub alternatives: Vec<String>,
    pub sub_section: Option<String>,
    pub section: String,
    pub is_open: bool,
    #[serde(rename = "type")]
    pub r#type: String,
    pub sessions: Vec<Session>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScheduleItem {
    pub course_code: String,
    pub course_title: String,
    pub colour: String,
    pub term: String,
    pub alternatives: Vec<String>,
    pub sub_section: Option<String>,
    pub section: String,
    pub is_open: bool,
    #[serde(rename = "type")]
    pub r#type: String,
    pub sessions: Vec<Session>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseWithSectionAlternatives {
    pub course_code: String,
    pub course_title: String,
    pub colour: String,
    pub term: String,
    pub sections: HashMap<String, Vec<SectionWithAlternatives>>,
}
