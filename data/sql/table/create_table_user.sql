CREATE TABLE user
(
	`id` 				INT NOT NULL AUTO_INCREMENT,
    `email`				VARCHAR(255) NOT NULL,
    `nickname` 			VARCHAR(255) NOT NULL,
    `password` 			VARCHAR(255) NOT NULL,
    `level_complited` 	INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE utf8mb4_unicode_ci
;