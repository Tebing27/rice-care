/*
  Warnings:

  - You are about to alter the column `bloodSugar` on the `BloodSugarRecord` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - Added the required column `userId` to the `BloodSugarRecord` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BloodSugarRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "bloodSugar" INTEGER NOT NULL,
    "age" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL
);
INSERT INTO "new_BloodSugarRecord" ("age", "bloodSugar", "condition", "createdAt", "date", "description", "id", "time", "type") SELECT "age", "bloodSugar", "condition", "createdAt", "date", "description", "id", "time", "type" FROM "BloodSugarRecord";
DROP TABLE "BloodSugarRecord";
ALTER TABLE "new_BloodSugarRecord" RENAME TO "BloodSugarRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
