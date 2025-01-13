/*
  Warnings:

  - You are about to drop the `BloodSugarRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BloodSugarRecord";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "blood_sugars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "bloodSugar" REAL NOT NULL,
    "age" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "condition" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
