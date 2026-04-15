// © 2026 DoctoPal — All Rights Reserved
// Tiny Apple Health export.xml fixture. Mirrors the real file's shape:
//   <HealthData><Record type=… value=… startDate=… [endDate=…] [unit=…] /></HealthData>
// 10 records covering 2 days × steps / heart_rate / sleep / weight.

export const APPLE_HEALTH_MOCK_XML = `<?xml version="1.0" encoding="UTF-8"?>
<HealthData locale="en_US">
  <Record type="HKQuantityTypeIdentifierStepCount" value="3500" unit="count"
          startDate="2024-01-15 08:00:00 +0000" endDate="2024-01-15 09:00:00 +0000" sourceName="iPhone"/>
  <Record type="HKQuantityTypeIdentifierStepCount" value="2200" unit="count"
          startDate="2024-01-15 14:00:00 +0000" endDate="2024-01-15 15:00:00 +0000" sourceName="iPhone"/>
  <Record type="HKQuantityTypeIdentifierStepCount" value="4100" unit="count"
          startDate="2024-01-16 09:30:00 +0000" endDate="2024-01-16 10:30:00 +0000" sourceName="iPhone"/>
  <Record type="HKQuantityTypeIdentifierHeartRate" value="68" unit="count/min"
          startDate="2024-01-15 08:30:00 +0000" endDate="2024-01-15 08:30:00 +0000" sourceName="Apple Watch"/>
  <Record type="HKQuantityTypeIdentifierHeartRate" value="74" unit="count/min"
          startDate="2024-01-15 18:30:00 +0000" endDate="2024-01-15 18:30:00 +0000" sourceName="Apple Watch"/>
  <Record type="HKQuantityTypeIdentifierHeartRate" value="71" unit="count/min"
          startDate="2024-01-16 08:30:00 +0000" endDate="2024-01-16 08:30:00 +0000" sourceName="Apple Watch"/>
  <Record type="HKCategoryTypeIdentifierSleepAnalysis" value="HKCategoryValueSleepAnalysisAsleepDeep"
          startDate="2024-01-15 23:00:00 +0000" endDate="2024-01-16 02:00:00 +0000" sourceName="Apple Watch"/>
  <Record type="HKCategoryTypeIdentifierSleepAnalysis" value="HKCategoryValueSleepAnalysisAsleepREM"
          startDate="2024-01-16 02:00:00 +0000" endDate="2024-01-16 06:30:00 +0000" sourceName="Apple Watch"/>
  <Record type="HKQuantityTypeIdentifierBodyMass" value="72.5" unit="kg"
          startDate="2024-01-15 07:00:00 +0000" endDate="2024-01-15 07:00:00 +0000" sourceName="Withings"/>
  <Record type="HKQuantityTypeIdentifierActiveEnergyBurned" value="245" unit="kcal"
          startDate="2024-01-15 12:00:00 +0000" endDate="2024-01-15 13:00:00 +0000" sourceName="Apple Watch"/>
</HealthData>`
