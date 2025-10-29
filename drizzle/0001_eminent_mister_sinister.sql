CREATE TABLE `client_knowledge_bases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`businessName` varchar(255),
	`website` varchar(500),
	`businessDescription` text,
	`industry` varchar(255),
	`products` text,
	`targetDemographics` text,
	`targetPsychographics` text,
	`painPoints` text,
	`desires` text,
	`toneAdjectives` text,
	`toneExamples` text,
	`antiToneExamples` text,
	`formalityLevel` varchar(50),
	`usp` text,
	`differentiators` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_knowledge_bases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generated_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientKnowledgeBaseId` int NOT NULL,
	`campaignObjective` varchar(100),
	`productFocus` varchar(255),
	`offerDetails` text,
	`generatedContent` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_campaigns_id` PRIMARY KEY(`id`)
);
