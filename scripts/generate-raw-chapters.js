const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../public/data/thirukkural.json');
const rawDir = path.join(__dirname, '../android/app/src/main/res/raw');

if (!fs.existsSync(jsonPath)) {
    console.error('thirukkural.json not found at', jsonPath);
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

fs.mkdirSync(rawDir, { recursive: true });

for (const ch of data.chapters) {
    let xml = '<?xml version="1.0" encoding="utf-8"?>\n<couplets>\n';
    for (const c of ch.couplets) {
        xml += '  <couplet id="' + c.id + '">\n';
        xml += '    <firstLine>' + escapeXml(c.line1) + '</firstLine>\n';
        xml += '    <secondLine>' + escapeXml(c.line2) + '</secondLine>\n';
        xml += '    <muva>' + escapeXml(c.muva) + '</muva>\n';
        xml += '    <solomon>' + escapeXml(c.solomon) + '</solomon>\n';
        xml += '    <kalaignar>' + escapeXml(c.kalaignar) + '</kalaignar>\n';
        xml += '    <chapter id="' + ch.id + '">\n';
        xml += '      <inEnglish>' + escapeXml(ch.nameEnglish) + '</inEnglish>\n';
        xml += '      <inTamil>' + escapeXml(ch.nameTamil) + '</inTamil>\n';
        xml += '    </chapter>\n';
        xml += '    <english>\n';
        xml += '      <firstLine>' + escapeXml(c.englishLine1) + '</firstLine>\n';
        xml += '      <secondLine>' + escapeXml(c.englishLine2) + '</secondLine>\n';
        xml += '      <explanation>' + escapeXml(c.explanation) + '</explanation>\n';
        xml += '    </english>\n';
        xml += '  </couplet>\n';
    }
    xml += '</couplets>\n';
    fs.writeFileSync(path.join(rawDir, 'chapter_' + ch.id + '.xml'), xml);
}
console.log('Successfully generated 133 raw chapter XML files in android/app/src/main/res/raw!');
