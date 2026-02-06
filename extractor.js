document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("bibtexFile");
  const output = document.getElementById("output");
  const records_count=document.getElementById("records_count")

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
//so far it only displays raw
function formISBD(bibtexData){



//get the array of objects
let records=bibtexRawToObjectsArray(bibtexData);

//display count
records_count.textContent=`${records.length} източника`


//display the records as text. first we do the articles
let bibliography="";
records.forEach(r=>{
  //check record type and append value
  bibliography+=checkRecordType(r);
  bibliography+='\n'
    //see what we extract
    console.log(r)
    //this handles missing author
    if (r.author.length>0){
        bibliography+=`${r.author}. `
    }
    
    bibliography+=`${r.title}`
    bibliography+=`. - В: ${r.source}`
    bibliography+=`. - бр. ${r.issue}`
    bibliography+=` (${r.year})`
    bibliography+=`, с. ${r.pages_art}\n`

    //next 2 cases check array length becaause there can be multiple values
    // if there is abstract
    if (r.abstract.length>0){
      //iterate through abstract array
      r.abstract.forEach(a=>{
        bibliography+=` ${a}\n`
      })
      
    }

    //if there is see_also references
    if (r.see_also.length>0){
      //iterate through references 
      bibliography+=`Вж. и`
      r.see_also.forEach(sa=>{
         bibliography+=`${sa}\n`
      })
     
    }
    //space out records
    bibliography+=`\n`
})
output.textContent=bibliography;

}

//check if the record is an article or other, based on used pages field, returns a literal
function checkRecordType(record){
  if (record.pages_art.length>0){
    return "Статия"
  } else {
    return "Книга"
  }
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
    "see_also"
  ];

  // 3. Parse each record
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