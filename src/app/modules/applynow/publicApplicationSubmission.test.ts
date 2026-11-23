import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyForPublicJob, uploadPublicResume } from "./publicCareerService";
import { submitPublicApplication } from "./publicApplicationSubmission";
import { PublicJobApplicationPayload, PublicJobApplicationResponse } from "./publicCareerTypes";

vi.mock("./publicCareerService", () => ({
  applyForPublicJob: vi.fn(),
  uploadPublicResume: vi.fn(),
}));

const application: PublicJobApplicationResponse = {
  applicationReference: "application-1",
  resumeUploadToken: "one-use-token",
  tokenExpiresAt: "2026-11-17T10:00:00Z",
  jobTitle: "QA Engineer",
  companyName: "Codeji",
};

const payload: PublicJobApplicationPayload = {
  idempotencyKey: "submission-key-001",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: "1234567890",
  experience: 2,
  privacyAcknowledged: true,
  privacyNoticeVersion: "2026-01",
};

describe("public application submission retry", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps the created application reference when resume upload fails and retries only the upload", async () => {
    vi.mocked(applyForPublicJob).mockResolvedValueOnce({ data: { success: true, methodResult: application } } as never);
    vi.mocked(uploadPublicResume)
      .mockResolvedValueOnce({ data: { success: false, message: "Upload temporarily unavailable." } } as never)
      .mockResolvedValueOnce({ data: { success: true, methodResult: { applicationReference: application.applicationReference } } } as never);
    const onApplicationCreated = vi.fn();
    const resume = new File(["pdf"], "resume.pdf", { type: "application/pdf" });

    await expect(submitPublicApplication({ publicJobId: "job-1", payload, resume, pendingApplication: null, onApplicationCreated }))
      .rejects.toThrow("Upload temporarily unavailable.");

    expect(onApplicationCreated).toHaveBeenCalledWith(application);
    await submitPublicApplication({ publicJobId: "job-1", payload, resume, pendingApplication: application, onApplicationCreated });

    expect(applyForPublicJob).toHaveBeenCalledTimes(1);
    expect(uploadPublicResume).toHaveBeenCalledTimes(2);
    expect(uploadPublicResume).toHaveBeenLastCalledWith(application.applicationReference, application.resumeUploadToken, resume);
  });

  it("does not attempt a resume upload when application creation fails", async () => {
    vi.mocked(applyForPublicJob).mockResolvedValueOnce({ data: { success: false, message: "This role is closed." } } as never);
    const onApplicationCreated = vi.fn();

    await expect(submitPublicApplication({
      publicJobId: "job-1",
      payload,
      resume: new File(["pdf"], "resume.pdf", { type: "application/pdf" }),
      pendingApplication: null,
      onApplicationCreated,
    })).rejects.toThrow("This role is closed.");

    expect(onApplicationCreated).not.toHaveBeenCalled();
    expect(uploadPublicResume).not.toHaveBeenCalled();
  });
});
