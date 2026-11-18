# Record of Processing Activities (GDPR Article 30(1)) — Modera Group

> **INTERNAL — CONFIDENTIAL.** Controller record kept under Article 30(1) GDPR. To be made available to the Hellenic Data Protection Authority on request (Art. 30(4)). Not for publication.

| Field | Value |
|---|---|
| Document | Record of Processing Activities (RoPA), controller |
| Version | 1.0 |
| Date | 2026-11-18 |
| Owner (responsible for keeping this record current) | [NAME, ROLE] |
| Approved by | [NAME], Modera Group management |
| Next scheduled review | 2027-11-18 (or earlier on any change — see section 8) |
| Related documents | Published privacy policy, cookie policy (both last updated 2026-11-17); internal *נוהל אבטחת מידע* (`docs/compliance/data-security-procedure-he.md`) |

**Why this record is kept although Modera has fewer than 250 staff.** The Art. 30(5) exemption does not apply because enquiry, client and correspondence data are processed on a regular, not occasional, basis.

---

## 1. Controller details

| Item | Details |
|---|---|
| Controller | Modera Group |
| Registered office | 2 Plateia Eleftherias, 73132 Chania, Crete, Greece |
| VAT / Tax no. | EL802555027 |
| G.E.MI. no. | 178690758000 |
| Privacy contact | support@modera-group.com · +30 698 392 4820 |
| Management | Sivan Menahem (Founder & Chairman); Yiannis (Co-Founder & Managing Director) |
| Data Protection Officer | Not appointed. Art. 37 conditions are not met: no large-scale regular and systematic monitoring and no large-scale special-category data. Management handles privacy matters directly, as the privacy policy states. |
| Internal privacy / security lead | [NAME, ROLE] |
| EU representative (Art. 27) | Not applicable. The controller is established in the EU (Greece). |
| Lead supervisory authority | Hellenic Data Protection Authority (HDPA), www.dpa.gr |
| Other relevant authority | Israeli Privacy Protection Authority. Relevant because hosting is in Israel and enquiries arrive from Israeli residents; see the Hebrew security procedure. |

---

## 2. Processing activities

Common definitions used below:

- **Jetserver** means the hosting provider (Israel). It runs cPanel shared hosting for the website, the contact-form handler, the lead store and the mailboxes. It acts as a **processor**.
- **Lead store** means `/home/<cpanel-user>/.modera-leads/`. This directory sits outside the public web root and is denied by `.htaccess` (`Require all denied`). It is created with `0700` permissions, and each monthly file `leads-YYYY-MM.jsonl` is set to `0600`.
- **Israel transfer**: Israel holds an EU adequacy decision (Commission Decision 2011/61/EU, reconfirmed in the Commission's January 2024 review). No additional transfer tool is required (Art. 45).
- **Baseline TOMs** apply to every activity unless stated otherwise:
  - HTTPS enforced site-wide (301 redirect) with HSTS (`max-age=31536000`).
  - Strict Content-Security-Policy (`default-src 'self'`; only Google Maps frames allowed), plus `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy` and `Cross-Origin-Opener-Policy: same-origin`.
  - Directory listing disabled.
  - Access limited to authorised staff on a need-to-know basis; strong passwords and 2FA on hosting and mail accounts (see the Hebrew procedure).

### 2.1 Website enquiries (contact form)

| Element | Entry |
|---|---|
| Purpose | Receive and answer enquiries sent through the modera-group.com contact form. Prepare a proposal. Record the consent given. |
| Legal basis (Art. 6) | Art. 6(1)(b): steps taken at the data subject's request before entering into a contract. Art. 6(1)(a): the consent box (`consent = yes`) is mandatory and recorded, as the privacy policy states. Art. 6(1)(f): anti-abuse measures (honeypot, time trap, rate limit). |
| Data subjects | Prospective clients and other website visitors who submit the form |
| Personal data | Name (required), email (required, validated), phone, country of residence, project type, service, budget range, project stage, free-text message (max. 4,000 characters), site language. Also stored: receipt timestamp (UTC), random lead ID, consent record (processing = true, marketing opt-in yes/no, notice version, page URL) and email delivery status. **Rate limiting:** the IP address is not stored. It is used only to compute a SHA-256 hash of (secret salt + IP + current UTC hour), kept in `rate-YYYYMMDDHH.json`. Earlier hourly files are deleted at the next submission. Max. 5 submissions per hash per hour. |
| Special categories | None requested. The policy asks visitors not to send them. Any that arrive in free text are deleted when spotted. |
| Recipients | Authorised Modera staff (configured recipient mailboxes). Jetserver as processor. No other recipient at this stage. |
| International transfers | Israel (Jetserver): adequacy decision 2011/61/EU. |
| Retention | Lead store: 730 days (`RETENTION_DAYS`). Monthly files older than the cut-off are deleted automatically. Copies in team mailboxes follow the same 24-month rule; deletion there is **manual** (see TOMs). If a contract follows, the data moves to activity 2.4. |
| TOMs (Art. 32) | The endpoint accepts same-origin JSON POST only: Origin/Referer is checked against `modera-group.com` and `www.modera-group.com`, which gives CSRF protection without cookies. Payload capped at 20 KB. Control characters stripped and field lengths capped (data minimisation). Bot submissions caught by the honeypot or time trap are discarded and never stored. Rate limiting uses no raw IP. Responses are sent with `no-store` and `nosniff`. Records are written with file locks and restrictive permissions outside the web root. **Action items:** (a) automatic purge only runs when a new enquiry arrives and works by whole month, so add a monthly cPanel cron job or a calendar check; (b) delete enquiry notification emails older than 24 months from all recipient mailboxes; (c) after each deploy, check that the lead store resolved to the home directory and not the fallback inside the web root (`.deploy/leads`). |

### 2.2 Confirmation emails to the enquirer

| Element | Entry |
|---|---|
| Purpose | Send an automatic acknowledgement in the visitor's site language. It summarises the request and gives contact options and a privacy notice. Sent when `SEND_CONFIRMATION` is enabled. |
| Legal basis | Art. 6(1)(b): pre-contractual steps the data subject requested. Art. 6(1)(f): legitimate interest in confirming receipt. The email is purely transactional and contains no marketing. |
| Data subjects | Enquirers (2.1) |
| Personal data | Name, email address, chosen project type, service, budget and stage labels, and the message (truncated to 600 characters) |
| Recipients | The enquirer's own mail provider. Jetserver's mail server (local MTA, PHP `mail()`). Reply-To is the Modera support address. |
| International transfers | Israel (Jetserver): adequacy. Onward delivery goes to the mail provider the data subject chose. |
| Retention | The sent message is not kept separately by the handler. The JSONL record notes only whether delivery succeeded, for 730 days. Copies in any "Sent" folder follow the mailbox rule in 2.3. |
| TOMs | Output is HTML-escaped (`htmlspecialchars`) against injection. Headers are encoded in UTF-8/Base64, and `X-Auto-Response-Suppress` prevents mail loops. The email goes only to the address that was submitted and validated. Rate limiting (2.1) stops the form being used to send mass email. Recommended: check that SPF, DKIM and DMARC are set up for modera-group.com in cPanel. |

### 2.3 Email, phone and WhatsApp correspondence

| Element | Entry |
|---|---|
| Purpose | Communicate with prospects, clients, partners and other contacts. Answer the team notification emails (Reply-To = visitor). |
| Legal basis | Art. 6(1)(b) (pre-contract or contract); Art. 6(1)(f) (business communication; establishing or defending legal claims) |
| Data subjects | Prospects, clients, client representatives, partners, suppliers, other correspondents |
| Personal data | Name, email address, phone number, message content, attachments, call and message metadata |
| Recipients | Authorised staff. Jetserver (mailboxes on the same cPanel server). For WhatsApp: WhatsApp Ireland Ltd / Meta, under WhatsApp terms. Professional advisers or Sivan Invest Group only when needed for a client's project and with the client's knowledge. |
| International transfers | Israel (Jetserver): adequacy. WhatsApp/Meta: transfers to Meta Platforms Inc. (US) under the EU–US Data Privacy Framework [confirm the account type (Business or personal) and record it here]. |
| Retention | Prospect correspondence with no contract: 24 months after last contact. Client correspondence: as in 2.4. Each mailbox owner reviews and deletes once a year. WhatsApp chats with prospects are deleted or archived on the same schedule. |
| TOMs | Mailbox access by TLS only (IMAPS/SMTPS/webmail over HTTPS). Unique strong passwords and 2FA for cPanel and webmail where the host offers it. Screen lock, encryption and remote wipe on staff phones that use WhatsApp or mail. No shared logins. |

### 2.4 Client contracts and project delivery

| Element | Entry |
|---|---|
| Purpose | Prepare, sign and perform service contracts. Manage projects. Invoice. Keep records that tax, accounting and construction law require. Establish or defend legal claims. |
| Legal basis | Art. 6(1)(b) (contract); Art. 6(1)(c) (Greek tax and accounting obligations); Art. 6(1)(f) (legal claims) |
| Data subjects | Clients (individuals and representatives of corporate clients), their authorised representatives |
| Personal data | Identification and contact data, billing and tax data (tax number, address), contract terms, project details and documents, payment records, correspondence |
| Recipients | Authorised staff. Jetserver (mail). Google, if project files are kept in Google Drive [confirm the account type (Workspace or consumer) and record it]. Lawyers, accountants and engineers as needed. Sivan Invest Group only when needed for the client's project and with the client's knowledge. Tax authorities and courts when legally required. |
| International transfers | Israel: adequacy. Google: EU–US DPF (Google LLC certified) and Google's Data Processing Terms / SCCs. Sivan Invest Group: [confirm the place of establishment; if it is outside the EEA and not adequate, put SCCs in place]. |
| Retention | Contract term plus the period Greek tax, accounting and construction law requires (generally up to 10 years, as the privacy policy states). Review annually and delete when the period ends. |
| TOMs | Need-to-know folder permissions. 2FA on Drive. No public "anyone with the link" sharing for client folders. Shared access removed when a project ends. Endpoint encryption on staff devices. |

### 2.5 Marketing updates (opt-in only)

| Element | Entry |
|---|---|
| Purpose | Occasionally send updates about projects and insights to people who ticked the optional marketing box |
| Legal basis | Art. 6(1)(a) consent. Greek Law 3471/2006 Art. 11 (unsolicited electronic communications). For Israeli recipients, consent under section 30A of the Communications (Telecommunications and Broadcasting) Law. |
| Data subjects | Enquirers who opted in (`consent.marketing = true`) |
| Personal data | Name, email address, consent evidence (timestamp, notice version, page) |
| Recipients | Authorised staff. Jetserver. No mailing-list service is in use at present; if one is introduced, add it here as a processor before use. |
| International transfers | Israel: adequacy |
| Retention | Until consent is withdrawn or the person unsubscribes. Consent evidence is kept for as long as messages are sent plus 3 years [confirm the period with counsel]. |
| TOMs | **Action item:** consent evidence currently sits in the lead files, which are purged after 730 days. Before a lead file is purged, copy opted-in contacts and their consent records into a separate, access-restricted marketing list, or stop sending to them. Every message must include an easy unsubscribe. Withdrawals must be honoured promptly and logged. |

### 2.6 Website security and server logs

| Element | Entry |
|---|---|
| Purpose | Keep the website secure and available. Detect and investigate abuse. Run and protect the deploy endpoint. |
| Legal basis | Art. 6(1)(f): legitimate interest in IT security (Recital 49) |
| Data subjects | Website visitors; the operators using the deploy endpoint |
| Personal data | Web-server access and error logs kept by the hosting platform (IP address, timestamp, requested URL, user agent, referrer, status code). Hourly salted IP hashes for rate limiting (2.1). Deploy endpoint: no personal data beyond what the server logs record. |
| Recipients | Jetserver (processor; generates and stores the logs); authorised staff |
| International transfers | Israel: adequacy |
| Retention | Short period set by the cPanel/Jetserver log rotation [confirm the actual rotation period with Jetserver and record it here; target ≤ 30 days unless an incident requires preservation]. Rate-limit hashes: about 1 hour. |
| TOMs | Deploy endpoint (`deploy.php`): requires HTTPS; requires an `X-Deploy-Token` header; only the token's SHA-256 hash is stored and checked in constant time (`hash_equals`); unconfigured or invalid requests get 503/404 (the endpoint hides itself); POST only; chunk size capped; the uploaded bundle is checked against its SHA-256; ZIP paths are rejected if they contain path traversal; server configuration files are protected from overwrite. Work, upload and backup directories sit outside the web root (`/home/<user>/.modera-deploy`, `0750`, `.htaccess` deny). The last 3 site backups are kept for rollback. Security headers as in the baseline TOMs. |

### 2.7 Cookie, consent and preference storage

| Element | Entry |
|---|---|
| Purpose | Remember the visitor's privacy choices and accessibility settings. With consent, remember their language. |
| Legal basis | `modera-consent` and `modera-a11y`: strictly necessary, so exempt from consent under Art. 4(5) of Greek Law 3471/2006. The record of the consent choice is kept under Art. 6(1)(c)/(f), since Art. 7(1) requires consent to be demonstrable. `modera-lang`: consent (Art. 6(1)(a) and Art. 4(5) L. 3471/2006). |
| Data subjects | Website visitors |
| Personal data | Kept in the browser's `localStorage` only. Consent object (version, timestamp, source such as accept-all, reject-all or custom, GPC flag, category choices). Accessibility flags. Chosen language. **None of this is sent to Modera's server, and it holds no identifiers.** |
| Recipients | None. The data stays on the visitor's device. |
| International transfers | None |
| Retention | Consent: 12 months, then asked again; also reset when the consent version changes. `modera-lang`: deleted at once if preferences consent is withdrawn, otherwise follows the consent period. `modera-a11y`: until the visitor resets it. |
| TOMs | Privacy by default (Art. 25): no optional storage or loading before an explicit choice. A Global Privacy Control signal counts as a refusal (no banner, optional categories off). "Reject all" is as prominent as "Accept all". Consent can be withdrawn on every page through "Cookie settings". Storage errors are handled without breaking the site. |

### 2.8 Google Maps (external media, consent-based)

| Element | Entry |
|---|---|
| Purpose | Show the office location on an embedded map, only after the visitor allows "External media" |
| Legal basis | Art. 6(1)(a) consent and Art. 4(5) L. 3471/2006. Without consent, a static placeholder and a text address and link are shown. |
| Data subjects | Visitors who choose to load the map |
| Personal data | IP address, browser and device data, and Google cookies (e.g. NID, AEC) collected directly by Google when the frame loads |
| Recipients | Google (Google Ireland Ltd / Google LLC). Modera may be a joint controller for the collection-and-transmission step only (CJEU C-40/17 *Fashion ID*). Google is an independent controller for any further processing. |
| International transfers | USA (Google LLC): EU–US Data Privacy Framework adequacy decision (Commission Implementing Decision of 10 July 2023); Google LLC is certified. |
| Retention | Modera keeps nothing. Google cookies last up to 13 months (set by Google). |
| TOMs | The CSP allows frames only from `https://www.google.com` and `https://maps.google.com`, and the frame is injected only after consent. Fonts and images are self-hosted, so ordinary page views send no data to Google. |

### 2.9 Supplier and subcontractor contacts

| Element | Entry |
|---|---|
| Purpose | Manage relationships with suppliers, subcontractors and professional advisers. Order and coordinate work. Pay invoices. |
| Legal basis | Art. 6(1)(b) where the supplier is an individual or sole trader; Art. 6(1)(f) for contact persons at companies; Art. 6(1)(c) for accounting records |
| Data subjects | Suppliers, subcontractors, advisers and their contact persons |
| Personal data | Name, role, company, business email and phone, tax and bank details (sole traders), contracts, invoices, correspondence |
| Recipients | Authorised staff; Jetserver (mail); Google (Drive, if used); accountant; tax authorities |
| International transfers | Israel: adequacy. Google: DPF / SCCs. |
| Retention | For the relationship, then as Greek tax and accounting law requires (generally up to 10 years for accounting records). Contact details are deleted 24 months after the relationship ends if no longer needed. |
| TOMs | Baseline TOMs; need-to-know access to finance records |

### 2.10 Recruitment and CVs (if received)

| Element | Entry |
|---|---|
| Purpose | Assess applications or unsolicited CVs sent by email or through the contact form. No dedicated careers channel exists today. |
| Legal basis | Art. 6(1)(b) (steps before an employment contract); Art. 6(1)(a) consent to keep a CV for future vacancies |
| Data subjects | Applicants |
| Personal data | Whatever the CV and covering message contain: identity and contact data, education, work history, references |
| Recipients | Management and authorised staff involved in hiring; Jetserver (mail) |
| International transfers | Israel: adequacy |
| Retention | Unsuccessful or unsolicited applications: 6 months after the decision, so a possible claim can be defended. Longer only with the applicant's documented consent (max. 24 months). |
| TOMs | Forward CVs only to the people deciding on the hire. Keep them in a restricted folder. Do not ask for special-category data. Delete on schedule. |

---

## 3. Processors and other recipients

| Recipient | Role | Activities | Location / transfer safeguard | Contract status |
|---|---|---|---|---|
| Jetserver (Israel) | Processor: shared cPanel hosting, PHP handler, lead store, mailboxes, server logs, outbound mail | 2.1–2.6, 2.9, 2.10 | Israel: adequacy decision 2011/61/EU | Data-processing agreement under Art. 28(3), which the privacy policy refers to. **Confirm it has been signed and file a copy:** [DATE / LOCATION OF COPY]. Also record Jetserver's sub-processors, data-centre location, backup policy and breach-notification commitment. |
| Google (Google Ireland Ltd / Google LLC), Maps | Independent controller; possible joint controller for collection (2.8) | 2.8 | USA: EU–US DPF | Google Maps / Google APIs terms. No DPA needed for the consent-based embed. |
| Google, Drive / Workspace [if used] | Processor (Workspace, under Cloud Data Processing Addendum) or independent controller (consumer account) | 2.4, 2.9 | DPF / SCCs | [Confirm the account type; if Workspace, accept the Data Processing Addendum in the Admin console] |
| WhatsApp Ireland Ltd / Meta [if used for business] | Processor (WhatsApp Business terms) or independent controller | 2.3 | DPF (Meta Platforms Inc.) | [Confirm and record] |
| Sivan Invest Group (strategic partner) | Independent recipient / controller | 2.3, 2.4 (only when needed for a client's project and with the client's knowledge) | [Confirm the place of establishment and safeguard] | Data-sharing terms or confidentiality undertaking [to be put in place] |
| Lawyers, accountants, engineers | Independent controllers bound by professional secrecy, or processors | 2.4, 2.9 | Mostly Greece / EEA | Engagement letters |
| GitHub, GoDaddy (source code hosting; domain registration) | Service providers to Modera. They are **not** meant to receive data-subject data. | None | n/a | Never commit lead files, exports or mail content to the repository. |

---

## 4. DPIA screening (Art. 35)

**Conclusion: a DPIA is not required at this time.**

The current processing was screened against Art. 35(3), the EDPB/WP29 criteria (WP248 rev.01) and the HDPA list of processing that requires a DPIA (Decision 65/2018):

| Criterion | Assessment |
|---|---|
| Evaluation, scoring or profiling | None. No automated decision-making, as the privacy policy states. |
| Automated decisions with legal or similar effect | None |
| Systematic monitoring | None. No analytics, no ad pixels, no tracking cookies. The rate-limit hash is pseudonymous and lasts about 1 hour. |
| Special categories or highly personal data | Not collected. Budget range is coarse project information, not a financial profile. |
| Large scale | No. A small company handles a limited number of enquiries and clients. |
| Matching or combining datasets | None |
| Vulnerable data subjects | Not targeted. The site is not directed at children under 16. |
| Innovative technology | None. A standard PHP form, email and cPanel hosting. |
| Processing that prevents the exercise of rights | None |

No criterion is met. WP248 suggests a DPIA when two or more are met.

**Repeat the screening before** introducing any of the following:
- website analytics or advertising tools
- a CRM or mailing-list platform
- processing of identity documents or financial or investment data at scale (for example through the partnership with Sivan Invest Group)
- CCTV
- any AI or automated assessment of leads

---

## 5. Personal-data breach procedure (summary; Art. 33/34)

1. **Detect and report internally at once.** Anyone who suspects a breach reports it to [NAME, privacy/security lead] and to management. A breach is any loss, unauthorised access, disclosure, alteration or unavailability of personal data. Examples: a compromised cPanel or mailbox account, a leaked deploy token, a lead file left readable, a lost staff phone, an email sent to the wrong recipient.
2. **Contain.** Change passwords and revoke sessions. Rotate the deploy token by generating a new token, rebuilding with the new SHA-256 and redeploying. Restore from backup if needed. Ask Jetserver for logs and help. Jetserver must notify Modera without undue delay (Art. 33(2)).
3. **Assess the risk to individuals:** what data, how many people, how identifiable, what harm is likely.
4. **Notify the HDPA within 72 hours** of becoming aware, unless the breach is unlikely to result in a risk (Art. 33(1)). Use the HDPA's online breach form. If not all information is available, notify in phases and explain any delay.
5. **Inform the affected people** without undue delay if the breach is likely to result in a high risk (Art. 34). Use clear language and say what they can do.
6. **Israel.** Where the incident affects the database held in Israel, also follow the Israeli procedure: document the incident and report a severe incident to the Privacy Protection Authority. See the Hebrew procedure.
7. **Document every breach**, including those not notified, in the breach log (Art. 33(5)): facts, effects, remedial action, the notification decision and the reasons for it. Breach log location: [LOCATION].

## 6. Data-subject request procedure (Art. 12–22)

1. **Channel.** support@modera-group.com or +30 698 392 4820. Any staff member who receives a request forwards it to [NAME] the same day.
2. **Log it** in the DSR register: date received, requester, right exercised, deadline, outcome. Register location: [LOCATION].
3. **Verify identity** in proportion to the risk. For example, reply from the email address the data was collected with. Ask for no more data than necessary.
4. **Search every location:**
   - lead store (`leads-*.jsonl`; search by email)
   - all recipient mailboxes, including Sent folders
   - WhatsApp
   - Drive
   - the marketing list
   - accounting records
5. **Respond within one month** of receipt. The deadline can be extended by two further months for complex or numerous requests; tell the requester within the first month (Art. 12(3)). Responses are free of charge unless a request is manifestly unfounded or excessive.
6. **Erasure.** Delete the record from the JSONL file: edit the line out and keep the file at `0600`. Delete the related emails and chats. Keep only what a legal obligation requires (for example invoices), and tell the requester what was kept and why.
7. **Objection to marketing or withdrawal of consent.** Act on it immediately and add the person to a suppression note so they are not contacted again.
8. **Israeli requests** (sections 13–14 of the Privacy Protection Law) follow the same process and meet the Israeli deadlines too.

## 7. Security measures summary (Art. 32)

The full measures are in the Hebrew data-security procedure. Core measures:

- HTTPS and HSTS; CSP and the other security headers
- leads stored outside the web root with `0600` permissions and automatic 730-day purge
- no raw IP stored for rate limiting
- same-origin and anti-bot checks on the form
- a token-protected, HTTPS-only deploy endpoint that stores only a hash of the token, with backups outside the web root
- 2FA and unique passwords for cPanel, mail, Drive, GoDaddy and GitHub
- need-to-know access
- encrypted, screen-locked staff devices
- a processor agreement with Jetserver
- staff briefing

## 8. Review schedule

- **Annually**, by [NAME], with sign-off by management. Next review: 2027-11-18.
- **On change**, before go-live: any new tool or processor, new form field, new purpose, change of hosting, a new partner data flow, or a change to the published privacy or cookie notices. The notice version recorded with each lead must match the published policy.

## 9. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 2026-11-18 | First record, based on the live site code (contact handler, consent manager, deploy endpoint, `.htaccess`) and the published policies of 2026-11-17 | [NAME] |

| Approval | Name | Signature | Date |
|---|---|---|---|
| Founder & Chairman | Sivan Menahem | | |
| Co-Founder & Managing Director | Yiannis | | |
| Record owner | [NAME] | | |
