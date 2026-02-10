document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("bibtexFile");
  const output = document.getElementById("output");
  const records_count = document.getElementById("records_count");






  //on file selected load content
  input.addEventListener("change", () => {


    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      // Display raw text safely

      formISBD(reader.result)

    };

    reader.onerror = () => {
      output.textContent = "Error reading file.";
    };

    reader.readAsText(file);
  });
});

//get data and parse it

function formISBD(bibtexData) {

  //get the array of objects
  let records = bibtexRawToObjectsArray(bibtexData);

  //display count
  records_count.textContent = `${records.length} източника`




  records.forEach(r => {
    //check record type and push value to the corresponding array
    checkRecordType(r);


  })

}



//check if the record is an article or other, based on used pages field, returns a literal
function checkRecordType(record) {

  //create arrays for records
  //in order to sort records we need 2 arrays, ones for books, and one for articles
  const books_array = [];
  const articles_array = [];

  //deciding if a record is a book or not based on field pages_art
  if (record.pages_art.length > 0) {
    record.record_type = "Статия"
    //push record to articles_array
    articles_array.push(record)
    console.log('record pushed to articles')

    //this needs to happen after
    // articleIsbd(record);

  } else {
    record.record_type = "Книга"
    //push record to book_arrays
    books_array.push(record)
    console.log('record pushed to books')

    //this needs to happen later
    // bookIsbd(record);

  }

  //where the hell do I put you???

  sort_records(books_array);
  sort_records(articles_array);

  console.log(books_array);
  console.log(articles_array)

   //create label
  let book_label=document.createElement('p');
  book_label.textContent="Книги";
  output.appendChild(book_label);

  
  //form and display
  books_array.forEach(r => {
    bookIsbd(r)
  })

    //create label
  let articles_label=document.createElement('p');
  book_label.textContent="Статии";
  output.appendChild(articles_label);

  articles_array.forEach(r => {
    articleIsbd(r)
  })

  //arrays should be populated and sorted

}


  //function to sort records by sortwort, currently author in the formed arrays
  function sort_records(array) {
    return array.sort((a, b) =>
      a.author.localeCompare(b.author, undefined, { sensitivity: "base" })
    );
  }


function bookIsbd(record) {
  console.log('trigegr book isbd')
  console.log(record)
  let recordP = document.createElement('p');
  let recordContent = record.record_type;

  recordContent += '\n'
  //signature
  recordContent += `${record.signature}\n`
  //title
  recordContent += record.title;
  //authors
  if (record.author.length > 0) {
    recordContent += "/";
    record.author.forEach(a => {
      recordContent += ` ${a}; `
    })
  }
  //add place
  if (record.address.length > 0) {
    recordContent += `. ${record.address}`
  }
  //add publisher
  if (record.publisher.length > 0) {
    recordContent += `: ${record.publisher}`
  }
  //add year
  if (record.year.length > 0) {
    recordContent += `, ${record.year}`
  }
  //add pages
  if (record.pages.length > 0) {
    recordContent += ` . - ${record.pages[0]}`
  }
  //add illustrations
  if (record.illustrations.length > 0) {
    recordContent += ` : ${record.illustrations}`
  }

  recordP.textContent = recordContent;
  output.appendChild(recordP)
}

function articleIsbd(record) {
  console.log('trigger article isbd')

  //create a paragraph containing the record
  let recordP = document.createElement('p');
  recordContent = '';

  recordContent += '\n'
  //see what we extract
  console.log(record)
  //this handles missing author
  if (record.author.length > 0) {
    recordContent += `${record.author}. `
  }

  recordContent += `${record.title}`
  recordContent += `. - В: ${record.source}`
  recordContent += `. - бр. ${record.issue}`
  recordContent += ` (${record.year})`
  recordContent += `, с. ${record.pages_art}`
  //add illustrations
  if (record.illustrations.length > 0) {
    recordContent += ` : ${record.illustrations}`
  }
  recordContent += '\n'

  //next 2 cases check array length becaause there can be multiple values
  // if there is abstract
  if (record.abstract.length > 0) {
    //iterate through abstract array
    record.abstract.forEach(a => {
      recordContent += ` ${a}\n`
    })

  }

  //if there is see_also references
  if (record.see_also.length > 0) {
    //iterate through references 
    recordContent += `Вж. и`
    record.see_also.forEach(sa => {
      recordContent += `${sa}\n`
    })

  }

  recordP.textContent = recordContent;
  output.appendChild(recordP);


}


// transform bibtex data into objects
function bibtexRawToObjectsArray(bibtexData) {

  // 1. Split records safely
  const rawRecords = bibtexData
    .split(/(?=@book\s*{)/i)
    .map(r => r.trim())
    .filter(r => r.startsWith("@book"));

  // 2. Fields we care about
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

  // 3. Parse each record to object
  return rawRecords.map(record => {
    const obj = {};

    fields.forEach(field => {
      const regex = new RegExp(
        field + "\\s*=\\s*{([\\s\\S]*?)}",
        "gi" // GLOBAL + case-insensitive
      );

      const matches = [...record.matchAll(regex)];

      if (matches.length) {
        obj[field] = matches.map(m => m[1].trim());
      } else {
        obj[field] = []; // always an array
      }
    });

    return obj;
  });
}

