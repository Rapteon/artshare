function decodeRecord(record) {
    if (!(record && record.data)) {
        return '';
    }
    const utf8Decoder = new TextDecoder();
    return utf8Decoder.decode(record.data);
}

window.addEventListener('load', () => {
    const p = document.getElementById('output');
    if (!window.isSecureContext) {
        p.textContent = 'Please open this page as a local file (file://page-path) or through https.';
    }
    else {
        const scanButton = document.getElementById('scan-button');
        // https://googlechrome.github.io/samples/web-nfc/
        scanButton.addEventListener("click", async () => {
            try {
                const ndef = new NDEFReader();
                await ndef.scan();
                p.textContent = "> Scan started";

                ndef.addEventListener("readingerror", () => {
                    p.textContent = "Argh! Cannot read data from the NFC tag. Try another one?";
                });

                ndef.addEventListener("reading", ({ message, serialNumber }) => {
                    const tagDisplay = document.getElementById('tag-display');
                    console.log(tagDisplay);
                    const serialNum = tagDisplay.querySelector('#serial-num');
                    const recordCount = tagDisplay.querySelector('#record-count');

                    serialNum.textContent = `> Serial Number: ${serialNumber}`;
                    recordCount.textContent = `> Records: (${message.records.length})`;
                    const recordsContainer = tagDisplay.querySelector('#records-container');

                    const tagOutput = document.getElementById('tag-output');
                    const documentHead = document.querySelector('head');
                    for (const record of message.records) {
                        if (record.recordType === 'mime' && record.mediaType === 'text/html') {
                            tagOutput.innerHTML = decodeRecord(record.data);
                        }
                        else if (record.recordtype === 'mime' && record.mediaType === 'text/javascript') {
                            const script = document.createElement('script');
                            script.innerHTML = decodeRecord(record.data);
                            console.log(script);
                            documentHead.appendChild(script);
                        }
                        const li = document.createElement('li');
                        li.textContent = [record.id, record.recordType, record.mediaType, record.encoding, record.lang].join(':');
                        recordsContainer.appendChild(li);
                    }
                });
            } catch (error) {
                p.textContent = "Argh! " + error;
            }
        });
    }
})
