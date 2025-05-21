CREATE TABLE "available_subjects" (
	"subject" text PRIMARY KEY NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "available_subjects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "available_terms" (
	"term" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "available_terms_value_unique" UNIQUE("value")
);
--> statement-breakpoint
ALTER TABLE "available_terms" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "course_components" (
	"course_code" text NOT NULL,
	"term" text NOT NULL,
	"sub_section" text,
	"section" text NOT NULL,
	"is_open" boolean NOT NULL,
	"type" text NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "course_components_course_code_term_sub_section_pk" PRIMARY KEY("course_code","term","sub_section")
);
--> statement-breakpoint
ALTER TABLE "course_components" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "courses" (
	"course_code" text NOT NULL,
	"term" text NOT NULL,
	"course_title" text NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "courses_course_code_term_pk" PRIMARY KEY("course_code","term"),
	CONSTRAINT "courses_courseCode_unique" UNIQUE("course_code")
);
--> statement-breakpoint
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_code" text NOT NULL,
	"term" text NOT NULL,
	"sub_section" text NOT NULL,
	"section" text NOT NULL,
	"day_of_week" text NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"instructor" text NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "course_components" ADD CONSTRAINT "course_fk" FOREIGN KEY ("course_code","term") REFERENCES "public"."courses"("course_code","term") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_term_available_terms_value_fk" FOREIGN KEY ("term") REFERENCES "public"."available_terms"("value") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "course_component_fk" FOREIGN KEY ("course_code","term","sub_section") REFERENCES "public"."course_components"("course_code","term","sub_section") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "read access for all users policy" ON "available_subjects" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "read access for all users policy" ON "available_terms" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "read access for all users policy" ON "course_components" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "read access for all users policy" ON "courses" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "read access for all users policy" ON "sessions" AS PERMISSIVE FOR SELECT TO public;