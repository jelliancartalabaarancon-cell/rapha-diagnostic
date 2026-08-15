import { NextResponse } from "next/server";
import { getAvailableServices } from "@/lib/chatbot/services";

export async function GET() {
  try {
    const services = await getAvailableServices();

    return NextResponse.json({
      services,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Database error",
      },
      {
        status: 500,
      }
    );
  }
}