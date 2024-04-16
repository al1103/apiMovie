Sure, here's the rewritten `README.md` file that incorporates the provided code and explains the process of blocking ads using the `fetch` API:

## File README

**Enhance Page Load Performance by Blocking Ads**

**Introduction**

This document outlines how to block specific advertisements from appearing on a webpage using content blocking techniques. This approach aims to improve page load performance and enhance the user experience by removing intrusive and potentially distracting ads.

**Target Ads for Blocking**

The following ads have been identified for blocking:

**Images:**

- `https://img.nguonc.com/public/images/i9/pc.gif`

**Links:**

- `https://www.i9bet203.com/Register`

**Blocking Methodology**

The proposed method utilizes the `fetch` API to intercept and modify the HTML response before it's rendered in the browser. This effectively blocks the targeted ads from displaying on the webpage.

**Implementation**

The following code snippet demonstrates the implementation of content filtering using the `fetch` API:

```javascript
async function filterContent() {
  const response = await fetch('https://example.com'); // Replace with the target URL
  const html = await response.text();
  const dom = new DOMParser().parseFromString(html, 'text/html');

  // Identify and modify targeted elements based on their attributes or content
  const blockedImages = dom.querySelectorAll('img[src="https://img.nguonc.com/public/images/i9/pc.gif"]');
  blockedImages.forEach((img) => {
    // Choose a filtering strategy:
    // - img.parentNode.removeChild(img); // Remove entire element
    // - img.src = ''; // Replace content with empty string
    // - img.style.display = 'none'; // Hide using CSS
  });

  // Apply additional filtering rules as needed

  const filteredHTML = dom.documentElement.outerHTML;
  // Replace original HTML in the browser rendering context (e.g., using innerHTML property of an iframe or document.body)
}

filterContent();
```

**Explanation**

1. **Fetch HTML Content:**
   - The `fetch` API is used to retrieve the HTML content of the webpage.

2. **Parse HTML Response:**
   - The fetched HTML response is converted into a DOM (Document Object Model) structure using `DOMParser`.

3. **DOM Traversal and Filtering:**
   - The DOM tree is traversed to identify and modify the elements containing the targeted ads.
   - Filtering strategies can include removing elements, replacing content, or applying CSS styles to hide elements.

4. **Serialization of Modified DOM:**
   - The modified DOM is converted back into an HTML string using `serializeNode()`.

5. **Rendering Filtered HTML:**
   - The original HTML content is replaced with the filtered HTML in the browser's rendering context.

**Caveats and Considerations**

- **Client-Side Limitations:**
   - Client-side filtering relies on JavaScript execution within the browser and might not be foolproof. Users could potentially disable JavaScript or bypass filtering measures.

- **Server-Side Filtering:**
   - For more robust content filtering, consider server-side filtering in conjunction with client-side filtering.

- **Performance Implications:**
   - Be mindful of potential performance implications of DOM manipulation on large webpages.

**Conclusion**

By implementing client-side filtering with the `fetch` API, you can effectively block specific content from displaying in the browser, enhancing the user experience and potentially protecting against unwanted or harmful content. This approach, combined with server-side filtering and other optimization techniques, can contribute to a more performant and user-friendly web experience.
