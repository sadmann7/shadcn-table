CREATE TABLE `shadcn-table_tasks` (
	`id` varchar(128) NOT NULL,
	`code` varchar(255),
	`title` varchar(255),
	`status` enum('todo','in-progress','done','canceled') NOT NULL DEFAULT 'todo',
	`label` enum('bug','feature','enhancement','documentation') NOT NULL DEFAULT 'bug',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'low',
	CONSTRAINT `shadcn-table_tasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `shadcn-table_tasks_code_unique` UNIQUE(`code`)
);
