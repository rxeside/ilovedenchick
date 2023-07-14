CREATE TABLE level
(
   `id`				INT NOT NULL AUTO_INCREMENT,
   `name`			VARCHAR(255) NOT NULL,
   `side`			INT NOT NULL,
   `author` 		VARCHAR(255),
   `is_Completed`	TINYINT(1) DEFAULT 0,
   PRIMARY KEY (`id`)
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE utf8mb4_unicode_ci
;