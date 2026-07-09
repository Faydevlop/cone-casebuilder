# Google Apps Script — Relational Multi-Sheet Case Logger

Paste this updated code into your Google Apps Script editor (`script.google.com`). 

---

## Updated Apps Script Code

```javascript
/**
 * GET handler — fetches all cases for the Dashboard
 * URL: ?action=list
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'list';
  if (action === 'list') {
    return listCases();
  }
  return ContentService
    .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST handler — create, update, or delete cases
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var contents = (e && e.postData && e.postData.contents) ? JSON.parse(e.postData.contents) : null;
    
    if (!contents) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "No data provided" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var action = contents.action || 'create';
    var caseId = contents.caseId || (contents.data && contents.data.id) || 'case_' + new Date().getTime();
    var data = contents.data || contents;

    if (action === 'delete') {
      deleteCaseFromAllSheets(caseId);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'update') {
      // 1. Delete old rows from all sheets
      deleteCaseFromAllSheets(caseId);
      
      // 2. Insert new data
      insertCaseToAllSheets(caseId, data);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Default: 'create'
    insertCaseToAllSheets(caseId, data);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "Data saved successfully.",
        caseId: caseId
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── CRUD Helper Functions ──────────────────────────────────────────────────

function getOrCreateSheet(ss, sheetName, headers) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}

function deleteCaseFromAllSheets(caseId) {
  var sheets = ["step1", "step2", "step3", "step4", "step5", "step6", "step7", "step8", "verification"];
  sheets.forEach(function(name) {
    deleteRowsMatchingId(name, "caseId", caseId);
  });
}

function deleteRowsMatchingId(sheetName, idColName, matchId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  var headers = data[0];
  var idColIdx = headers.indexOf(idColName);
  if (idColIdx === -1) return;
  
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idColIdx]) === String(matchId)) {
      sheet.deleteRow(i + 1);
    }
  }
}

function insertCaseToAllSheets(caseId, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!data) return;

  // ===========================
  // STEP 1: Case Overview
  // ===========================
  if (data.step1) {
    var sh = getOrCreateSheet(ss, "step1", [
      "caseId", "added by", "Case Title", "Learning Objective", "Critical Time Limit", "Speciality", "Case Category", "Show Countdown"
    ]);
    sh.appendRow([
      caseId,
      data.step1.addedBy || "",
      data.step1.caseTitle,
      data.step1.learningObjective,
      data.step1.criticalTimeLimit,
      data.step1.speciality,
      data.step1.caseCategory,
      data.step1.showCountdown
    ]);
  }

  // ===========================
  // STEP 2: Demographics & Vitals
  // ===========================
  if (data.step2) {
    var sh = getOrCreateSheet(ss, "step2", [
      "caseId", "Age", "Gender", "Weight", "Weight Unit", "Height", "Height Unit", "Blood Group",
      "Heart Rate", "Systolic BP", "Diastolic BP", "SpO2", "Respiratory Rate", "Pain Score"
    ]);
    var v = data.step2.baselineVitals || {};
    sh.appendRow([
      caseId,
      data.step2.age,
      data.step2.gender,
      data.step2.weight,
      data.step2.weightUnit,
      data.step2.height,
      data.step2.heightUnit,
      data.step2.bloodGroup,
      v.heartRate,
      v.bpSystolic,
      v.bpDiastolic,
      v.spO2,
      v.respRate,
      v.painScore
    ]);
  }

  // ===========================
  // STEP 3: Patient History
  // ===========================
  if (data.step3) {
    var sh = getOrCreateSheet(ss, "step3", [
      "caseId", "Chief Complaint", "Opening Line", "HPI", "Current Medications", "Drug Allergies",
      "Known Allergies", "Habits", "Past Medical History", "Symptoms", "Family Medical History", "Is Conscious"
    ]);
    sh.appendRow([
      caseId,
      data.step3.chiefComplaint,
      data.step3.openingLine,
      data.step3.historyOfPresentIllness,
      data.step3.currentMedications,
      data.step3.drugAllergies,
      (data.step3.knownAllergies || []).join(", "),
      (data.step3.habits || []).join(", "),
      data.step3.pastMedicalHistory,
      (data.step3.symptoms || []).join(", "),
      data.step3.familyMedicalHistory,
      data.step3.isConscious
    ]);
  }

  // ===========================
  // STEP 4: Configured Actions
  // ===========================
  if (data.step4 && data.step4.actions) {
    var sh = getOrCreateSheet(ss, "step4", [
      "caseId", "caseTitle", "id", "actionName", "actionCategory", "timeCost",
      "hasRecommendedWindow", "recommendedWithinSeconds", "scanImageUrl", "resultText",
      "vitalEffectOnTime.heartRate", "vitalEffectOnTime.bpSystolic", "vitalEffectOnTime.bpDiastolic",
      "vitalEffectOnTime.spO2", "vitalEffectOnTime.respRate", "vitalEffectOnTime.painScore",
      "vitalEffectDelayed.heartRate", "vitalEffectDelayed.bpSystolic", "vitalEffectDelayed.bpDiastolic",
      "vitalEffectDelayed.spO2", "vitalEffectDelayed.respRate", "vitalEffectDelayed.painScore",
      "vitalEffectNotPerformed.heartRate", "vitalEffectNotPerformed.bpSystolic", "vitalEffectNotPerformed.bpDiastolic",
      "vitalEffectNotPerformed.spO2", "vitalEffectNotPerformed.respRate", "vitalEffectNotPerformed.painScore",
      "completionScore", "penaltyDelayed", "penaltyNotPerformed",
      "observation.prompt", "observation.options", "professionalSuggestions", "patientSafeOutput", "medicationDose"
    ]);

    data.step4.actions.forEach(function(action) {
      var observationPrompt = "";
      var observationOptions = "";

      if (action.observation) {
        observationPrompt = action.observation.prompt || "";
        observationOptions = (action.observation.options || [])
          .map(function(opt) {
            return opt.text + " (" + opt.isCorrect + ")";
          })
          .join(" | ");
      }

      var von = action.vitalEffectOnTime || {};
      var vdel = action.vitalEffectDelayed || {};
      var vmiss = action.vitalEffectNotPerformed || {};

      sh.appendRow([
        caseId,
        (data.step1 && data.step1.caseTitle) || "",
        action.id,
        action.actionName,
        action.actionCategory,
        action.timeCost,

        action.hasRecommendedWindow,
        action.recommendedWithinSeconds,

        action.scanImageUrl || "",
        action.safePatientImageUrl || "",

        // Expanded OnTime vital columns
        von.heartRate !== undefined ? von.heartRate : "",
        von.bpSystolic !== undefined ? von.bpSystolic : "",
        von.bpDiastolic !== undefined ? von.bpDiastolic : "",
        von.spO2 !== undefined ? von.spO2 : "",
        von.respRate !== undefined ? von.respRate : "",
        von.painScore !== undefined ? von.painScore : "",

        // Expanded Delayed vital columns
        vdel.heartRate !== undefined ? vdel.heartRate : "",
        vdel.bpSystolic !== undefined ? vdel.bpSystolic : "",
        vdel.bpDiastolic !== undefined ? vdel.bpDiastolic : "",
        vdel.spO2 !== undefined ? vdel.spO2 : "",
        vdel.respRate !== undefined ? vdel.respRate : "",
        vdel.painScore !== undefined ? vdel.painScore : "",

        // Expanded Miss vital columns
        vmiss.heartRate !== undefined ? vmiss.heartRate : "",
        vmiss.bpSystolic !== undefined ? vmiss.bpSystolic : "",
        vmiss.bpDiastolic !== undefined ? vmiss.bpDiastolic : "",
        vmiss.spO2 !== undefined ? vmiss.spO2 : "",
        vmiss.respRate !== undefined ? vmiss.respRate : "",
        vmiss.painScore !== undefined ? vmiss.painScore : "",

        action.completionScore,
        action.penaltyDelayed,
        action.penaltyNotPerformed,

        observationPrompt,
        observationOptions,
        
        "", // professionalSuggestions (removed in front-end)
        action.safePatientImageUrl || "", // patientSafeOutput mapped to safePatientImageUrl scan
        action.medicationDose || ""
      ]);
    });
  }

  // ===========================
  // STEP 5: Scoring Thresholds
  // ===========================
  if (data.step5) {
    var sh = getOrCreateSheet(ss, "step5", [
      "caseId", "Success Threshold Limit", "Partial Success Limit"
    ]);
    sh.appendRow([
      caseId,
      data.step5.successThresholdSeconds,
      data.step5.partialThresholdSeconds
    ]);
  }

  // ===========================
  // STEP 6: Evidence Pack
  // ===========================
  if (data.step6 && data.step6.evidenceFiles) {
    var sh = getOrCreateSheet(ss, "step6", ["caseId", "Evidence Reference Files"]);
    var fileNames = data.step6.evidenceFiles.map(function(ev) {
      return ev.title + " (" + (ev.fileUrl || "") + ")";
    }).join(", ");
    
    sh.appendRow([
      caseId,
      fileNames
    ]);
  }

  // ===========================
  // STEP 7: Clinical Pathway
  // ===========================
  if (data.step7) {
    var sh = getOrCreateSheet(ss, "step7", ["caseId", "Expected Clinical Pathway Order"]);
    sh.appendRow([
      caseId,
      data.step7
    ]);
  }

  // ===========================
  // STEP 8: Notes / Publish
  // ===========================
  if (data.step8) {
    var sh = getOrCreateSheet(ss, "step8", ["caseId", "Feedback Notes"]);
    sh.appendRow([
      caseId,
      data.step8.notes
    ]);
  }

  // ===========================
  // VERIFIED STATUS
  // ===========================
  if (data.hasOwnProperty("isVerified")) {
    var sh = getOrCreateSheet(ss, "verification", ["caseId", "Is Case Verified"]);
    sh.appendRow([
      caseId,
      data.isVerified
    ]);
  }
}

function listCases() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("step1");
  
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ cases: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) {
    return ContentService
      .createTextOutput(JSON.stringify({ cases: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var cases = [];
  
  for (var i = 1; i < values.length; i++) {
    var caseId = String(values[i][0]);
    if (!caseId) continue;
    
    var compiled = getCaseFullData(ss, caseId);
    
    cases.push({
      caseId: caseId,
      title: compiled.step1.caseTitle || "Untitled",
      speciality: compiled.step1.speciality || "Not specified",
      category: compiled.step1.caseCategory || "general",
      timeLimit: compiled.step1.criticalTimeLimit || 0,
      actionsCount: compiled.step4.actions.length,
      evidenceCount: compiled.step6.evidenceFiles.length,
      pathwayCount: compiled.step7.pathwaySteps.length,
      updatedAt: new Date().toISOString(),
      fullData: compiled
    });
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ cases: cases }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Relational Recompiler Helper Functions ──────────────────────────────────

function findFirstRowMatchingId(ss, sheetName, idColName, matchId) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;
  
  var headers = data[0];
  var idColIdx = headers.indexOf(idColName);
  if (idColIdx === -1) return null;
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idColIdx]) === String(matchId)) {
      var obj = {};
      headers.forEach(function(h, idx) {
        obj[h] = data[i][idx];
      });
      return obj;
    }
  }
  return null;
}

function findAllRowsMatchingId(ss, sheetName, idColName, matchId) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var headers = data[0];
  var idColIdx = headers.indexOf(idColName);
  if (idColIdx === -1) return [];
  
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idColIdx]) === String(matchId)) {
      var obj = {};
      headers.forEach(function(h, idx) {
        obj[h] = data[i][idx];
      });
      rows.push(obj);
    }
  }
  return rows;
}

function splitCommaString(str) {
  if (!str) return [];
  return String(str).split(',').map(function(s) { return s.trim(); }).filter(Boolean);
}

function parseVitalEffect(row, prefix) {
  var keys = ["heartRate", "bpSystolic", "bpDiastolic", "spO2", "respRate", "painScore"];
  var effect = {};
  var hasValue = false;
  keys.forEach(function(k) {
    var sheetHeader = prefix + "." + k;
    var val = row[sheetHeader];
    if (val !== undefined && val !== null && val !== "") {
      effect[k] = Number(val);
      hasValue = true;
    } else {
      effect[k] = null;
    }
  });
  return effect;
}

function parseObservation(row) {
  var prompt = row["observation.prompt"] || "";
  var rawOptions = row["observation.options"] || "";
  if (!prompt && !rawOptions) return null;
  
  var options = [];
  if (rawOptions) {
    var parts = rawOptions.split('|');
    parts.forEach(function(p, pIdx) {
      var text = p.trim();
      var isCorrect = false;
      if (text.indexOf("(true)") !== -1) {
        isCorrect = true;
        text = text.replace("(true)", "").trim();
      } else if (text.indexOf("(false)") !== -1) {
        isCorrect = false;
        text = text.replace("(false)", "").trim();
      }
      options.push({
        id: "opt_" + pIdx + "_" + new Date().getTime(),
        text: text,
        isCorrect: isCorrect
      });
    });
  }
  return {
    prompt: prompt,
    options: options
  };
}

function parseEvidenceFiles(str) {
  if (!str) return [];
  var files = [];
  var parts = str.split(',');
  parts.forEach(function(p, pIdx) {
    p = p.trim();
    if (!p) return;
    var name = p;
    var url = null;
    var startIdx = p.indexOf('(');
    var endIdx = p.lastIndexOf(')');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      name = p.substring(0, startIdx).trim();
      url = p.substring(startIdx + 1, endIdx).trim();
    }
    files.push({
      id: "ev_" + pIdx + "_" + new Date().getTime(),
      name: name,
      title: name,
      fileUrl: url,
      fileFile: null,
      description: ""
    });
  });
  return files;
}

function parsePathwaySteps(str, actions) {
  if (!str) return [];
  var steps = [];
  var names = str.split(',');
  names.forEach(function(n, idx) {
    n = n.trim();
    if (!n) return;
    var action = actions.find(function(a) {
      return a.actionName.trim().toLowerCase() === n.toLowerCase();
    });
    steps.push({
      id: "step_" + idx + "_" + new Date().getTime(),
      actionId: action ? action.id : "mock_action_id_" + idx,
      isCritical: true
    });
  });
  return steps;
}

function getCaseFullData(ss, caseId) {
  var full = {
    id: caseId,
    step1: {},
    step2: {},
    step3: {},
    step4: { actions: [] },
    step5: {},
    step6: { evidenceFiles: [] },
    step7: { pathwaySteps: [] },
    step8: {},
    isVerified: false
  };

  // 1. STEP 1
  var row1 = findFirstRowMatchingId(ss, "step1", "caseId", caseId);
  if (row1) {
    full.step1 = {
      addedBy: row1["added by"] || "",
      caseTitle: row1["Case Title"] || "",
      learningObjective: row1["Learning Objective"] || "",
      criticalTimeLimit: Number(row1["Critical Time Limit"] || 0),
      speciality: row1["Speciality"] || "",
      caseCategory: row1["Case Category"] || "",
      showCountdown: row1["Show Countdown"] === true || String(row1["Show Countdown"]).toLowerCase() === 'true'
    };
  }

  // 2. STEP 2
  var row2 = findFirstRowMatchingId(ss, "step2", "caseId", caseId);
  if (row2) {
    full.step2 = {
      age: row2["Age"] !== "" ? Number(row2["Age"]) : "",
      gender: row2["Gender"] || "Male",
      weight: row2["Weight"] !== "" ? Number(row2["Weight"]) : "",
      weightUnit: row2["Weight Unit"] || "kg",
      height: row2["Height"] !== "" ? Number(row2["Height"]) : "",
      heightUnit: row2["Height Unit"] || "cm",
      bloodGroup: row2["Blood Group"] || "",
      baselineVitals: {
        heartRate: Number(row2["Heart Rate"] || 72),
        bpSystolic: Number(row2["Systolic BP"] || 120),
        bpDiastolic: Number(row2["Diastolic BP"] || 80),
        spO2: Number(row2["SpO2"] || 98),
        respRate: Number(row2["Respiratory Rate"] || 16),
        painScore: Number(row2["Pain Score"] || 0)
      }
    };
  }

  // 3. STEP 3
  var row3 = findFirstRowMatchingId(ss, "step3", "caseId", caseId);
  if (row3) {
    full.step3 = {
      chiefComplaint: row3["Chief Complaint"] || "",
      openingLine: row3["Opening Line"] || "",
      historyOfPresentIllness: row3["HPI"] || "",
      currentMedications: row3["Current Medications"] || "",
      drugAllergies: row3["Drug Allergies"] || "",
      knownAllergies: splitCommaString(row3["Known Allergies"]),
      habits: splitCommaString(row3["Habits"]),
      pastMedicalHistory: row3["Past Medical History"] || "",
      symptoms: splitCommaString(row3["Symptoms"]),
      familyMedicalHistory: row3["Family Medical History"] || "",
      isConscious: row3["Is Conscious"] === true || String(row3["Is Conscious"]).toLowerCase() === 'true'
    };
  }

  // 4. STEP 4
  var rows4 = findAllRowsMatchingId(ss, "step4", "caseId", caseId);
  rows4.forEach(function(row) {
    var act = {
      id: row["id"] || row["Action ID"] || "",
      actionName: row["actionName"] || row["Action Name"] || "",
      actionCategory: row["actionCategory"] || row["Action Category"] || "",
      timeCost: Number(row["timeCost"] || row["Time Cost"] || 0),
      hasRecommendedWindow: row["hasRecommendedWindow"] === true || String(row["hasRecommendedWindow"]).toLowerCase() === 'true' || row["Has Recommended Limit"] === true || String(row["Has Recommended Limit"]).toLowerCase() === 'true',
      recommendedWithinSeconds: Number(row["recommendedWithinSeconds"] || row["Recommended Duration"] || 0),
      scanImageUrl: row["scanImageUrl"] || row["Pathological Scan URL"] || null,
      safePatientImageUrl: row["safePatientImageUrl"] || row["Safe Scan URL"] || row["patientSafeOutput"] || null,
      completionScore: row["completionScore"] !== "" ? Number(row["completionScore"] || row["Score OnTime"]) : "",
      penaltyDelayed: row["penaltyDelayed"] !== "" ? Number(row["penaltyDelayed"] || row["Penalty Delayed"]) : "",
      penaltyNotPerformed: row["penaltyNotPerformed"] !== "" ? Number(row["penaltyNotPerformed"] || row["Penalty Miss"]) : "",
      medicationDose: row["medicationDose"] || row["Medication Dose"] || "",
      
      vitalEffectOnTime: parseVitalEffect(row, "vitalEffectOnTime"),
      vitalEffectDelayed: parseVitalEffect(row, "vitalEffectDelayed"),
      vitalEffectNotPerformed: parseVitalEffect(row, "vitalEffectNotPerformed"),
      observation: parseObservation(row)
    };
    full.step4.actions.push(act);
  });

  // 5. STEP 5
  var row5 = findFirstRowMatchingId(ss, "step5", "caseId", caseId);
  if (row5) {
    full.step5 = {
      successThresholdSeconds: Number(row5["successThresholdSeconds"] || row5["Success Threshold Limit"] || 5400),
      partialThresholdSeconds: Number(row5["partialThresholdSeconds"] || row5["Partial Success Limit"] || 7200)
    };
  }

  // 6. STEP 6
  var row6 = findFirstRowMatchingId(ss, "step6", "caseId", caseId);
  if (row6) {
    var rawEvidence = row6["evidenceFiles"] || row6["Evidence Reference Files"] || "";
    full.step6.evidenceFiles = parseEvidenceFiles(rawEvidence);
  }

  // 7. STEP 7
  var row7 = findFirstRowMatchingId(ss, "step7", "caseId", caseId);
  if (row7) {
    var rawPathway = row7["pathwaySteps"] || row7["Expected Clinical Pathway Order"] || "";
    full.step7.pathwaySteps = parsePathwaySteps(rawPathway, full.step4.actions);
  }

  // 8. STEP 8
  var row8 = findFirstRowMatchingId(ss, "step8", "caseId", caseId);
  if (row8) {
    full.step8 = {
      notes: row8["notes"] || row8["Feedback Notes"] || ""
    };
  }

  // 9. VERIFICATION
  var rowVerify = findFirstRowMatchingId(ss, "verification", "caseId", caseId);
  if (rowVerify) {
    full.isVerified = rowVerify["isVerified"] === true || String(rowVerify["isVerified"]).toLowerCase() === 'true' || rowVerify["Is Case Verified"] === true || String(rowVerify["Is Case Verified"]).toLowerCase() === 'true';
  }

  return full;
}

// ─── Direct Testing Functions ──────────────────────────────────────────────

/** Select 'testDoGet' from the dropdown and click 'Run' to test listing cases */
function testDoGet() {
  var res = doGet(null);
  Logger.log("doGet response content: " + res.getContent());
}
```
