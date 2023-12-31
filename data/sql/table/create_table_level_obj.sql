CREATE TABLE level_obj
(
   `id`					INT NOT NULL AUTO_INCREMENT,
   `id_level`			INT NOT NULL,
   `name`				VARCHAR(255) NOT NULL,
   `is_Destructible`	TINYINT(1) DEFAULT 0,
   `can_T_pass`			TINYINT(1) DEFAULT 0,
   `can_B_pass`			TINYINT(1) DEFAULT 0,
   `imageURL`			VARCHAR(255) NOT NULL,
   `pos_x`				INT NOT NULL,
   `pos_y`				INT NOT NULL,
   PRIMARY KEY (`id`),
   FOREIGN KEY (id_level) REFERENCES level (id) ON DELETE CASCADE
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE utf8mb4_unicode_ci
;