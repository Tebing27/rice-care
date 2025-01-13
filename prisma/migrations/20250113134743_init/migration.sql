-- CreateTable
CREATE TABLE "BloodSugarRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "bloodSugar" DOUBLE PRECISION NOT NULL,
    "age" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "condition" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodSugarRecord_pkey" PRIMARY KEY ("id")
);
