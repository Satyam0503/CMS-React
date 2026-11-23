import { PublicJobApplicationPayload, PublicJobApplicationResponse } from "./publicCareerTypes";
import { applyForPublicJob, uploadPublicResume } from "./publicCareerService";

type PendingApplication = Pick<PublicJobApplicationResponse, "applicationReference" | "resumeUploadToken">;

export const submitPublicApplication = async ({
  publicJobId,
  payload,
  resume,
  pendingApplication,
  onApplicationCreated,
}: {
  publicJobId: string;
  payload: PublicJobApplicationPayload;
  resume: File | null;
  pendingApplication: PendingApplication | null;
  onApplicationCreated: (application: PendingApplication) => void;
}) => {
  let application = pendingApplication;
  if (!application) {
    const { data } = await applyForPublicJob(publicJobId, payload);
    if (!data.success || !data.methodResult) throw new Error(data.message || "Application failed.");
    application = data.methodResult;
    onApplicationCreated(application);
  }

  if (resume) {
    const { data } = await uploadPublicResume(application.applicationReference, application.resumeUploadToken, resume);
    if (!data.success) throw new Error(data.message || "Resume upload failed. Your application is saved; retry the resume upload.");
  }

  return application;
};
