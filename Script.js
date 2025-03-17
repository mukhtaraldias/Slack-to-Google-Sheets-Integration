/**
 * Slack to Google Sheets Integration
 * 
 * This script handles Slack's `app_mention` events, extracts relevant data from messages,
 * and logs the data into a Google Sheet. It supports extracting:
 * - Source Bank
 * - Beneficiary Bank
 * - Total amount
 * - FFB (Fresh Fruit Bunches) quantity
 * - Notes
 * It also generates a direct link to the Slack message for reference.
 */

function doPost(e) {
  try {
    // Log the incoming data from Slack for debugging
    Logger.log("Data received from Slack: " + JSON.stringify(e));

    // Parse the JSON data from the request
    const data = JSON.parse(e.postData.contents);
    Logger.log("Parsed data: " + JSON.stringify(data));

    // Handle URL verification request from Slack
    if (data.type === "url_verification") {
      Logger.log("URL verification request received.");
      const challenge = data.challenge;
      Logger.log("Challenge: " + challenge);

      // Respond with the challenge value to verify the URL
      return ContentService.createTextOutput(JSON.stringify({ challenge: challenge })).setMimeType(ContentService.MimeType.JSON);
    }

    // Handle app_mention event
    if (data.event && data.event.type === "app_mention") {
      const messageText = data.event.text;
      Logger.log("Message received: " + messageText);

      // Extract relevant data from the message
      const sourceBank = extractSourceBank(messageText);
      const beneficiaryBank = extractBeneficiaryBank(messageText);
      const total = extractTotal(messageText);
      const ffb = extractFFB(messageText);
      const notes = extractNotes(messageText);
      const linkSlack = generateSlackLink(data.event.channel, data.event.ts);

      // Log the extracted data for debugging
      Logger.log("Source Bank: " + sourceBank);
      Logger.log("Beneficiary Bank: " + beneficiaryBank);
      Logger.log("Total: " + total);
      Logger.log("FFB: " + ffb);
      Logger.log("Notes: " + notes);
      Logger.log("Link Slack: " + linkSlack);

      // Convert the timestamp to Jakarta time (UTC+7)
      const timestamp = new Date(data.event.ts * 1000); // Convert Slack timestamp to JavaScript Date object
      const options = { timeZone: "Asia/Jakarta" };
      const dateTime = timestamp.toLocaleString("en-US", options).split(", ");
      const date = dateTime[0]; // Date in MM/DD/YYYY format
      const time = dateTime[1]; // Time in HH:MM:SS AM/PM format

      // Log the data into Google Sheets
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      sheet.appendRow([
        timestamp.toISOString(), // Timestamp in UTC
        date, // Date in WIB
        time, // Time in WIB
        sourceBank, // Source Bank
        beneficiaryBank, // Beneficiary Bank
        total, // Total amount
        ffb, // FFB quantity
        notes, // Notes
        linkSlack, // Link to the Slack message
      ]);

      Logger.log("Data successfully written to sheet.");
    }
  } catch (error) {
    // Log any errors that occur during execution
    Logger.log("Error: " + error.toString());
  }

  // Return a success response to Slack
  return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Extracts the Source Bank from the message.
 * The Source Bank is the word following "H2H".
 * 
 * @param {string} message - The Slack message text.
 * @returns {string} - The Source Bank or "N/A" if not found.
 */
function extractSourceBank(message) {
  const regex = /H2H\s+(\w+)/i; // Regex to find the word after "H2H"
  const match = message.match(regex);
  return match && match[1] ? match[1] : "N/A"; // Return the matched word or "N/A"
}

/**
 * Extracts the Beneficiary Bank from the message.
 * The Beneficiary Bank is the text between "to" and "Total".
 * 
 * @param {string} message - The Slack message text.
 * @returns {string} - The Beneficiary Bank or "N/A" if not found.
 */
function extractBeneficiaryBank(message) {
  const regex = /to\s+([\s\S]*?)\s+Total/i; // Regex to find text between "to" and "Total"
  const match = message.match(regex);
  return match && match[1] ? match[1].trim() : "N/A"; // Return the matched text or "N/A"
}

/**
 * Extracts the Total amount from the message.
 * The Total is the number following the word "Total".
 * 
 * @param {string} message - The Slack message text.
 * @returns {string} - The Total amount or "N/A" if not found.
 */
function extractTotal(message) {
  const regex = /Total\s+(\d+)/i; // Regex to find the number after "Total"
  const match = message.match(regex);
  return match && match[1] ? match[1] : "N/A"; // Return the matched number or "N/A"
}

/**
 * Extracts the FFB (Fresh Fruit Bunches) quantity from the message.
 * The FFB is the number before the word "ffb".
 * 
 * @param {string} message - The Slack message text.
 * @returns {string} - The FFB quantity or "N/A" if not found.
 */
function extractFFB(message) {
  const regex = /(\d+)\s+ffb/i; // Regex to find the number before "ffb"
  const match = message.match(regex);
  return match && match[1] ? match[1] : "N/A"; // Return the matched number or "N/A"
}

/**
 * Extracts the Notes from the message.
 * The Notes are all the text after the word "notes" until the end of the line or message.
 * 
 * @param {string} message - The Slack message text.
 * @returns {string} - The Notes or "N/A" if not found.
 */
function extractNotes(message) {
  const regex = /notes\s+([\s\S]*?)(\n|$)/i; // Regex to find text after "notes"
  const match = message.match(regex);
  return match && match[1] ? match[1].trim() : "N/A"; // Return the matched text or "N/A"
}

/**
 * Generates a direct link to the Slack message.
 * 
 * @param {string} channelId - The Slack channel ID.
 * @param {string} timestamp - The Slack message timestamp.
 * @returns {string} - The direct link to the Slack message.
 */
function generateSlackLink(channelId, timestamp) {
  const workspaceUrl = "https://your-slack-workspace.slack.com"; // Replace with your Slack workspace URL
  return `${workspaceUrl}/archives/${channelId}/p${timestamp.replace(".", "")}`;
}