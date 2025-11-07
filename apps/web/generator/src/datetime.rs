use std::cmp::{max, min};
use time::{Date, Time, format_description::well_known::Iso8601};

use crate::types::Session;

fn parse_date_utc(date_str: &str) -> Date {
    Date::parse(date_str, &Iso8601::DEFAULT)
        .unwrap_or_else(|_| panic!("Invalid date format: {}", date_str))
}

fn parse_time_utc(time_str: &str) -> Time {
    Time::parse(time_str, &Iso8601::DEFAULT)
        .unwrap_or_else(|_| panic!("Invalid time format: {}", time_str))
}

pub fn is_overlapping_time(first: &Session, second: &Session) -> bool {
    /*
     * Three step process
     * 1. Check if date ranges overlap
     * 2. Check if they fall on the same day
     * 3. Check if the start and end times overlap
     */
    let f_start_date = parse_date_utc(&first.start_date);
    let f_end_date = parse_date_utc(&first.end_date);
    let s_start_date = parse_date_utc(&second.start_date);
    let s_end_date = parse_date_utc(&second.end_date);

    let date_overlap = max(f_start_date, s_start_date) <= min(f_end_date, s_end_date);
    if !date_overlap {
        return false;
    }

    if first.day_of_week != second.day_of_week {
        return false;
    }

    let f_start_time = parse_time_utc(&first.start_time);
    let f_end_time = parse_time_utc(&first.end_time);
    let s_start_time = parse_time_utc(&second.start_time);
    let s_end_time = parse_time_utc(&second.end_time);

    f_start_time < s_end_time && s_start_time < f_end_time
}
