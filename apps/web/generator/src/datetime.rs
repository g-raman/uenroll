use time::{Date, Duration, OffsetDateTime, PrimitiveDateTime, Time};
use time_tz::{PrimitiveDateTimeExt, Tz, timezones};

use crate::types::Session;

fn toronto_tz() -> &'static Tz {
    timezones::get_by_name("America/Toronto").expect("America/Toronto timezone not found")
}

pub fn get_zoned_datetime(date: &str, time_str: &str) -> OffsetDateTime {
    let date = Date::parse(
        date,
        &time::format_description::well_known::Iso8601::DEFAULT,
    )
    .expect("Invalid date format");

    let time = Time::parse(
        time_str,
        &time::format_description::well_known::Iso8601::DEFAULT,
    )
    .expect("Invalid time string");
    let naive = PrimitiveDateTime::new(date, time);

    naive.assume_timezone_utc(toronto_tz())
}

pub fn get_offsetted_start_datetime(date: &str, time: &str, day_of_week: &str) -> OffsetDateTime {
    let base = get_zoned_datetime(date, time);
    let base_day = base.weekday().number_days_from_monday() as i64;
    let target_day = day_of_week_to_number_map(day_of_week);
    let offset_days = (target_day - base_day + 7) % 7;
    base + Duration::days(offset_days)
}

pub fn is_overlapping_time(first: &Session, second: &Session) -> bool {
    let f_start =
        get_offsetted_start_datetime(&first.start_date, &first.start_time, &first.day_of_week);
    let f_end =
        get_offsetted_start_datetime(&first.start_date, &first.end_time, &first.day_of_week);
    let s_start =
        get_offsetted_start_datetime(&second.start_date, &second.start_time, &second.day_of_week);
    let s_end =
        get_offsetted_start_datetime(&second.start_date, &second.end_time, &second.day_of_week);

    f_start < s_end && s_start < f_end
}

fn day_of_week_to_number_map(day: &str) -> i64 {
    match day {
        "N/A" => -1,
        "Mo" => 1,
        "Tu" => 2,
        "We" => 3,
        "Th" => 4,
        "Fr" => 5,
        "Sa" => 6,
        "Su" => 7,
        _ => panic!("Invalid weekday: {}", day),
    }
}
