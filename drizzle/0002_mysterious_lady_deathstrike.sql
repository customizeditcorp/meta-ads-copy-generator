CREATE TABLE `knowledge_base_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`knowledgeBaseId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `knowledge_base_documents_id` PRIMARY KEY(`id`)
);
