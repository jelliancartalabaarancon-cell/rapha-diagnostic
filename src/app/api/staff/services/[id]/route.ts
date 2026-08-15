import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getServiceById,
  updateService,
  updateServiceStatus,
} from "@/lib/data/services";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/*
 * GET /api/staff/services/[id]
 *
 * Used by the Edit Service page to load
 * the current service information.
 */
export async function GET(request: Request, context: RouteContext) {
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
   * Staff and Admin can view services.
   */
  if (session.user.role !== "STAFF" && session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        error: "You are not authorized to manage services.",
      },
      {
        status: 403,
      },
    );
  }

  const { id } = await context.params;

  const service = await getServiceById(id);

  if (!service) {
    return NextResponse.json(
      {
        error: "Service not found.",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    service,
  });
}

/*
 * PATCH /api/staff/services/[id]
 *
 * Supports:
 *
 * 1. Editing service information:
 *    {
 *      name,
 *      description,
 *      icon
 *    }
 *
 * 2. Activating/deactivating:
 *    {
 *      isActive
 *    }
 */
export async function PATCH(request: Request, context: RouteContext) {
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
   * Staff and Admin can manage services.
   */
  if (session.user.role !== "STAFF" && session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        error: "You are not authorized to manage services.",
      },
      {
        status: 403,
      },
    );
  }

  const { id } = await context.params;

  /*
   * Check that the service exists.
   */
  const service = await getServiceById(id);

  if (!service) {
    return NextResponse.json(
      {
        error: "Service not found.",
      },
      {
        status: 404,
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

  /*
   * ----------------------------------------
   * Activate / Deactivate
   * ----------------------------------------
   */
  if (
    typeof body.isActive === "boolean" &&
    body.name === undefined &&
    body.description === undefined &&
    body.icon === undefined
  ) {
    try {
      const updatedService = await updateServiceStatus(id, body.isActive);

      return NextResponse.json({
        service: updatedService,
      });
    } catch (error) {
      console.error("Update service status error:", error);

      return NextResponse.json(
        {
          error: "Unable to update service status.",
        },
        {
          status: 500,
        },
      );
    }
  }

  /*
   * ----------------------------------------
   * Edit service information
   * ----------------------------------------
   */

  if (
    typeof body.name !== "string" ||
    typeof body.description !== "string" ||
    typeof body.icon !== "string"
  ) {
    return NextResponse.json(
      {
        error: "Please provide a service name, description, and icon.",
      },
      {
        status: 400,
      },
    );
  }

  const name = body.name.trim();
  const description = body.description.trim();
  const icon = body.icon.trim();

  if (!name) {
    return NextResponse.json(
      {
        error: "Service name is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!description) {
    return NextResponse.json(
      {
        error: "Service description is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!icon) {
    return NextResponse.json(
      {
        error: "Service icon is required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const updatedService = await updateService(id, {
      name,
      description,
      icon,
    });

    return NextResponse.json({
      service: updatedService,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "SERVICE_NAME_TAKEN") {
      return NextResponse.json(
        {
          error: "A service with this name already exists.",
        },
        {
          status: 409,
        },
      );
    }

    console.error("Update service error:", error);

    return NextResponse.json(
      {
        error: "Unable to update service.",
      },
      {
        status: 500,
      },
    );
  }
}
