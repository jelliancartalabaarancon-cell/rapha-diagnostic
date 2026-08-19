
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createService } from "@/lib/data/services";

export async function POST(request: Request) {
  const session = await auth();

  /*
   * User must be logged in.
   */
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "Not authenticated.",
      },
      {
        status: 401,
      },
    );
  }

  /*
   * Only Staff and Admin can create services.
   */
  if (
    session.user.role !== "STAFF" &&
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.json(
      {
        error:
          "You are not authorized to create services.",
      },
      {
        status: 403,
      },
    );
  }

  /*
   * Read request body.
   */
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      {
        error: "Invalid request body.",
      },
      {
        status: 400,
      },
    );
  }

  const {
    name,
    description,
    icon,
  } = body;

  /*
   * Validate required fields.
   */
  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof icon !== "string"
  ) {
    return NextResponse.json(
      {
        error: "Please complete all required fields.",
      },
      {
        status: 400,
      },
    );
  }

  const serviceName = name.trim();
  const serviceDescription =
    description.trim();
  const serviceIcon = icon.trim();

  if (!serviceName) {
    return NextResponse.json(
      {
        error: "Service name is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!serviceDescription) {
    return NextResponse.json(
      {
        error: "Service description is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!serviceIcon) {
    return NextResponse.json(
      {
        error: "Service icon is required.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Create service.
   */
  try {
    const service = await createService({
      name: serviceName,
      description: serviceDescription,
      icon: serviceIcon,
    });

    return NextResponse.json(
      {
        service,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "SERVICE_NAME_TAKEN"
    ) {
      return NextResponse.json(
        {
          error:
            "A service with this name already exists.",
        },
        {
          status: 409,
        },
      );
    }

    console.error(
      "Create service error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to create service.",
      },
      {
        status: 500,
      },
    );
  }
}

