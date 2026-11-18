<?php
/**
 * Modera Group — branded email templates for website enquiries.
 * Included by contact.php only; direct requests are refused.
 *
 * Email-client safe: table layout, inline styles, web-safe font stacks, PNG logo,
 * a 600px column, dark-on-light for readability, plus a plain-text alternative.
 */
declare(strict_types=1);
if (!defined('MODERA_MAIL')) { http_response_code(404); exit; }

const BRAND = [
    'ink' => '#0f1b2a', 'bronze' => '#b8894f', 'bronzeInk' => '#8a6436', 'paper' => '#faf8f4',
    'sand' => '#efe9df', 'line' => '#e6e1d8', 'muted' => '#5b6573', 'text' => '#1f2a37',
    'serif' => "'Noto Serif Display', Georgia, 'Times New Roman', serif",
    'sans' => "'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif",
];

/** Client-facing strings for the confirmation email, per site language. */
const AUTO = [
    'en' => ['subject' => 'We have received your enquiry — Modera Group', 'hello' => 'Dear', 'thanks' => 'Thank you for contacting Modera Group.', 'body' => 'A senior member of our team will review your project and reply within one business day.', 'summary' => 'Your request', 'project' => 'Project', 'service' => 'Service', 'budget' => 'Budget', 'stage' => 'Stage', 'message' => 'Message', 'urgent' => 'Need us sooner? Call or WhatsApp us:', 'privacy' => 'We use your details only to answer your enquiry, as described in our privacy policy. You can ask us to access, correct or delete them at any time.', 'policy' => 'Privacy policy', 'sign' => 'The Modera Group team', 'auto' => 'This is an automatic confirmation of a request you sent through modera-group.com.'],
    'el' => ['subject' => 'Λάβαμε το αίτημά σας — Modera Group', 'hello' => 'Αγαπητέ/ή', 'thanks' => 'Σας ευχαριστούμε που επικοινωνήσατε με τη Modera Group.', 'body' => 'Ένα ανώτερο στέλεχος της ομάδας μας θα εξετάσει το έργο σας και θα σας απαντήσει εντός μίας εργάσιμης ημέρας.', 'summary' => 'Το αίτημά σας', 'project' => 'Έργο', 'service' => 'Υπηρεσία', 'budget' => 'Προϋπολογισμός', 'stage' => 'Στάδιο', 'message' => 'Μήνυμα', 'urgent' => 'Χρειάζεστε άμεση απάντηση; Καλέστε μας ή στείλτε μας στο WhatsApp:', 'privacy' => 'Χρησιμοποιούμε τα στοιχεία σας μόνο για να απαντήσουμε στο αίτημά σας, όπως περιγράφεται στην πολιτική απορρήτου μας. Μπορείτε οποιαδήποτε στιγμή να ζητήσετε πρόσβαση, διόρθωση ή διαγραφή τους.', 'policy' => 'Πολιτική απορρήτου', 'sign' => 'Η ομάδα της Modera Group', 'auto' => 'Αυτή είναι αυτόματη επιβεβαίωση ενός αιτήματος που στείλατε μέσω του modera-group.com.'],
    'fr' => ['subject' => 'Nous avons bien reçu votre demande — Modera Group', 'hello' => 'Bonjour', 'thanks' => 'Merci d’avoir contacté Modera Group.', 'body' => 'Un membre senior de notre équipe étudiera votre projet et vous répondra sous un jour ouvré.', 'summary' => 'Votre demande', 'project' => 'Projet', 'service' => 'Service', 'budget' => 'Budget', 'stage' => 'Étape', 'message' => 'Message', 'urgent' => 'Besoin d’une réponse plus rapide ? Appelez-nous ou écrivez-nous sur WhatsApp :', 'privacy' => 'Nous utilisons vos données uniquement pour répondre à votre demande, comme décrit dans notre politique de confidentialité. Vous pouvez à tout moment demander à y accéder, à les rectifier ou à les supprimer.', 'policy' => 'Politique de confidentialité', 'sign' => 'L’équipe Modera Group', 'auto' => 'Ceci est une confirmation automatique d’une demande envoyée via modera-group.com.'],
    'de' => ['subject' => 'Wir haben Ihre Anfrage erhalten — Modera Group', 'hello' => 'Guten Tag', 'thanks' => 'Vielen Dank für Ihre Nachricht an Modera Group.', 'body' => 'Ein erfahrenes Mitglied unseres Teams prüft Ihr Projekt und antwortet Ihnen innerhalb eines Werktages.', 'summary' => 'Ihre Anfrage', 'project' => 'Projekt', 'service' => 'Leistung', 'budget' => 'Budget', 'stage' => 'Phase', 'message' => 'Nachricht', 'urgent' => 'Eilt es? Rufen Sie uns an oder schreiben Sie uns per WhatsApp:', 'privacy' => 'Wir verwenden Ihre Angaben ausschließlich zur Beantwortung Ihrer Anfrage, wie in unserer Datenschutzerklärung beschrieben. Sie können jederzeit Auskunft, Berichtigung oder Löschung verlangen.', 'policy' => 'Datenschutzerklärung', 'sign' => 'Ihr Team von Modera Group', 'auto' => 'Dies ist eine automatische Bestätigung einer Anfrage, die Sie über modera-group.com gesendet haben.'],
    'ru' => ['subject' => 'Мы получили Вашу заявку — Modera Group', 'hello' => 'Здравствуйте,', 'thanks' => 'Благодарим Вас за обращение в Modera Group.', 'body' => 'Старший специалист нашей команды изучит Ваш проект и ответит в течение одного рабочего дня.', 'summary' => 'Ваша заявка', 'project' => 'Проект', 'service' => 'Услуга', 'budget' => 'Бюджет', 'stage' => 'Этап', 'message' => 'Сообщение', 'urgent' => 'Нужен ответ быстрее? Позвоните нам или напишите в WhatsApp:', 'privacy' => 'Мы используем Ваши данные только для ответа на заявку, как описано в нашей политике конфиденциальности. Вы можете в любой момент запросить доступ к ним, их исправление или удаление.', 'policy' => 'Политика конфиденциальности', 'sign' => 'Команда Modera Group', 'auto' => 'Это автоматическое подтверждение заявки, отправленной через modera-group.com.'],
    'es' => ['subject' => 'Hemos recibido su consulta — Modera Group', 'hello' => 'Estimado/a', 'thanks' => 'Gracias por contactar con Modera Group.', 'body' => 'Un miembro sénior de nuestro equipo revisará su proyecto y le responderá en un día laborable.', 'summary' => 'Su solicitud', 'project' => 'Proyecto', 'service' => 'Servicio', 'budget' => 'Presupuesto', 'stage' => 'Fase', 'message' => 'Mensaje', 'urgent' => '¿Lo necesita antes? Llámenos o escríbanos por WhatsApp:', 'privacy' => 'Utilizamos sus datos únicamente para responder a su consulta, según se describe en nuestra política de privacidad. Puede solicitar en cualquier momento el acceso, la rectificación o la supresión de sus datos.', 'policy' => 'Política de privacidad', 'sign' => 'El equipo de Modera Group', 'auto' => 'Esta es una confirmación automática de una solicitud enviada a través de modera-group.com.'],
    'nl' => ['subject' => 'We hebben uw aanvraag ontvangen — Modera Group', 'hello' => 'Beste', 'thanks' => 'Hartelijk dank voor uw bericht aan Modera Group.', 'body' => 'Een senior teamlid bekijkt uw project en antwoordt binnen één werkdag.', 'summary' => 'Uw aanvraag', 'project' => 'Project', 'service' => 'Dienst', 'budget' => 'Budget', 'stage' => 'Fase', 'message' => 'Bericht', 'urgent' => 'Sneller nodig? Bel of WhatsApp ons:', 'privacy' => 'We gebruiken uw gegevens uitsluitend om uw aanvraag te beantwoorden, zoals beschreven in ons privacybeleid. U kunt op elk moment inzage, correctie of verwijdering vragen.', 'policy' => 'Privacybeleid', 'sign' => 'Het team van Modera Group', 'auto' => 'Dit is een automatische bevestiging van een aanvraag die u via modera-group.com hebt verstuurd.'],
];

function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function digits(string $phone): string { return preg_replace('/\D+/', '', $phone) ?? ''; }

function shell(string $preheader, string $content, string $footer): string
{
    $b = BRAND;
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>Modera Group</title></head>'
        . '<body style="margin:0;padding:0;background:' . $b['sand'] . ';">'
        . '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' . h($preheader) . '</div>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' . $b['sand'] . ';"><tr><td align="center" style="padding:28px 12px;">'
        . '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;">'
        . '<tr><td style="background:' . $b['ink'] . ';padding:26px 32px;"><img src="' . SITE_URL . '/assets/img/brand/logo-light.png" width="170" height="36" alt="MODERA — Built to precision" style="display:block;border:0;width:170px;height:auto;"></td></tr>'
        . '<tr><td style="height:3px;background:' . $b['bronze'] . ';line-height:3px;font-size:0;">&nbsp;</td></tr>'
        . $content
        . '<tr><td style="padding:22px 32px;background:' . $b['paper'] . ';font-family:' . $b['sans'] . ';font-size:12px;line-height:1.6;color:' . $b['muted'] . ';">' . $footer . '</td></tr>'
        . '</table></td></tr></table></body></html>';
}

function button(string $href, string $label, bool $primary): string
{
    $b = BRAND;
    $bg = $primary ? $b['ink'] : '#ffffff';
    $fg = $primary ? '#ffffff' : $b['ink'];
    $border = $primary ? $b['ink'] : $b['line'];
    return '<a href="' . h($href) . '" style="display:inline-block;margin:0 8px 8px 0;padding:12px 20px;border-radius:999px;background:' . $bg . ';color:' . $fg . ';border:1px solid ' . $border . ';font-family:' . $b['sans'] . ';font-size:14px;font-weight:600;text-decoration:none;">' . h($label) . '</a>';
}

function rows(array $pairs): string
{
    $b = BRAND;
    $out = '';
    $i = 0;
    foreach ($pairs as $label => $value) {
        if ($value === '' || $value === null) continue;
        $bg = $i++ % 2 ? '#ffffff' : $b['paper'];
        $out .= '<tr><td style="padding:11px 14px;background:' . $bg . ';width:34%;font-family:' . $b['sans'] . ';font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:' . $b['muted'] . ';vertical-align:top;">' . h($label) . '</td>'
            . '<td style="padding:11px 14px;background:' . $bg . ';font-family:' . $b['sans'] . ';font-size:15px;color:' . $b['text'] . ';vertical-align:top;">' . $value . '</td></tr>';
    }
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ' . $b['line'] . ';border-radius:12px;border-collapse:separate;overflow:hidden;">' . $out . '</table>';
}

/** Internal notification for the Modera team. Returns [subject, html, text]. */
function team_email(array $r): array
{
    $b = BRAND;
    $lang = strtoupper($r['language'] ?: 'en');
    $auto = AUTO[$r['language']] ?? AUTO['en'];
    $replyBody = $auto['hello'] . ' ' . $r['name'] . ",\n\n";
    $mailto = 'mailto:' . rawurlencode($r['email']) . '?subject=' . rawurlencode('Re: ' . $auto['subject']) . '&body=' . rawurlencode($replyBody);
    $tel = digits($r['phone']);
    $actions = button($mailto, 'Reply to ' . $r['name'], true)
        . ($tel ? button('https://wa.me/' . $tel, 'WhatsApp', false) . button('tel:+' . $tel, 'Call', false) : '');
    $tz = static function (string $iso, string $zone): string {
        $d = new DateTimeImmutable($iso);
        return $d->setTimezone(new DateTimeZone($zone))->format('D j M Y, H:i');
    };
    $when = h($tz($r['received'], 'Europe/Athens')) . ' (Athens) · ' . h($tz($r['received'], 'Asia/Jerusalem')) . ' (Israel)';
    $details = rows([
        'Name' => h($r['name']),
        'Email' => '<a href="mailto:' . h($r['email']) . '" style="color:' . $b['bronzeInk'] . ';">' . h($r['email']) . '</a>',
        'Phone' => $r['phone'] !== '' ? '<a href="tel:+' . h($tel) . '" style="color:' . $b['bronzeInk'] . ';">' . h($r['phone']) . '</a>' : '',
        'Country' => h($r['country']),
        'Project type' => h($r['project_type']),
        'Service' => h($r['service']),
        'Budget' => h($r['budget']),
        'Stage' => h($r['stage']),
        'Site language' => h($lang),
    ]);
    $message = $r['message'] !== '' ? '<tr><td style="padding:8px 32px 0;"><p style="margin:0 0 10px;font-family:' . $b['sans'] . ';font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:' . $b['bronzeInk'] . ';font-weight:700;">Message</p>'
        . '<div style="border-left:3px solid ' . $b['bronze'] . ';padding:4px 0 4px 16px;font-family:' . $b['sans'] . ';font-size:15px;line-height:1.65;color:' . $b['text'] . ';">' . nl2br(h($r['message'])) . '</div></td></tr>' : '';
    $meta = rows([
        'Received' => $when,
        'Page' => h($r['consent']['page'] ?: '/'),
        'Consent' => 'Processing: yes · Marketing updates: <strong>' . ($r['consent']['marketing'] ? 'opted in' : 'no') . '</strong>',
        'Notice version' => h($r['consent']['notice_version']),
        'Lead ID' => h($r['id']),
    ]);
    $content = '<tr><td style="padding:30px 32px 6px;">'
        . '<p style="margin:0 0 8px;font-family:' . $b['sans'] . ';font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:' . $b['bronzeInk'] . ';font-weight:700;">New website enquiry · ' . h($lang) . '</p>'
        . '<h1 style="margin:0 0 6px;font-family:' . $b['serif'] . ';font-weight:400;font-size:30px;line-height:1.15;color:' . $b['ink'] . ';">' . h($r['name']) . '</h1>'
        . '<p style="margin:0 0 20px;font-family:' . $b['sans'] . ';font-size:15px;color:' . $b['muted'] . ';">' . h(trim(implode(' · ', array_filter([$r['project_type'], $r['budget'], $r['country']])))) . '</p>'
        . $actions . '</td></tr>'
        . '<tr><td style="padding:16px 32px;">' . $details . '</td></tr>'
        . $message
        . '<tr><td style="padding:24px 32px 30px;"><p style="margin:0 0 10px;font-family:' . $b['sans'] . ';font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:' . $b['bronzeInk'] . ';font-weight:700;">Record</p>' . $meta . '</td></tr>';
    $footer = 'Replying to this email answers the client directly. This enquiry is also stored securely on the Modera server and deleted automatically after the retention period. Please handle personal data according to our privacy policy and delete it on request.';
    $subject = 'New enquiry — ' . $r['name'] . ($r['project_type'] ? ' · ' . $r['project_type'] : '') . ' (' . $lang . ')';

    $text = "NEW WEBSITE ENQUIRY ($lang)\n\n";
    foreach (['Name' => 'name', 'Email' => 'email', 'Phone' => 'phone', 'Country' => 'country', 'Project type' => 'project_type', 'Service' => 'service', 'Budget' => 'budget', 'Stage' => 'stage'] as $label => $k) {
        if ($r[$k] !== '') $text .= str_pad($label . ':', 15) . $r[$k] . "\n";
    }
    if ($r['message'] !== '') $text .= "\nMessage:\n" . $r['message'] . "\n";
    $text .= "\nReceived: " . $tz($r['received'], 'Europe/Athens') . " (Athens)\nMarketing: " . ($r['consent']['marketing'] ? 'opted in' : 'no') . "\nLead ID: " . $r['id'] . "\n";

    return [$subject, shell('New enquiry from ' . $r['name'], $content, $footer), $text];
}

/** Confirmation to the client, in the language of the page they used. Returns [subject, html, text]. */
function client_email(array $r): array
{
    $b = BRAND;
    $a = AUTO[$r['language']] ?? AUTO['en'];
    $lang = isset(AUTO[$r['language']]) ? $r['language'] : 'en';
    $l = $r['labels'] ?? [];
    $summary = rows([
        $a['project'] => h($l['project_type'] ?? $r['project_type']),
        $a['service'] => h($l['service'] ?? $r['service']),
        $a['budget'] => h($l['budget'] ?? $r['budget']),
        $a['stage'] => h($l['stage'] ?? $r['stage']),
        $a['message'] => $r['message'] !== '' ? nl2br(h(mb_strimwidth($r['message'], 0, 600, '…'))) : '',
    ]);
    $content = '<tr><td style="padding:32px 32px 8px;">'
        . '<h1 style="margin:0 0 16px;font-family:' . $b['serif'] . ';font-weight:400;font-size:28px;line-height:1.2;color:' . $b['ink'] . ';">' . h($a['hello'] . ' ' . $r['name']) . '</h1>'
        . '<p style="margin:0 0 12px;font-family:' . $b['sans'] . ';font-size:16px;line-height:1.65;color:' . $b['text'] . ';">' . h($a['thanks']) . ' ' . h($a['body']) . '</p></td></tr>'
        . (trim(strip_tags($summary)) !== '' ? '<tr><td style="padding:12px 32px;"><p style="margin:0 0 10px;font-family:' . $b['sans'] . ';font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:' . $b['bronzeInk'] . ';font-weight:700;">' . h($a['summary']) . '</p>' . $summary . '</td></tr>' : '')
        . '<tr><td style="padding:18px 32px 30px;"><p style="margin:0 0 14px;font-family:' . $b['sans'] . ';font-size:15px;color:' . $b['text'] . ';">' . h($a['urgent']) . '</p>'
        . button('https://wa.me/' . digits(SITE_PHONE), 'WhatsApp', true) . button('tel:' . SITE_PHONE, SITE_PHONE_DISPLAY, false)
        . '<p style="margin:22px 0 0;font-family:' . $b['serif'] . ';font-size:18px;color:' . $b['ink'] . ';">' . h($a['sign']) . '</p></td></tr>';
    $footer = h($a['privacy']) . ' <a href="' . SITE_URL . '/' . $lang . '/privacy/" style="color:' . $b['bronzeInk'] . ';">' . h($a['policy']) . '</a><br><br>'
        . h($a['auto']) . '<br>Modera Group · 2 Plateia Eleftherias, 73132 Chania, Crete, Greece · VAT EL802555027';
    $text = $a['hello'] . ' ' . $r['name'] . ",\n\n" . $a['thanks'] . ' ' . $a['body'] . "\n\n" . $a['urgent'] . ' ' . SITE_PHONE_DISPLAY . "\n\n" . $a['sign'] . "\n\n—\n" . $a['privacy'] . ' ' . SITE_URL . '/' . $lang . "/privacy/\n";
    return [$a['subject'], shell($a['thanks'], $content, $footer), $text];
}

/** Send a UTF-8 multipart/alternative message. Returns true if accepted by the local MTA. */
function send_mail(string $to, string $subject, string $html, string $text, string $replyTo, string $replyName = ''): bool
{
    $boundary = 'mdr_' . bin2hex(random_bytes(12));
    $enc = static fn (string $s): string => '=?UTF-8?B?' . base64_encode($s) . '?=';
    $headers = [
        'From: ' . $enc(MAIL_FROM_NAME) . ' <' . MAIL_FROM . '>',
        'Reply-To: ' . ($replyName !== '' ? $enc($replyName) . ' ' : '') . '<' . $replyTo . '>',
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
        'Message-ID: <' . bin2hex(random_bytes(10)) . '@' . parse_url(SITE_URL, PHP_URL_HOST) . '>',
        'Date: ' . date(DATE_RFC2822),
        'X-Auto-Response-Suppress: OOF, AutoReply',
    ];
    $body = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text))
        . "--$boundary\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html))
        . "--$boundary--\r\n";
    return @mail($to, $enc($subject), $body, implode("\r\n", $headers), '-f' . MAIL_FROM);
}
