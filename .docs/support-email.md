# Support Email Setup (`support@uenrol.ca`)

This document explains how the support email was configured for `uenrol.ca` so incoming emails sent to `support@uenrol.ca` are received in a personal Gmail inbox, and replies can be sent from Gmail as `support@uenrol.ca`.

## Goal

Set up:

- `support@uenrol.ca` as the public support email
- Incoming emails forwarded to a personal Gmail account
- Outgoing replies sent from Gmail while showing `support@uenrol.ca` as the sender

## Final Architecture

### Incoming mail
- Domain DNS is managed in Cloudflare
- Cloudflare Email Routing receives mail for `support@uenrol.ca`
- Cloudflare forwards incoming mail to the personal Gmail inbox

### Outgoing mail
- Gmail is configured with a custom “Send mail as” address
- Gmail uses `smtp.gmail.com`
- Authentication is done using a Google App Password
- Outgoing messages appear as coming from `support@uenrol.ca`

## Requirements

- Domain name: `uenrol.ca`
- Cloudflare account
- Gmail account
- Google 2-Step Verification enabled on the Gmail account

## Step 1: Add the domain to Cloudflare

1. Add `uenrol.ca` to Cloudflare.
2. Use the Free plan.
3. Update the domain nameservers at the registrar to the Cloudflare-assigned nameservers.
4. Wait until the domain becomes active in Cloudflare.

## Step 2: Add basic DNS records for the website

Two A records were added for the server IP:

- `A` → `uenrol.ca` → server IP
- `A` → `www` → server IP

For website records, proxying can remain enabled if desired.

## Step 3: Enable Cloudflare Email Routing

1. In Cloudflare, open **Email > Email Routing**.
2. Start setup for Email Routing.
3. Add a custom address:
   - `support@uenrol.ca`
4. Set the destination email address to the personal Gmail account.
5. Continue setup.

Cloudflare automatically adds the required email DNS records.

## Step 4: Verify email DNS records

Cloudflare Email Routing requires mail-related DNS records such as:

- MX records for Cloudflare’s routing servers
- SPF TXT record
- DKIM TXT record

Important:

- Email-related DNS records must remain **DNS only**
- Do **not** proxy MX or TXT email records

Once Cloudflare finishes configuration, Email Routing status should become active/synced.

## Step 5: Verify forwarding destination

Cloudflare sends a verification email to the destination Gmail address.

1. Open the Gmail inbox.
2. Find the Cloudflare verification message.
3. Confirm the forwarding destination.

After this step, emails sent to `support@uenrol.ca` should arrive in the Gmail inbox.

## Step 6: Configure Gmail to send as `support@uenrol.ca`

In Gmail:

1. Open **Settings > See all settings**
2. Open **Accounts and Import**
3. Under **Send mail as**, click **Add another email address**
4. Use:
   - Name: `Support` or `uEnroll Support`
   - Email: `support@uenrol.ca`

Gmail may require SMTP configuration for custom domain sending.

## Step 7: Use Gmail SMTP

The correct SMTP settings are:

- SMTP server: `smtp.gmail.com`
- Port: `587`
- Username: your Gmail address
- Security: `TLS`

Do **not** use Cloudflare MX servers as SMTP servers.

These Cloudflare mail routing hosts are for receiving mail only and cannot send mail.

## Step 8: Create a Google App Password

A normal Gmail password will not work for SMTP in this setup.

To generate an App Password:

1. Open the Google account security settings
2. Make sure **2-Step Verification** is enabled
3. Open **App passwords**
4. Create a new app password (for example named `mail`)
5. Copy the generated password

Notes:

- This is not the regular Gmail password
- The app password is shown only once when created
- If lost, generate a new one

## Step 9: Complete Gmail SMTP verification

Back in Gmail’s custom sender setup:

- SMTP server: `smtp.gmail.com`
- Port: `587`
- Username: personal Gmail address
- Password: Google App Password
- TLS enabled

If configured correctly, Gmail accepts the credentials and sends a verification email to `support@uenrol.ca`.

Because Cloudflare Email Routing is already configured, that verification email is forwarded to the personal Gmail inbox.

## Step 10: Confirm the sender address

1. Open the forwarded verification email in Gmail
2. Click the confirmation link, or use the provided code if prompted
3. Finish the setup

After confirmation, Gmail can send mail as `support@uenrol.ca`.

## Result

The final behavior is:

- A client sends an email to `support@uenrol.ca`
- Cloudflare receives and forwards it to the personal Gmail inbox
- The team reads the message in Gmail
- Replies can be sent from Gmail as `support@uenrol.ca`

## Important Notes

### Cloudflare MX is not SMTP
The following type of value must **not** be used as an SMTP server:

- `route1.mx.cloudflare.net`
- `route2.mx.cloudflare.net`
- `route3.mx.cloudflare.net`

These are only for incoming mail routing.

### App Password is required
If Gmail reports authentication errors when using SMTP:

- verify that `smtp.gmail.com` is used
- verify port `587`
- verify TLS is selected
- verify the Gmail address is used as the username
- verify a Google App Password is used instead of the normal password

### Gmail verification codes
During setup, Gmail may send a verification code or confirmation link.

- The verification code is typically one-time use
- The App Password is reusable until revoked

## Recommended Display Name

For better presentation in replies, use:

- `uEnroll Support`

instead of only `Support`

## Optional Improvements

Possible future improvements:

- Add a Gmail signature for support replies
- Use a hosted mailbox provider later if a real standalone inbox is needed
- Add advanced sender branding such as DMARC/BIMI if desired

## Troubleshooting

### Problem: Gmail says it cannot connect to the SMTP server
Cause:
- Wrong SMTP host was used

Fix:
- Use `smtp.gmail.com`
- Do not use Cloudflare MX hosts

### Problem: Gmail says authentication failed
Cause:
- Regular Gmail password was used

Fix:
- Generate and use a Google App Password

### Problem: Verification email does not appear
Cause:
- Cloudflare Email Routing not fully active
- Destination Gmail address not yet verified

Fix:
- Check Cloudflare Email Routing status
- Confirm destination verification
- Check spam folder

### Problem: Mail records are not working
Cause:
- Email DNS records are proxied

Fix:
- Ensure email records are DNS only

## Summary

This setup provides a low-cost support email workflow without paying for a dedicated mailbox provider:

- Cloudflare handles incoming routing
- Gmail is used as the working inbox
- Gmail SMTP + App Password handles outgoing mail
- The public-facing sender address is `support@uenrol.ca`