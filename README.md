# vite-plugin-sheets

Relaces `%sheets.<sheet>.<slot>%` with content.

Useful when using Google Sheets as CMS. Spreadsheet must be shared with the service account.

Check out the [Sheets API](https://developers.google.com/sheets/api/) to get started. You must have a Google Cloud Project with the "Sheets API" enabled.

|:warning: Warning |
|:------------------|
|Only loads sheets data once per build, this is to save API calls. Therefore changes made to the sheets during development will not be displayed until restarting the dev server.|

#### Required Options

- `creds`: Path to [service account credentials](https://console.cloud.google.com/iam-admin/serviceaccounts)
- `spreadsheetId`: Defines what Spreadsheet ID to point to

#### Other Options

- `slotColumn`: Defaults to `0`. Which column to look use as slots.
- `contentColumn`: Defaults to `1`. Same as `slotColumn` but for the content.
- `ignore`: Defaults to `true`. Weather or not to treat row `1` as a header column.


### Sample Config

```js
export default {
  plugins: [
    sheets({
      creds: "creds.json",
      spreadsheetId: process.env.SPREADSHEET_ID
    })
  ]
}
```

### Sample Sheet Setup

#### "Home" Sheet

|Slot|Content|
|-|-|
|title|Awesome Title|
|content|Cool content|

#### "About" Sheet

|Slot|Content|
|-|-|
|title|About Us|
|something|Other stuff|

The header row gets ignored by default.
- `title` in the "Home" sheet would be mapped to `%sheets.home.title%`
- `content` in the "Home" sheet would be mapped to `%sheets.home.content%`
- `title` in the "About" sheet would be mapped to `%sheets.about.title%`
- `something` in the "About" sheet would be mapped to `%sheets.about.something%`