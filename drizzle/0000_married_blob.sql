DO $$ BEGIN
 CREATE TYPE "shadcn_label" AS ENUM('bug', 'feature', 'enhancement', 'documentation');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "shadcn_priority" AS ENUM('low', 'medium', 'high');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "shadcn_status" AS ENUM('todo', 'in-progress', 'done', 'canceled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shadcn_tasks" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"code" varchar(255),
	"title" varchar(255),
	"status" "shadcn_status" DEFAULT 'todo' NOT NULL,
	"label" "shadcn_label" DEFAULT 'bug' NOT NULL,
	"priority" "shadcn_priority" DEFAULT 'low' NOT NULL,
	CONSTRAINT "shadcn_tasks_code_unique" UNIQUE("code")
);
