const PROPERTIES = PropertiesService.getScriptProperties();
// CALLBACK_SECRET
// REVALIDATE_URL

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("CMS")
    .addItem("Publish", "publishRows")
    .addItem("Unpublish", "unpublishRows")
    .addSeparator()
    .addItem("Settings", "showSettingsDialog")
    .addToUi();
}

function getSelectedSlugsAndUpdateTime() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const startRow = range.getRow();
  const numRows = range.getNumRows();

  const slugs = [];
  const now = new Date();

  for (let i = 0; i < numRows; i++) {
    const rowNum = startRow + i;
    if (rowNum === 1) continue;

    const slug = sheet.getRange(rowNum, 1).getValue();
    if (slug) {
      slugs.push(slug.toString().trim());
      sheet.getRange(rowNum, 11).setValue(now);
    }
  }

  return slugs;
}

function pingRevalidateApi(slugs) {
  const revalidateUrl = PROPERTIES.getProperty("REVALIDATE_URL");
  const callbackSecret = PROPERTIES.getProperty("CALLBACK_SECRET");

  if (!revalidateUrl || !callbackSecret) {
    throw new Error("Revalidate settings not configured");
  }

  const sheetName = SpreadsheetApp.getActiveSheet().getName();

  let successCount = 0;

  slugs.forEach((slug) => {
    try {
      const fullPath = `/${sheetName}/${slug}`;

      const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, callbackSecret + ":" + fullPath)
        .map((byte) => {
          const val = (byte & 0xff).toString(16);
          return val.length === 1 ? "0" + val : val;
        })
        .join("");

      const payload = { slug: fullPath, secret: hash };

      const response = UrlFetchApp.fetch(revalidateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        muteHttpExceptions: true,
        payload: JSON.stringify(payload),
      });

      if (response.getResponseCode() === 200) {
        successCount++;
      }
    } catch (e) {
      console.error(slug, e);
    }
  });

  return successCount;
}

function publishRows() {
  const slugs = getSelectedSlugsAndUpdateTime();

  if (slugs.length === 0) {
    SpreadsheetApp.getUi().alert("Select rows with slugs first");
    return;
  }

  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();

  sheet.getRange(range.getRow(), 6, range.getNumRows(), 1).setValue("published");

  const success = pingRevalidateApi(slugs);

  SpreadsheetApp.getUi().alert(`Published ${success}/${slugs.length} items`);
}

function unpublishRows() {
  const slugs = getSelectedSlugsAndUpdateTime();

  if (slugs.length === 0) {
    SpreadsheetApp.getUi().alert("Select rows with slugs first");
    return;
  }

  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();

  sheet.getRange(range.getRow(), 6, range.getNumRows(), 1).setValue("draft");

  pingRevalidateApi(slugs);

  SpreadsheetApp.getUi().alert(`Unpublished ${slugs.length} items`);
}

function showSettingsDialog() {
  const template = HtmlService.createTemplateFromFile("SettingsDialog");
  const html = template.evaluate().setWidth(500).setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, "CMS Settings");
}

function saveSettings(revalidateUrl, secret) {
  PROPERTIES.setProperties({
    REVALIDATE_URL: revalidateUrl,
    CALLBACK_SECRET: secret,
  });

  return "Settings saved";
}
