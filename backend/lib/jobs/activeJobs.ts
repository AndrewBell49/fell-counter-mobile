export const activeJobs = new Map<
  string,
  { status: "running" | "completed" | "failed" }
>()
