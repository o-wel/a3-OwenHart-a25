// FRONT-END (CLIENT) JAVASCRIPT HERE

// page load actions
window.onload = async function() {
  const button = document.querySelector("button");
  button.onclick = submit;

  const tableContents = await fetch( "/appdata", {
    method:"GET",
  } );

  const contents = await tableContents.json();
  console.log( "response:", contents );

  await updateTableData( contents );
}

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

  nameInput.value = ""
  reviewInput.value = ""
  priceInput.value = ""

  const response = await fetch( "/submit", {
    method:"POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(json),
  })

  const newData = await response.json()
  console.log( "updated data:", newData )

  await updateTableData()
}

const updateTableData = async function() {
  const table = document.getElementById("wishlist");
  const tableContents = await fetch( "/appdata", {
    method:"GET",
  } );

  const contents = await tableContents.json();
  console.log( "database:", contents );

  for ( let i = table.rows.length-1; i >= 1; i-- ) {
    table.deleteRow(i)
  }

  let totalPrice = 0;

  contents.forEach(( element, rowNum ) => {
    const row = table.insertRow();
    row.className = "card"

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
  // update server
  const response = await fetch( "/remove", {
    method:"POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(element)
  })

  const newData = await response.json()
  console.log( "removed row:", newData )

  await updateTableData()
}