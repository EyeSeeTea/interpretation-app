export function getShortText(originalText, { showAllText, maxWords }) {
    const text = originalText.trim();

    if (showAllText) {
        return { showMoreLink: false, displayText: text };
    } else {
        const lines = text.split("\n");
        const shortText = lines[0].split(' ').slice(0, maxWords).join(' ');
        const showMoreLink = lines.length > 1 || shortText !== text;
        return { showMoreLink, displayText: shortText };
    }
}
