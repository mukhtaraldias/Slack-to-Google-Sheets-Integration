# Slack to Google Sheets Integration

This project is a Google Apps Script that extracts specific data from Slack messages (using `app_mention` events) and logs them into Google Sheets. It is designed to handle messages containing bank transaction details and store them in a structured format.

## Features
- Extracts **Source Bank**, **Beneficiary Bank**, **Total**, **FFB**, and **Notes** from Slack messages.
- Converts timestamps to Jakarta time (UTC+7).
- Generates a direct link to the Slack message for easy reference.
- Logs all data into a Google Sheet for further analysis.

## Example Data
Here’s an example of how the data looks in Google Sheets:

| Timestamp (UTC)       | Date (WIB)   | Time (WIB)   | Source Bank | Beneficiary Bank | Total | FFB | Notes                     | Link Slack                                      |
|-----------------------|--------------|--------------|-------------|------------------|-------|-----|--------------------------|------------------------------------------------|
| 2023-10-25T12:34:56Z  | 10/25/2023   | 7:34:56 PM   | BRI         | BCA              | 9000  | 5   | Insufficient balance      | [Link](https://slack.com/archives/C1234567890/p1698257696123456) |
| 2023-10-25T12:35:10Z  | 10/25/2023   | 7:35:10 PM   | BCA         | Mandiri          | 10000 | 10  | Delayed until balance safe| [Link](https://slack.com/archives/C1234567890/p1698257710123456) |

## Setup Instructions
1. **Clone this repository**:
   ```bash
   git clone https://github.com/mukhtaraldias/Slack-to-Google-Sheets-Integration.git

2. Deploy the script:
	- Copy the script from Script.js into a new Google Apps Script project.
	- Deploy the script as a web app and get the webhook URL.

3. Configure Slack:
	- Add the webhook URL to your Slack app’s Event Subscriptions.
	- Enable the app_mention event.

4. Test the integration:

	- Mention the app in a Slack message with a sample transaction (e.g., @MyApp H2H BRI to BCA\nTotal 9000 (5 ffb)\nWith notes Insufficient balance).

	- Check the Google Sheet to see the logged data.

##Technologies Used
Google Apps Script: For handling Slack webhooks and Google Sheets integration.

Slack API: For receiving app_mention events.

Regular Expressions: For extracting data from Slack messages.