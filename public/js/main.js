// FRONT-END (CLIENT) JAVASCRIPT HERE

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const nameInput = document.getElementById( "gamename" ),
        reviewInput = document.getElementById( "gamereview" ),
        priceInput = document.getElementById( "gameprice" ),
        json = [{ "name": nameInput.value, "review": reviewInput.value, "price": priceInput.value },
        ]
        body = JSON.stringify( json )

  nameInput.value = ""
  reviewInput.value = ""
  priceInput.value = ""

  const response = await fetch( "/submit", {
    method:"POST",
    body 
  })

  const newData = await response.json()
  console.log( "updated data:", newData )

  updateTableData(newData)
}

window.onload = async function() {
  const button = document.querySelector("button");
  button.onclick = submit;

  const tableContents = await fetch( "/appdata", {
    method:"GET",
  } );

  const contents = await tableContents.json();
  console.log( "response:", contents );

  updateTableData( contents );
}

const updateTableData = function(contents) {
  const table = document.getElementById("wishlist");

  for ( let i = table.rows.length-1; i >= 1; i-- ) {
    table.deleteRow(i)
  }

  let totalPrice = 0;

  contents.forEach(( element, rowNum ) => {
    const row = table.insertRow();

    const name = row.insertCell(0);
    const review = row.insertCell(1);
    const price = row.insertCell(2);
    const editButton = row.insertCell(3);
    const deleteButton = row.insertCell(4);

    name.innerHTML = element.name;
    review.innerHTML = element.review;
    price.innerHTML = element.price;

    totalPrice += Number(element.price);

    editButton.innerHTML = "<button>Edit</button>"
    deleteButton.innerHTML = "<button>Delete</button>"

    deleteButton.addEventListener("click", () => {
      removeRow(element)
    })

    editButton.addEventListener("click", () => {
      editRow(element.name, element.review, element.price);
      removeRow(element)
    })

    const derivedTable = document.getElementById("derived");
    if (derivedTable.rows.length > 1) {
      derivedTable.deleteRow(1);
    }
    const newDerived = derivedTable.insertRow();
    const totalPriceCell = newDerived.insertCell(0);
    const avgPrice = newDerived.insertCell(1);

    totalPriceCell.innerHTML = totalPrice.toFixed(2);
    avgPrice.innerHTML = (totalPrice/contents.length).toFixed(2);
  })
}

const editRow = async function( name, review, price ) {
  const nameInput = document.getElementById( "gamename" ),
      reviewInput = document.getElementById( "gamereview" ),
      priceInput = document.getElementById( "gameprice" )

  nameInput.value = name
  reviewInput.value = review
  priceInput.value = price
}

const removeRow = async function(element) {
  body = JSON.stringify( element.name );
  // update server
  const response = await fetch( "/remove", {
    method:"POST",
    body
  })

  const newData = await response.json()
  updateTableData(newData)
}