// © 2026 DoctoPal — All Rights Reserved
// Google Takeout / Fit "All Data" JSON fixtures. Each file inside the real
// export holds an Array `Data` of dataPoints (or sometimes `dataPoint` /
// `bucket→dataset→point` — covered by the parser).
// nano-timestamps below cover ~ 2024-01-15 09:00 → 2024-01-16 06:30 UTC.

const NS = (iso: string) => String(BigInt(new Date(iso).getTime()) * BigInt(1_000_000))

export const GOOGLE_FIT_MOCK_FILES: Record<string, string> = {
  // Steps — file name must match /step_count\.delta/i
  "Takeout/Fit/All Data/derived_com.google.step_count.delta.json": JSON.stringify({
    Data: [
      { dataTypeName: "com.google.step_count.delta",
        startTimeNanos: NS("2024-01-15T09:00:00Z"), endTimeNanos: NS("2024-01-15T10:00:00Z"),
        value: [{ intVal: 3500 }] },
      { dataTypeName: "com.google.step_count.delta",
        startTimeNanos: NS("2024-01-15T15:00:00Z"), endTimeNanos: NS("2024-01-15T16:00:00Z"),
        value: [{ intVal: 2200 }] },
      { dataTypeName: "com.google.step_count.delta",
        startTimeNanos: NS("2024-01-16T10:30:00Z"), endTimeNanos: NS("2024-01-16T11:30:00Z"),
        value: [{ intVal: 4100 }] },
    ],
  }),
  // Heart rate — file name must match /heart_rate\.bpm/i
  "Takeout/Fit/All Data/derived_com.google.heart_rate.bpm.json": JSON.stringify({
    Data: [
      { dataTypeName: "com.google.heart_rate.bpm",
        startTimeNanos: NS("2024-01-15T09:30:00Z"), endTimeNanos: NS("2024-01-15T09:30:00Z"),
        value: [{ fpVal: 68 }] },
      { dataTypeName: "com.google.heart_rate.bpm",
        startTimeNanos: NS("2024-01-15T18:30:00Z"), endTimeNanos: NS("2024-01-15T18:30:00Z"),
        value: [{ fpVal: 74 }] },
      { dataTypeName: "com.google.heart_rate.bpm",
        startTimeNanos: NS("2024-01-16T09:30:00Z"), endTimeNanos: NS("2024-01-16T09:30:00Z"),
        value: [{ fpVal: 71 }] },
    ],
  }),
  // Sleep segments — file name must match /sleep\.segment/i
  // intVal stages: 1=Awake (skipped), 4=Sleep, 5=Deep, 6=REM
  "Takeout/Fit/All Data/derived_com.google.sleep.segment.json": JSON.stringify({
    Data: [
      { dataTypeName: "com.google.sleep.segment",
        startTimeNanos: NS("2024-01-15T23:00:00Z"), endTimeNanos: NS("2024-01-16T02:00:00Z"),
        value: [{ intVal: 5 }] }, // 3h deep
      { dataTypeName: "com.google.sleep.segment",
        startTimeNanos: NS("2024-01-16T02:00:00Z"), endTimeNanos: NS("2024-01-16T06:30:00Z"),
        value: [{ intVal: 6 }] }, // 4.5h REM
    ],
  }),
  // Weight — file name must match /weight/i
  "Takeout/Fit/All Data/derived_com.google.weight.json": JSON.stringify({
    Data: [
      { dataTypeName: "com.google.weight",
        startTimeNanos: NS("2024-01-15T08:00:00Z"), endTimeNanos: NS("2024-01-15T08:00:00Z"),
        value: [{ fpVal: 72.5 }] },
    ],
  }),
}
