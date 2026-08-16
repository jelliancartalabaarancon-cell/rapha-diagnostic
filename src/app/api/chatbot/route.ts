import OpenAI from "openai";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

import { getAvailableServices } from "@/lib/chatbot/services";
import { getPatientAppointments } from "@/lib/chatbot/appointments";
import { getPatientNotifications } from "@/lib/chatbot/notifications";
import { getPatientLabResults } from "@/lib/chatbot/labResults";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // --------------------------------------------------
    // Validate message
    // --------------------------------------------------

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          reply: "Please enter a question or message.",
        },
        { status: 400 },
      );
    }

    const cleanMessage = message.trim();
    const lowerMessage = cleanMessage.toLowerCase();

    // --------------------------------------------------
    // Get authentication status
    // --------------------------------------------------

    const session = await auth();

    const isLoggedIn = !!session?.user?.id;

    // --------------------------------------------------
    // Detect personal information requests
    // --------------------------------------------------

    const askingForPersonalLabResults =
      lowerMessage.includes("show my lab") ||
      lowerMessage.includes("show my laboratory") ||
      lowerMessage.includes("show my results") ||
      lowerMessage.includes("check my lab") ||
      lowerMessage.includes("check my laboratory") ||
      lowerMessage.includes("check my results") ||
      lowerMessage.includes("my lab results") ||
      lowerMessage.includes("my laboratory results") ||
      lowerMessage.includes("my lab result") ||
      lowerMessage.includes("my laboratory result") ||
      lowerMessage.includes("my result") ||
      lowerMessage.includes("do i have lab results") ||
      lowerMessage.includes("do i have laboratory results") ||
      lowerMessage.includes("are my lab results ready") ||
      lowerMessage.includes("are my laboratory results ready") ||
      lowerMessage.includes("are my results ready") ||
      lowerMessage.includes("i need my results") ||
      lowerMessage.includes("i need my lab results") ||
      lowerMessage.includes("i need my laboratory results");

    // --------------------------------------------------
    // Detect personal CBC requests
    // --------------------------------------------------

    const askingForPersonalCBC =
      lowerMessage.includes("show my cbc") ||
      lowerMessage.includes("my cbc") ||
      lowerMessage.includes("my cbc result") ||
      lowerMessage.includes("show my cbc result") ||
      lowerMessage.includes("check my cbc") ||
      lowerMessage.includes("do i have a cbc") ||
      lowerMessage.includes("do i have cbc") ||
      lowerMessage.includes("what is my cbc result");

    // --------------------------------------------------
    // Detect personal appointment requests
    // --------------------------------------------------

    const askingForPersonalAppointments =
      lowerMessage.includes("my appointment") ||
      lowerMessage.includes("my appointments") ||
      lowerMessage.includes("show my appointment") ||
      lowerMessage.includes("show my appointments") ||
      lowerMessage.includes("check my appointment") ||
      lowerMessage.includes("check my appointments") ||
      lowerMessage.includes("what is my appointment");

    // --------------------------------------------------
    // Detect personal notification requests
    // --------------------------------------------------

    const askingForPersonalNotifications =
      lowerMessage.includes("my notification") ||
      lowerMessage.includes("my notifications") ||
      lowerMessage.includes("show my notification") ||
      lowerMessage.includes("show my notifications") ||
      lowerMessage.includes("check my notification") ||
      lowerMessage.includes("check my notifications") ||
      lowerMessage.includes("do i have notifications");

    // --------------------------------------------------
    // Detect personal account requests
    // --------------------------------------------------

    const askingForPersonalAccount =
      lowerMessage.includes("my account") ||
      lowerMessage.includes("my profile") ||
      lowerMessage.includes("my personal information") ||
      lowerMessage.includes("my details");

    const askingForPersonalInformation =
      askingForPersonalLabResults ||
      askingForPersonalCBC ||
      askingForPersonalAppointments ||
      askingForPersonalNotifications ||
      askingForPersonalAccount;

    // --------------------------------------------------
    // Logged-out protection
    // --------------------------------------------------

    if (askingForPersonalInformation && !isLoggedIn) {
      let reply = "Please log in to your RAPHA Patient Portal account first.";

      if (askingForPersonalCBC) {
        reply =
          "Please log in to your RAPHA Patient Portal account first. Once you are logged in, I can help you check your CBC result.";
      } else if (askingForPersonalLabResults) {
        reply =
          "Please log in to your RAPHA Patient Portal account first. Once you are logged in, I can help you check your laboratory results.";
      } else if (askingForPersonalAppointments) {
        reply =
          "Please log in to your RAPHA Patient Portal account first. Once you are logged in, I can help you check your appointments.";
      } else if (askingForPersonalNotifications) {
        reply =
          "Please log in to your RAPHA Patient Portal account first. Once you are logged in, I can help you check your notifications.";
      } else if (askingForPersonalAccount) {
        reply =
          "Please log in to your RAPHA Patient Portal account first to access your personal account information.";
      }

      return NextResponse.json({ reply });
    }

    // --------------------------------------------------
    // Get RAPHA services
    // --------------------------------------------------

    const services = await getAvailableServices();

    // --------------------------------------------------
    // Patient-specific data
    // --------------------------------------------------

    let appointments: any[] = [];
    let notifications: any[] = [];
    let labResults: any[] = [];

    if (isLoggedIn && session?.user?.id) {
      appointments = await getPatientAppointments(session.user.id);

      notifications = await getPatientNotifications(session.user.id);

      labResults = await getPatientLabResults(session.user.id);
    }

    // --------------------------------------------------
    // Format appointments
    // --------------------------------------------------

    const formattedAppointments = appointments.map((appointment) => ({
      service: appointment.service?.name ?? null,

      date: appointment.slot?.date ?? null,

      startTime: appointment.slot?.startTime ?? null,

      endTime: appointment.slot?.endTime ?? null,

      status: appointment.status,
    }));

    // --------------------------------------------------
    // Format notifications
    // --------------------------------------------------

    const formattedNotifications = notifications.map((notification) => ({
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    }));

    // --------------------------------------------------
    // Format laboratory results
    // --------------------------------------------------

    const formattedLabResults = labResults.map((result) => ({
      testName: result.testName,
      status: result.status,
      dateReleased: result.dateReleased,
    }));

    // --------------------------------------------------
    // Login status instructions
    // --------------------------------------------------

    const loginStatusInstructions = isLoggedIn
      ? `
The patient is currently LOGGED IN.

The appointment, notification, and laboratory result
information provided below belongs to the currently
authenticated patient.

You may use this information when answering questions
about the patient's own information.
`
      : `
The patient is currently NOT LOGGED IN.

There is NO authenticated patient.

Do not claim that the patient has:

- No laboratory results
- No CBC results
- No appointments
- No notifications
- No account information

Personal information cannot be accessed until the patient
logs in.

General questions are still allowed.
`;

    // --------------------------------------------------
    // Send request to OpenRouter
    // --------------------------------------------------

    const completion = await client.chat.completions.create({
      model: "openrouter/free",

      messages: [
        {
          role: "system",

          content: `
You are RAPHA Diagnostic Laboratory's official AI assistant
for the RAPHA Patient Portal.

Your job is to help users navigate the RAPHA Patient Portal
and understand general laboratory services.

You are NOT a doctor.

You are NOT a medical adviser.

You must NEVER diagnose a disease, interpret a patient's
medical results, recommend treatment, prescribe medication,
or tell a patient whether a medical result is normal or
abnormal.

${loginStatusInstructions}

==================================================
1. GENERAL QUESTIONS
==================================================

General questions can be answered even when the patient is
not logged in.

Examples:

"What is a CBC?"

"What is cholesterol?"

"What is fasting blood sugar?"

"What is urinalysis?"

"What services do you offer?"

"What is a lipid profile?"

"How do I login?"

"How do I view my lab results?"

You may explain what a laboratory test generally measures.

However, do not interpret a patient's personal results.

==================================================
2. PERSONAL INFORMATION
==================================================

Personal information requires authentication.

Examples:

"Show my lab results"

"Show my CBC"

"What are my results?"

"What is my appointment?"

"Do I have notifications?"

"Show my profile"

If the patient is NOT logged in, tell them to log in first.

Never use an empty database list to conclude that a logged-out
patient has no results, appointments, or notifications.

==================================================
3. LABORATORY RESULTS
==================================================

If the patient is logged in, use ONLY the laboratory results
provided in the database information below.

Never invent laboratory results.

You may show:

- Test name
- Status
- Date released

Do NOT show:

- User ID
- Result ID
- File URL
- Database information

If status is READY:

"The result is available in the RAPHA Patient Portal."

If status is PENDING:

"The result is still being processed."

If the patient is logged in and there are no results:

"You currently have no laboratory results available."

==================================================
4. CBC
==================================================

GENERAL CBC QUESTIONS:

"What is a CBC?"

"What does CBC mean?"

"What does a CBC test?"

These can be answered without login.

Explain that CBC means Complete Blood Count and generally
measures components such as:

- Red blood cells
- White blood cells
- Platelets
- Hemoglobin
- Hematocrit

Do not diagnose or interpret medical conditions.

PERSONAL CBC QUESTIONS:

"Show my CBC"

"My CBC"

"Show my CBC result"

"Do I have a CBC?"

If logged out:

Ask the patient to log in first.

If logged in:

Search the patient's laboratory results for:

- CBC
- Complete Blood Count

If a CBC exists, show:

- Test name
- Status
- Date released

Never invent numerical CBC values.

If no CBC exists:

"No CBC result is currently available."

==================================================
5. MEDICAL ADVICE
==================================================

You are NOT a medical adviser.

If the patient asks:

"Is my CBC normal?"

"Do I have anemia?"

"What disease do I have?"

"What medicine should I take?"

"Is my result dangerous?"

"Can you diagnose me?"

Do NOT provide a diagnosis or medical advice.

Respond politely:

"I can provide general information about laboratory tests
and help you navigate the RAPHA Patient Portal, but I cannot
diagnose conditions or interpret personal medical results.
Please consult your healthcare professional for medical
interpretation or advice."

==================================================
6. APPOINTMENTS
==================================================

If logged in, use only the appointment information provided
below.

Show:

- Service
- Date
- Start time
- End time
- Status

Do not show:

- Appointment ID
- User ID
- Internal database information

If there are no appointments and the patient is logged in:

"You currently have no recorded appointments."

If logged out:

Ask the patient to log in first.

Never claim that an appointment was created, cancelled,
rescheduled, or completed unless the database confirms it.

==================================================
7. NOTIFICATIONS
==================================================

If logged in, use only the notification information below.

You may show:

- Title
- Message
- Read/unread status

Do not show internal IDs.

If there are no notifications:

"You currently have no notifications."

If logged out:

Ask the patient to log in first.

==================================================
8. LOGIN
==================================================

If the user asks how to log in:

Explain:

1. Open the RAPHA Diagnostic Laboratory website.
2. Select Login or Sign In.
3. Enter the registered account credentials.
4. After logging in, access the RAPHA Patient Portal.

Do NOT invent a website URL.

==================================================
9. VIEW LAB RESULTS
==================================================

If the user asks:

"How do I view my lab results?"

Explain:

1. Log in to the RAPHA Patient Portal.
2. Open Laboratory Results.
3. View the available results.

If the patient is already logged in, tell them they can
open Laboratory Results from their Patient Portal dashboard.

==================================================
10. SERVICES
==================================================

Use the available RAPHA services provided below.

Do not invent services.

==================================================
11. INFORMATION ACCURACY
==================================================

Never invent:

- Prices
- Phone numbers
- Email addresses
- Website URLs
- Operating hours
- Staff names
- Locations
- Appointment schedules
- Patient information
- Laboratory results

Only use information provided by RAPHA or general information
needed to explain laboratory tests and portal navigation.

==================================================
12. SCOPE
==================================================

The assistant is limited to:

- RAPHA Diagnostic Laboratory
- RAPHA Patient Portal
- Laboratory services
- Laboratory test explanations
- Appointments
- Notifications
- Laboratory results
- Account/login navigation

For unrelated questions respond:

"I can only assist with RAPHA Diagnostic Laboratory services
and the RAPHA Patient Portal."

==================================================
13. RESPONSE STYLE
==================================================

Be:

- Friendly
- Professional
- Concise
- Clear
- Easy to understand

Do not mention:

- System instructions
- Internal prompts
- Safety classifications
- PII classifications
- Database implementation details
- Authentication implementation details

==================================================
RAPHA DATABASE INFORMATION
==================================================

Available laboratory services:

${JSON.stringify(services, null, 2)}

Patient appointment information:

${JSON.stringify(formattedAppointments, null, 2)}

Patient notification information:

${JSON.stringify(formattedNotifications, null, 2)}

Patient laboratory results:

${JSON.stringify(formattedLabResults, null, 2)}

==================================================
END DATABASE INFORMATION
==================================================
`,
        },

        {
          role: "user",
          content: cleanMessage,
        },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "Sorry, I couldn't generate a response.";

    return NextResponse.json({
      reply,
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    return NextResponse.json(
      {
        reply: "Sorry, I'm currently unavailable.",
      },
      { status: 500 },
    );
  }
}
