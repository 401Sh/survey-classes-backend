import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1794628752643 implements MigrationInterface {
    name = 'Init1794628752643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`attendances\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` date NOT NULL, \`isPresent\` tinyint NOT NULL DEFAULT 0, \`note\` varchar(500) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`subscriptionId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`subscriptions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`isActive\` tinyint NOT NULL DEFAULT 1, \`paymentStatus\` enum ('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid', \`priceSnapshot\` decimal(10,2) NOT NULL, \`paidAmount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`paidAt\` datetime NULL, \`sessionsTotal\` smallint NOT NULL, \`sessionsLeft\` smallint NOT NULL, \`refundedAmount\` decimal(10,2) NULL, \`refundedAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`enrollmentId\` int NULL, \`pricingTierId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lesson-pricing-tiers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`label\` varchar(100) NOT NULL, \`price\` decimal(10,2) NOT NULL DEFAULT '0.00', \`sessionsCount\` smallint NOT NULL DEFAULT '1', \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`lessonId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_8b0be371d28245da6e4f4b6187\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lesson-images\` (\`id\` int NOT NULL AUTO_INCREMENT, \`path\` varchar(500) NOT NULL, \`position\` smallint NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`lessonId\` int NULL, UNIQUE INDEX \`IDX_44c8907be692955d66f4faced5\` (\`lessonId\`, \`position\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lesson-weekly-slots\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dayOfWeek\` smallint NOT NULL, \`startTime\` time NOT NULL, \`durationMinutes\` smallint NOT NULL, \`address\` varchar(500) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`lessonId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lesson-schedule-overrides\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` date NOT NULL, \`startTime\` time NULL, \`address\` varchar(500) NULL, \`status\` enum ('cancelled', 'moved') NOT NULL, \`note\` varchar(500) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`lessonId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lessons\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`isActive\` tinyint NOT NULL DEFAULT 0, \`minAge\` smallint NOT NULL DEFAULT '0', \`teacher\` varchar(255) NULL, \`startsAt\` date NULL, \`endsAt\` date NULL, \`enrollmentMode\` enum ('auto', 'manual') NOT NULL DEFAULT 'manual', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`createdById\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`enrollments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`enrolledAt\` datetime NOT NULL, \`status\` enum ('pending', 'active', 'suspended') NOT NULL, \`consentedAt\` datetime NOT NULL, \`isConsented\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`lessonId\` int NULL, \`userId\` int NULL, \`childId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`children\` (\`id\` int NOT NULL AUTO_INCREMENT, \`firstName\` varchar(255) NOT NULL, \`secondName\` varchar(255) NOT NULL, \`birthDate\` datetime NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`code-verifications\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(255) NOT NULL, \`type\` enum ('email', 'password_reset') NOT NULL, \`expiresAt\` datetime NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, UNIQUE INDEX \`REL_aa4ecbfd05b840720e81164b98\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`refresh-sessions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`refreshToken\` varchar(512) NOT NULL, \`userAgent\` varchar(512) NOT NULL, \`ip\` varchar(45) NOT NULL, \`fingerprint\` varchar(512) NOT NULL, \`expiresAt\` timestamp NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`firstName\` varchar(255) NOT NULL, \`secondName\` varchar(255) NOT NULL, \`role\` enum ('admin', 'moderator', 'user') NOT NULL DEFAULT 'user', \`isEmailVerified\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lessons_categories_categories\` (\`lessonsId\` int NOT NULL, \`categoriesId\` int NOT NULL, INDEX \`IDX_17a739fe31e7d97b61ce17892d\` (\`lessonsId\`), INDEX \`IDX_d1663beb26ea809917cc877072\` (\`categoriesId\`), PRIMARY KEY (\`lessonsId\`, \`categoriesId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`attendances\` ADD CONSTRAINT \`FK_d774556c7be21c9e6cc9b23f06f\` FOREIGN KEY (\`subscriptionId\`) REFERENCES \`subscriptions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`subscriptions\` ADD CONSTRAINT \`FK_bdb8022c91f53d5a2665154868d\` FOREIGN KEY (\`enrollmentId\`) REFERENCES \`enrollments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`subscriptions\` ADD CONSTRAINT \`FK_b9d075fa2df38b7f0be0ff292a0\` FOREIGN KEY (\`pricingTierId\`) REFERENCES \`lesson-pricing-tiers\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lesson-pricing-tiers\` ADD CONSTRAINT \`FK_56c055716f63fb5f00422b8eb5b\` FOREIGN KEY (\`lessonId\`) REFERENCES \`lessons\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lesson-images\` ADD CONSTRAINT \`FK_3d1a9099580e06e8efeefd91453\` FOREIGN KEY (\`lessonId\`) REFERENCES \`lessons\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lesson-weekly-slots\` ADD CONSTRAINT \`FK_f04257c83bf75aa76a14680b17a\` FOREIGN KEY (\`lessonId\`) REFERENCES \`lessons\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lesson-schedule-overrides\` ADD CONSTRAINT \`FK_58013d55ebed280c906be478465\` FOREIGN KEY (\`lessonId\`) REFERENCES \`lessons\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lessons\` ADD CONSTRAINT \`FK_f8b67797a23fa96b4b5e20a79cd\` FOREIGN KEY (\`createdById\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`enrollments\` ADD CONSTRAINT \`FK_0aefcd8f0f02f0346ca42145a13\` FOREIGN KEY (\`lessonId\`) REFERENCES \`lessons\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`enrollments\` ADD CONSTRAINT \`FK_de33d443c8ae36800c37c58c929\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`enrollments\` ADD CONSTRAINT \`FK_1648bcce7ed7bc1b95548d9e73d\` FOREIGN KEY (\`childId\`) REFERENCES \`children\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`children\` ADD CONSTRAINT \`FK_045e714a8906182cae37c8dab89\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`code-verifications\` ADD CONSTRAINT \`FK_aa4ecbfd05b840720e81164b988\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`refresh-sessions\` ADD CONSTRAINT \`FK_6ed739a774796ff774b176c1f3b\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lessons_categories_categories\` ADD CONSTRAINT \`FK_17a739fe31e7d97b61ce17892d2\` FOREIGN KEY (\`lessonsId\`) REFERENCES \`lessons\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`lessons_categories_categories\` ADD CONSTRAINT \`FK_d1663beb26ea809917cc8770721\` FOREIGN KEY (\`categoriesId\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`lessons_categories_categories\` DROP FOREIGN KEY \`FK_d1663beb26ea809917cc8770721\``);
        await queryRunner.query(`ALTER TABLE \`lessons_categories_categories\` DROP FOREIGN KEY \`FK_17a739fe31e7d97b61ce17892d2\``);
        await queryRunner.query(`ALTER TABLE \`refresh-sessions\` DROP FOREIGN KEY \`FK_6ed739a774796ff774b176c1f3b\``);
        await queryRunner.query(`ALTER TABLE \`code-verifications\` DROP FOREIGN KEY \`FK_aa4ecbfd05b840720e81164b988\``);
        await queryRunner.query(`ALTER TABLE \`children\` DROP FOREIGN KEY \`FK_045e714a8906182cae37c8dab89\``);
        await queryRunner.query(`ALTER TABLE \`enrollments\` DROP FOREIGN KEY \`FK_1648bcce7ed7bc1b95548d9e73d\``);
        await queryRunner.query(`ALTER TABLE \`enrollments\` DROP FOREIGN KEY \`FK_de33d443c8ae36800c37c58c929\``);
        await queryRunner.query(`ALTER TABLE \`enrollments\` DROP FOREIGN KEY \`FK_0aefcd8f0f02f0346ca42145a13\``);
        await queryRunner.query(`ALTER TABLE \`lessons\` DROP FOREIGN KEY \`FK_f8b67797a23fa96b4b5e20a79cd\``);
        await queryRunner.query(`ALTER TABLE \`lesson-schedule-overrides\` DROP FOREIGN KEY \`FK_58013d55ebed280c906be478465\``);
        await queryRunner.query(`ALTER TABLE \`lesson-weekly-slots\` DROP FOREIGN KEY \`FK_f04257c83bf75aa76a14680b17a\``);
        await queryRunner.query(`ALTER TABLE \`lesson-images\` DROP FOREIGN KEY \`FK_3d1a9099580e06e8efeefd91453\``);
        await queryRunner.query(`ALTER TABLE \`lesson-pricing-tiers\` DROP FOREIGN KEY \`FK_56c055716f63fb5f00422b8eb5b\``);
        await queryRunner.query(`ALTER TABLE \`subscriptions\` DROP FOREIGN KEY \`FK_b9d075fa2df38b7f0be0ff292a0\``);
        await queryRunner.query(`ALTER TABLE \`subscriptions\` DROP FOREIGN KEY \`FK_bdb8022c91f53d5a2665154868d\``);
        await queryRunner.query(`ALTER TABLE \`attendances\` DROP FOREIGN KEY \`FK_d774556c7be21c9e6cc9b23f06f\``);
        await queryRunner.query(`DROP INDEX \`IDX_d1663beb26ea809917cc877072\` ON \`lessons_categories_categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_17a739fe31e7d97b61ce17892d\` ON \`lessons_categories_categories\``);
        await queryRunner.query(`DROP TABLE \`lessons_categories_categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`refresh-sessions\``);
        await queryRunner.query(`DROP INDEX \`REL_aa4ecbfd05b840720e81164b98\` ON \`code-verifications\``);
        await queryRunner.query(`DROP TABLE \`code-verifications\``);
        await queryRunner.query(`DROP TABLE \`children\``);
        await queryRunner.query(`DROP TABLE \`enrollments\``);
        await queryRunner.query(`DROP TABLE \`lessons\``);
        await queryRunner.query(`DROP TABLE \`lesson-schedule-overrides\``);
        await queryRunner.query(`DROP TABLE \`lesson-weekly-slots\``);
        await queryRunner.query(`DROP INDEX \`IDX_44c8907be692955d66f4faced5\` ON \`lesson-images\``);
        await queryRunner.query(`DROP TABLE \`lesson-images\``);
        await queryRunner.query(`DROP INDEX \`IDX_8b0be371d28245da6e4f4b6187\` ON \`categories\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
        await queryRunner.query(`DROP TABLE \`lesson-pricing-tiers\``);
        await queryRunner.query(`DROP TABLE \`subscriptions\``);
        await queryRunner.query(`DROP TABLE \`attendances\``);
    }

}
