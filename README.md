# vite-plugin-sheets

Relaces `%sheets.<title>%` with content.

Useful when using Google Sheets as CMS.

### Required Options

- `creds`: Path to [service account credentials](https://console.cloud.google.com/iam-admin/serviceaccounts)

### Required Environment Variables

- `SPREADSHEET_ID`: Defines what Spreadsheet ID to point to

### Optional Environment Variables

- `SHEET`: Sheet name to pull data from. Defaults to `Sheet1`


### Sample Config

```js
export default {
  plugins: [
    sheets({
      creds: "creds.json"
    })
  ]
}
```

### Sample `.env`

```
SPREADSHEET_ID=<your-spreadsheet-id>
SHEET=Sheet1
```