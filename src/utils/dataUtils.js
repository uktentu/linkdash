export const exportToJson = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkdash-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const exportToHtml = (data) => {
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>LinkDash Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

    // Process Categories
    data.categories.forEach(cat => {
        html += `    <DT><H3>${cat.name}</H3>\n    <DL><p>\n`;
        if (cat.urls) {
            cat.urls.forEach(url => {
                html += `        <DT><A HREF="${url.url}">${url.title || url.url}</A>\n`;
            });
        }
        html += `    </DL><p>\n`;
    });

    html += `</DL><p>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkdash-bookmarks-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const parseHtmlBookmarks = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const categories = [];
    const defaultCategory = {
        id: crypto.randomUUID(),
        name: 'Imported',
        urls: []
    };

    // Helper to extract links from a DL
    const extractLinks = (dlElement) => {
        const urls = [];
        const links = dlElement.querySelectorAll('dt > a');
        links.forEach(link => {
            urls.push({
                id: crypto.randomUUID(),
                title: link.textContent,
                url: link.href,
                customFavicon: link.getAttribute('icon') || null
            });
        });
        return urls;
    };

    // Find all H3 headers (folders)
    const headers = doc.querySelectorAll('dt > h3');

    if (headers.length === 0) {
        // Flat list check
        const allLinks = extractLinks(doc.body);
        if (allLinks.length > 0) {
            defaultCategory.urls = allLinks;
            categories.push(defaultCategory);
        }
    } else {
        headers.forEach(header => {
            const dl = header.nextElementSibling; // The DL following the H3
            if (dl && dl.tagName === 'DL') {
                const catUrls = extractLinks(dl);
                if (catUrls.length > 0) {
                    categories.push({
                        id: crypto.randomUUID(),
                        name: header.textContent,
                        urls: catUrls
                    });
                }
            }
        });
    }

    return { categories };
};
