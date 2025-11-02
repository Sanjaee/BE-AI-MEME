-- CreateTable
CREATE TABLE "Token" (
    "id" INTEGER NOT NULL,
    "authAccessToken" TEXT NOT NULL,
    "authRefreshToken" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);
