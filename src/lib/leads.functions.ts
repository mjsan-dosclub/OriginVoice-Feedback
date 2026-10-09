import { createServerFn } from "@tanstack/react-start";

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function record(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") return {};
  return input as Record<string, unknown>;
}

export const processVoice = createServerFn({ method: "POST" })
  .validator((input: { transcript: string; clientKey: string }) => {
    const data = record(input);
    return {
      transcript: text(data.transcript, 4000).trim(),
      clientKey: text(data.clientKey, 80).trim(),
    };
  })
  .handler(async ({ data }) => {
    const { processVoiceLead } = await import("./leads.server");
    return processVoiceLead(data);
  });

export const getLead = createServerFn({ method: "POST" })
  .validator((input: { id: string; token: string }) => {
    const data = record(input);
    return { id: text(data.id, 80), token: text(data.token, 80) };
  })
  .handler(async ({ data }) => {
    const { readLead } = await import("./leads.server");
    return readLead(data);
  });

export const confirmVoice = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id: string;
      token: string;
      name: string;
      phone: string;
      email: string;
      schoolName: string;
      objective: string;
      bulletsText: string;
    }) => {
      const data = record(input);
      return {
        id: text(data.id, 80),
        token: text(data.token, 80),
        name: text(data.name, 160),
        phone: text(data.phone, 32),
        email: text(data.email, 160),
        schoolName: text(data.schoolName, 160),
        objective: text(data.objective, 40),
        bulletsText: text(data.bulletsText, 1200),
      };
    },
  )
  .handler(async ({ data }) => {
    const { confirmLead } = await import("./leads.server");
    return confirmLead(data);
  });

export const submitManual = createServerFn({ method: "POST" })
  .validator(
    (input: {
      clientKey: string;
      name: string;
      schoolName: string;
      phone: string;
      email: string;
      callbackDate: string;
      callbackSlot: string;
      objective: string;
      notes: string;
    }) => {
      const data = record(input);
      return {
        clientKey: text(data.clientKey, 80).trim(),
        name: text(data.name, 160),
        schoolName: text(data.schoolName, 160),
        phone: text(data.phone, 32),
        email: text(data.email, 160),
        callbackDate: text(data.callbackDate, 12),
        callbackSlot: text(data.callbackSlot, 80),
        objective: text(data.objective, 40),
        notes: text(data.notes, 1000),
      };
    },
  )
  .handler(async ({ data }) => {
    const { submitManualLead } = await import("./leads.server");
    return submitManualLead(data);
  });

export const adminGate = createServerFn({ method: "GET" }).handler(async () => {
  const { adminGateState } = await import("./leads.server");
  return adminGateState();
});

export const adminLogin = createServerFn({ method: "POST" })
  .validator((input: { code: string }) => {
    const data = record(input);
    return { code: text(data.code, 80) };
  })
  .handler(async ({ data }) => {
    const { adminLoginState } = await import("./leads.server");
    return adminLoginState(data);
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { adminLogoutState } = await import("./leads.server");
  return adminLogoutState();
});

export const listLeads = createServerFn({ method: "GET" }).handler(async () => {
  const { listLeadState } = await import("./leads.server");
  return listLeadState();
});

export const setBoothCode = createServerFn({ method: "POST" })
  .validator((input: { code: string }) => {
    const data = record(input);
    return { code: text(data.code, 80) };
  })
  .handler(async ({ data }) => {
    const { changeBoothCode } = await import("./leads.server");
    return changeBoothCode(data);
  });

export const seedSampleLeads = createServerFn({ method: "POST" }).handler(async () => {
  const { loadSampleQueue } = await import("./leads.server");
  return loadSampleQueue();
});
