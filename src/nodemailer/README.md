# MCP Nodemailer Server

An MCP server implementation for sending emails using nodemailer. This server provides a simple interface for sending emails with attachments and dynamically generated content.

## Features

- Send emails with text or HTML content
- Support for file attachments
- Dynamic content generation for attachments (like conversation summaries)
- HTML emails with plaintext fallback
- Integration with major email services (Gmail, Outlook, etc.)
- Secure credential management through environment variables
- Email address allow-listing and block-listing support

## Installation

```bash
npm install nodemailer-kurtseifried
```

## Configuration

Configure the server in your Claude Desktop configuration file (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "nodemailer": {
      "command": "nodemailer-kurtseifried",
      "env": {
        "EMAIL_SERVICE": "gmail",
        "EMAIL_FROM": "your-email@gmail.com",
        "EMAIL_USERNAME": "your-email@gmail.com",
        "EMAIL_PASSWORD": "your-app-specific-password",
        "EMAIL_ALLOW_LIST": "[\"example.com\", \"@trusted.com\", \"specific@example.org\"]"
      }
    }
  }
}
```

### Required Environment Variables

- `EMAIL_SERVICE`: The email service to use (e.g., "gmail", "outlook")
- `EMAIL_FROM`: The email address to send from
- `EMAIL_USERNAME`: Username for authentication
- `EMAIL_PASSWORD`: Password for authentication (use app-specific passwords for better security)

### Optional Environment Variables

- `EMAIL_ALLOW_LIST`: JSON array of allowed email patterns
- `EMAIL_BLOCK_LIST`: JSON array of blocked email patterns

Note: You can only use either `EMAIL_ALLOW_LIST` or `EMAIL_BLOCK_LIST`, not both simultaneously.

### Email Pattern Formats

The allow_list and block_list support three types of patterns:

1. Exact email matches: `"user@example.com"` - Matches only this specific email
2. Domain matches: `"@example.com"` - Matches any email at example.com
3. Wildcard domain matches: `"example.com"` - Matches example.com and all subdomains

Examples:
```json
{
  "EMAIL_ALLOW_LIST": "[\"@company.com\", \"partner@external.com\", \"trusted-domain.com\"]"
}
```

This would allow:
- Any email @company.com
- Specifically partner@external.com
- Any email @trusted-domain.com and its subdomains

### Supported Email Services

The server supports all major email services including:

- Gmail
- Outlook.com / Hotmail.com
- Yahoo Mail
- Fastmail
- iCloud Mail
- And any custom SMTP server through service configuration

## Usage Examples

The server exposes a single tool called `send_email` that can be used to send emails. Here are some example usages:

### Basic Text Email

```json
{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "message_content": "This is a test email"
}
```

### HTML Email

```json
{
  "to": "recipient@example.com",
  "subject": "HTML Email Example",
  "message_content": "<h1>Hello</h1><p>This is a <strong>formatted</strong> email.</p>"
}
```

### Email with Attachments

```json
{
  "to": "recipient@example.com",
  "subject": "Email with Attachment",
  "message_content": "Please find the attached file",
  "attachments": [
    {
      "filename": "report.txt",
      "content": "This is the content of the attached file",
      "contentType": "text/plain"
    }
  ]
}
```

### Email with Generated Content Attachment

```json
{
  "to": "recipient@example.com",
  "subject": "Email with Generated Content",
  "message_content": "Please find the conversation summary attached",
  "attachments": [
    {
      "filename": "summary.md",
      "generateContent": {
        "type": "conversation_summary",
        "parameters": {
          "format": "markdown",
          "style": "technical"
        }
      }
    }
  ]
}
```

### Email with Custom Generated Content

```json
{
  "to": "recipient@example.com",
  "subject": "Custom Generated Content",
  "message_content": "Here's your custom report",
  "attachments": [
    {
      "filename": "report.txt",
      "generateContent": {
        "type": "custom",
        "parameters": {
          "custom_prompt": "Generate a report about...",
          "format": "text"
        }
      }
    }
  ]
}
```

## Development

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`

### Running Tests

The test suite includes:
- Server initialization tests
- Email sending tests
- Attachment handling tests
- Error handling tests
- Email validation and pattern matching tests

Run the tests with:

```bash
npm test
```

## Security Considerations

1. **Email Credentials**: Use app-specific passwords where possible, especially for Gmail
2. **Environment Variables**: Never commit email credentials to version control
3. **HTML Content**: The server sanitizes HTML content by default
4. **File Attachments**: Maximum attachment size is limited by the email service
5. **Email Validation**: Use allow_list to restrict recipients to trusted domains
6. **Block List**: Use block_list to prevent emails to known problematic addresses

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.