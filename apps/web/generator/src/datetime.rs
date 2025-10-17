use time::Time;

use crate::types::Session;

pub fn is_overlapping_time(first: &Session, second: &Session) -> bool {
    if first.day_of_week != second.day_of_week {
        return false;
    }

    let f_start = Time::parse(
        &first.start_time,
        &time::format_description::well_known::Iso8601::DEFAULT,
    )
    .unwrap();
    let f_end = Time::parse(
        &first.end_time,
        &time::format_description::well_known::Iso8601::DEFAULT,
    )
    .unwrap();
    let s_start = Time::parse(
        &second.start_time,
        &time::format_description::well_known::Iso8601::DEFAULT,
    )
    .unwrap();
    let s_end = Time::parse(
        &second.end_time,
        &time::format_description::well_known::Iso8601::DEFAULT,
    )
    .unwrap();

    f_start < s_end && s_start < f_end
}
