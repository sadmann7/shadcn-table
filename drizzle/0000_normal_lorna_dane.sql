DO $$ BEGIN
 CREATE TYPE "public"."shadcn_label" AS ENUM('bug', 'feature', 'enhancement', 'documentation');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."shadcn_priority" AS ENUM('low', 'medium', 'high');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."shadcn_status" AS ENUM('todo', 'in-progress', 'done', 'canceled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shadcn_tasks" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"code" varchar(256),
	"title" varchar(256),
	"status" "shadcn_status" DEFAULT 'todo' NOT NULL,
	"label" "shadcn_label" DEFAULT 'bug' NOT NULL,
	"priority" "shadcn_priority" DEFAULT 'low' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp,
	CONSTRAINT "shadcn_tasks_code_unique" UNIQUE("code")
);
