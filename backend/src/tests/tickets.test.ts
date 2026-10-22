import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/prisma";
import { setAIProviderForTesting } from "../services/ai/providerFactory";
import type { AIProvider } from "../services/ai/types";
import { hashPassword } from "../utils/password";

const app = createApp();

const REVIEWER_EMAIL = "reviewer@test.com";
const REVIEWER_PASSWORD = "correct-horse";

async function loginAsReviewer(): Promise<string> {
  await prisma.user.deleteMany();
  await prisma.user.create({
    data: {
      email: REVIEWER_EMAIL,
      passwordHash: await hashPassword(REVIEWER_PASSWORD),
      name: "Test Reviewer",
    },
  });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: REVIEWER_EMAIL, password: REVIEWER_PASSWORD });

  return res.body.token as string;
}

const VALID_BUG_RESPONSE = JSON.stringify({
  category: "BUG",
  priority: "HIGH",
  confidence: 0.9,
  draftResponse: "Thanks, we're on it.",
});

const VALID_FEATURE_RESPONSE = JSON.stringify({
  category: "FEATURE_REQUEST",
  priority: "LOW",
  confidence: 0.7,
  draftResponse: "Thanks for the suggestion.",
});

function mockAI(response: string) {
  const provider: AIProvider = { name: "fake", generate: jest.fn().mockResolvedValue(response) };
  setAIProviderForTesting(provider);
}

function mockAIFailure() {
  const provider: AIProvider = {
    name: "fake",
    generate: jest.fn().mockRejectedValue({ status: 400, message: "bad request" }),
  };
  setAIProviderForTesting(provider);
}

beforeEach(async () => {
  await prisma.ticket.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/tickets", () => {
  it("creates a ticket and applies the AI classification when the provider succeeds", async () => {
    mockAI(VALID_BUG_RESPONSE);

    const res = await request(app).post("/api/tickets").send({
      title: "Login button does nothing",
      description: "Clicking login has no effect on Safari.",
      submittedBy: "test@example.com",
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("AI_PROCESSED");
    expect(res.body.category).toBe("BUG");
    expect(res.body.priority).toBe("HIGH");
    expect(res.body.aiConfidence).toBe(0.9);
    expect(res.body.aiDraftResponse).toBe("Thanks, we're on it.");
  });

  it("still creates the ticket with null AI fields when the AI provider fails", async () => {
    mockAIFailure();

    const res = await request(app).post("/api/tickets").send({
      title: "Login button does nothing",
      description: "Clicking login has no effect on Safari.",
      submittedBy: "test@example.com",
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("NEW");
    expect(res.body.category).toBeNull();
    expect(res.body.priority).toBeNull();
    expect(res.body.aiConfidence).toBeNull();
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app).post("/api/tickets").send({ title: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });
});

describe("GET /api/tickets", () => {
  beforeEach(async () => {
    mockAI(VALID_BUG_RESPONSE);
    await request(app)
      .post("/api/tickets")
      .send({ title: "Bug A", description: "d", submittedBy: "a@example.com" });

    mockAI(VALID_FEATURE_RESPONSE);
    await request(app)
      .post("/api/tickets")
      .send({ title: "Feature B", description: "d", submittedBy: "b@example.com" });
  });

  it("lists all tickets", async () => {
    const res = await request(app).get("/api/tickets");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("filters by category", async () => {
    const res = await request(app).get("/api/tickets?category=BUG");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Bug A");
  });

  it("filters by priority", async () => {
    const res = await request(app).get("/api/tickets?priority=LOW");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Feature B");
  });
});

describe("GET /api/tickets/:id", () => {
  it("returns the ticket for a known id", async () => {
    mockAI(VALID_BUG_RESPONSE);
    const created = await request(app)
      .post("/api/tickets")
      .send({ title: "T", description: "D", submittedBy: "x@example.com" });

    const res = await request(app).get(`/api/tickets/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).get("/api/tickets/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/tickets/:id", () => {
  it("applies a human reviewer's overrides and marks the ticket reviewed", async () => {
    const token = await loginAsReviewer();
    mockAI(VALID_BUG_RESPONSE);
    const created = await request(app)
      .post("/api/tickets")
      .send({ title: "T", description: "D", submittedBy: "x@example.com" });

    const res = await request(app)
      .patch(`/api/tickets/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ category: "SUPPORT", priority: "LOW", status: "REVIEWED" });

    expect(res.status).toBe(200);
    expect(res.body.category).toBe("SUPPORT");
    expect(res.body.priority).toBe("LOW");
    expect(res.body.status).toBe("REVIEWED");
  });

  it("returns 404 when updating an unknown id", async () => {
    const token = await loginAsReviewer();
    const res = await request(app)
      .patch("/api/tickets/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "REVIEWED" });

    expect(res.status).toBe(404);
  });

  it("returns 400 when status is not REVIEWED or RESOLVED", async () => {
    const token = await loginAsReviewer();
    mockAI(VALID_BUG_RESPONSE);
    const created = await request(app)
      .post("/api/tickets")
      .send({ title: "T", description: "D", submittedBy: "x@example.com" });

    const res = await request(app)
      .patch(`/api/tickets/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "NEW" });

    expect(res.status).toBe(400);
  });

  it("returns 401 when no auth token is provided", async () => {
    mockAI(VALID_BUG_RESPONSE);
    const created = await request(app)
      .post("/api/tickets")
      .send({ title: "T", description: "D", submittedBy: "x@example.com" });

    const res = await request(app)
      .patch(`/api/tickets/${created.body.id}`)
      .send({ status: "REVIEWED" });

    expect(res.status).toBe(401);
  });
});
