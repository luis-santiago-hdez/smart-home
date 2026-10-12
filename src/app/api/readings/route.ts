import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const readings = await prisma.sensorReading.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    return NextResponse.json(
      readings.map((reading) => ({
        ...reading,
        id: reading.id.toString(),
      })),
    );
  } catch (error) {
    console.error("Failed to retrieve sensor readings:", error);

    return NextResponse.json(
      { error: "Failed to retrieve sensor readings" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const expectedToken = process.env.SENSOR_API_KEY;
  const authorization = request.headers.get("authorization");

  if (!expectedToken || authorization !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("temperature" in body) ||
      !("humidity" in body)
    ) {
      return NextResponse.json(
        { error: "temperature and humidity are required" },
        { status: 400 },
      );
    }

    const { temperature, humidity } = body as {
      temperature: unknown;
      humidity: unknown;
    };

    if (
      typeof temperature !== "number" ||
      !Number.isFinite(temperature) ||
      typeof humidity !== "number" ||
      !Number.isFinite(humidity) ||
      humidity < 0 ||
      humidity > 100
    ) {
      return NextResponse.json(
        { error: "Invalid temperature or humidity" },
        { status: 400 },
      );
    }

    const reading = await prisma.sensorReading.create({
      data: { temperature, humidity },
    });

    return NextResponse.json(
      {
        ...reading,
        id: reading.id.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to save sensor reading:", error);

    return NextResponse.json(
      { error: "Failed to save sensor reading" },
      { status: 500 },
    );
  }
}
