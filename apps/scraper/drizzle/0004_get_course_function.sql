CREATE OR REPLACE FUNCTION get_course (term_param TEXT, course_code_param TEXT) RETURNS JSONB LANGUAGE sql AS $$
  WITH time AS (
    SELECT
      course_code,
      last_updated
    FROM
      sessions
    WHERE
      course_code = course_code_param
      AND term = term_param
    ORDER BY
      last_updated DESC
    LIMIT 1
  ),
  sub_sections AS (
    SELECT
      s.course_code,
      s.section,
      s.sub_section,
      cc.is_open,
      cc.type,
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'instructor', s.instructor,
          'dayOfWeek', s.day_of_week,
          'startTime', s.start_time,
          'endTime', s.end_time,
          'startDate', s.start_date,
          'endDate', s.end_date
        ) ORDER BY s.start_date, CASE 
          WHEN s.day_of_week = 'Mo' THEN 1
          WHEN s.day_of_week = 'Tu' THEN 2
          WHEN s.day_of_week = 'We' THEN 3
          WHEN s.day_of_week = 'Th' THEN 4
          WHEN s.day_of_week = 'Fr' THEN 5
          WHEN s.day_of_week = 'Sa' THEN 6
          WHEN s.day_of_week = 'Su' THEN 7
        END
      ) AS sessions
    FROM
      sessions AS s
      INNER JOIN course_components AS cc 
        ON s.course_code = cc.course_code
        AND s.sub_section = cc.sub_section
        AND s.term = cc.term
      INNER JOIN time AS t ON s.course_code = t.course_code
    WHERE
      s.term = term_param
      AND s.last_updated = t.last_updated
    GROUP BY
      s.section,
      s.sub_section,
      s.course_code,
      cc.is_open,
      cc.type
    ORDER BY
      s.sub_section
  ),
  sections AS (
    SELECT
      ss.course_code,
      ss.section,
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'subSection', ss.sub_section,
          'sessions', ss.sessions
        ) || JSONB_BUILD_OBJECT('isOpen', ss.is_open, 'type', ss.type)
      ) AS components
    FROM
      sub_sections AS ss
    GROUP BY
      ss.section,
      ss.course_code
  ),
  result AS (
    SELECT
      sc.course_code AS "courseCode",
      c.course_title AS "courseTitle",
      c.term,
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'section', sc.section,
          'components', sc.components
        )
      ) AS sections
    FROM
      sections AS sc
      INNER JOIN courses AS c 
        ON sc.course_code = c.course_code
        AND c.term = term_param
    GROUP BY
      sc.course_code,
      c.course_title,
      c.term
  )
SELECT JSONB_AGG(result) FROM result;
$$;

