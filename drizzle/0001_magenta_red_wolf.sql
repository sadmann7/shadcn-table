ALTER TABLE "shadcn_tasks" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "shadcn_tasks" ADD COLUMN "updated_at" timestamp DEFAULT current_timestamp;