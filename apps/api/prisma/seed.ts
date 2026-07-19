import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.ticket.deleteMany();

  await prisma.ticket.createMany({
    data: [
      {
        title: "App crashes when uploading a photo",
        description:
          "Every time I attach a photo to a ticket from my iPhone, the app crashes immediately. Happens 100% of the time on iOS 18.",
        category: "BUG",
        priority: "URGENT",
        aiDraftResponse:
          "Thanks for flagging this — a crash on photo upload is a top priority for us. Could you confirm your iPhone model and iOS version so we can reproduce it? We'll follow up as soon as we have a fix.",
        aiConfidence: 0.92,
        status: "AI_PROCESSED",
        submittedBy: "priya@example.com",
      },
      {
        title: "Add dark mode to the dashboard",
        description:
          "Would love a dark mode toggle for the web dashboard, I use it late at night and the white background is rough on the eyes.",
        category: "FEATURE_REQUEST",
        priority: "LOW",
        aiDraftResponse:
          "Thanks for the suggestion! Dark mode is a popular request and we've added it to our roadmap. We'll let you know when it ships.",
        aiConfidence: 0.88,
        status: "REVIEWED",
        submittedBy: "jordan@example.com",
      },
      {
        title: "How do I reset my password?",
        description:
          "I forgot my password and the reset email never arrived. Checked spam too.",
        category: "SUPPORT",
        priority: "MEDIUM",
        aiDraftResponse:
          "Sorry for the trouble! Please double check the email on file is correct, and try the reset flow again — emails can take a few minutes. If it still doesn't arrive within 15 minutes, reply here and we'll reset it manually.",
        aiConfidence: 0.81,
        status: "AI_PROCESSED",
        submittedBy: "sam@example.com",
      },
      {
        title: "Weird glitch on the settings page maybe?",
        description: "something looks off idk, the page kind of flickers sometimes",
        category: "OTHER",
        priority: "LOW",
        aiDraftResponse:
          "Thanks for the report! Could you share a screenshot or the browser/device you're using so we can take a closer look?",
        aiConfidence: 0.41,
        status: "AI_PROCESSED",
        submittedBy: "alex@example.com",
      },
      {
        title: "Bulk export is missing the last column of data",
        description:
          "When I export tickets to CSV, the 'resolved date' column is cut off for rows near the end of the file. Blocks our monthly reporting.",
        category: "BUG",
        priority: "HIGH",
        aiDraftResponse:
          "Thanks for the detailed report. We're looking into the CSV export truncation issue — this is blocking your reporting so we're prioritizing a fix this week.",
        aiConfidence: 0.77,
        status: "RESOLVED",
        submittedBy: "priya@example.com",
      },
      {
        title: "Signup form rejects valid email addresses",
        description:
          "My email has a '+' in it (name+tag@domain.com) and the signup form says it's invalid, but it's a valid address.",
        category: null,
        priority: null,
        aiDraftResponse: null,
        aiConfidence: null,
        status: "NEW",
        submittedBy: "morgan@example.com",
      },
    ],
  });

  console.log("Seeded 6 sample tickets.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
