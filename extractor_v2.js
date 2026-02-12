document.addEventListener("DOMContentLoaded", () => {

  const input = document.getElementById("bibtexFile");
  const output = document.getElementById("output");
  const records_count = document.getElementById("records_count");

  let books = [];
  let articles = [];

  // =============================
  // FILE LOAD
  // =============================

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      formISBD(reader.result);
    };

    reader.onerror = () => {
      output.textContent = "Error reading file.";
    };

    reader.readAsText(file);
  });

  // =============================
  // MAIN CONTROLLER
  // =============================

  function formISBD(bibtexData) {

    // Reset state
    books = [];
    articles = [];
    output.innerHTML = "";

    const records = bibtexRawToObjectsArray(bibtexData);
    records_count.textContent = `${records.length} източника`;

    // Split records
    records.forEach(record => {
      if (record.pages_art.length > 0) {
        record.record_type = "Статия";
        articles.push(record);
      } else {
        record.record_type = "Книга";
        books.push(record);
      }
    });

    // Sort
    sortRecords(books);
    sortRecords(articles);

    // Render
    renderSection("Книги", books, bookIsbd);
    renderSection("Статии", articles, articleIsbd);
  }

  // =============================
  // SORTING
  // =============================

  function sortRecords(array) {
    array.sort((a, b) => {
      const authorA = a.author[0] || "";
      const authorB = b.author[0] || "";

      return authorA.localeCompare(authorB, "bg", {
        sensitivity: "base"
      });
    });
  }

  // =============================
  // RENDER HELPERS
  // =============================

  function renderSection(labelText, recordsArray, renderFunction) {
    if (recordsArray.length === 0) return;

    const label = document.createElement("p");
    label.textContent = labelText;
    output.appendChild(label);

    recordsArray.forEach(record => {
      renderFunction(record);
    });
  }

  // =============================
  // BOOK RENDER
  // =============================

  function bookIsbd(record) {
    const recordP = document.createElement("p");
    let content = "";

    content += `${record.record_type}\n`;
    content += `${record.signature[0] || ""}\n`;
    content += record.title[0] || "";

    if (record.author.length > 0) {
      content += " / " + record.author.join("; ");
    }

    if (record.address.length > 0) {
      content += `. ${record.address[0]}`;
    }

    if (record.publisher.length > 0) {
      content += `: ${record.publisher[0]}`;
    }

    if (record.year.length > 0) {
      content += `, ${record.year[0]}`;
    }

    if (record.pages.length > 0) {
      content += ` . - ${record.pages[0]}`;
    }

    if (record.illustrations.length > 0) {
      content += ` : ${record.illustrations[0]}`;
    }

    recordP.textContent = content;
    output.appendChild(recordP);
  }

  // =============================
  // ARTICLE RENDER
  // =============================

  function articleIsbd(record) {

    const recordP = document.createElement("p");
    let content = "";

    if (record.author.length > 0) {
      content += `${record.author.join("; ")}. `;
    }

    content += `${record.title[0] || ""}`;
    content += `. - В: ${record.source[0] || ""}`;
    content += `. - бр. ${record.issue[0] || ""}`;
    content += ` (${record.year[0] || ""})`;
    content += `, с. ${record.pages_art[0] || ""}`;

    if (record.illustrations.length > 0) {
      content += ` : ${record.illustrations[0]}`;
    }

    if (record.abstract.length > 0) {
      content += "\n" + record.abstract.join("\n");
    }

    if (record.see_also.length > 0) {
      content += "\nВж. и " + record.see_also.join(", ");
    }

    recordP.textContent = content;
    output.appendChild(recordP);
  }

  // =============================
  // BIBTEX PARSER
  // =============================

  function bibtexRawToObjectsArray(bibtexData) {

    const rawRecords = bibtexData
      .split(/(?=@book\s*{)/i)
      .map(r => r.trim())
      .filter(r => r.startsWith("@book"));

    const fields = [
      "author",
      "title",
      "year",
      "heading",
      "source",
      "pages",
      "pages_art",
      "issue",
      "abstract",
      "see_also",
      "address",
      "publisher",
      "illustrations",
      "signature"
    ];

    return rawRecords.map(record => {
      const obj = {};

      fields.forEach(field => {
        const regex = new RegExp(
          field + "\\s*=\\s*{([\\s\\S]*?)}",
          "gi"
        );

        const matches = [...record.matchAll(regex)];
        obj[field] = matches.length
          ? matches.map(m => m[1].trim())
          : [];
      });

      return obj;
    });
  }

});