ALTER POLICY "read access for all users policy" ON "available_subjects" TO public USING (true);--> statement-breakpoint
ALTER POLICY "read access for all users policy" ON "available_terms" TO public USING (true);--> statement-breakpoint
ALTER POLICY "read access for all users policy" ON "course_components" TO public USING (true);--> statement-breakpoint
ALTER POLICY "read access for all users policy" ON "courses" TO public USING (true);--> statement-breakpoint
ALTER POLICY "read access for all users policy" ON "sessions" TO public USING (true);