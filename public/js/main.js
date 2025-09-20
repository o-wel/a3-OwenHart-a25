// FRONT-END (CLIENT) JAVASCRIPT HERE

// page load actions
window.onload = async function() {
    const button = document.getElementById("submitbtn");
    if (button) {
        button.onclick = submit;
    }

    const loginButton = document.getElementById("loginbtn");
    if (loginButton) {
        loginButton.onclick = login;
    }

    const logoutButton = document.getElementById("logoutbtn");
    if (logoutButton) {
        logoutButton.onclick = logout;
    }

    const table = document.getElementById("wishlist");

    if (table) {
        const tableContents = await fetch("/appdata", {
            method: "GET",
        });

        const contents = await tableContents.json();
        console.log("response:", contents);

        await updateTableData(contents);
    }
}

const login = async function( event ) {
    event.preventDefault();

    const usernameInput = document.getElementById( "username" ),
          passwordInput = document.getElementById( "password" ),
          json = { "username": usernameInput.value, "password": passwordInput.value }

    const response = await fetch( "/login", {
        method:"POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json),
    })

    console.log( "login response:", response );
    if ( response.redirected ) {
        window.location.href = response.url;

    } else {
        console.log("Login failed.");

        const errMsg = document.getElementById("errMsg");
        if(errMsg) {
            errMsg.innerHTML = '<p class="text-danger-emphasis">Invalid username or password</p>';
        }
    }
}

const logout = async function( event ) {
    event.preventDefault();

    const response = await fetch( "/logout", {
        method:"DELETE",
    })

    console.log( "response:", response );
    if ( response.redirected ) {
        window.location.href = response.url;
    } else {
        console.log("Logout failed.");
    }
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

    const name = row.insertCell(0);
    const review = row.insertCell(1);
    const price = row.insertCell(2);
    const editButton = row.insertCell(3);
    const deleteButton = row.insertCell(4);

    name.innerHTML = element.name;
    review.innerHTML = element.review;
    price.innerHTML = element.price;

    totalPrice += Number(element.price);

    editButton.innerHTML = "<button class='btn btn-secondary'>Edit</button>"
    deleteButton.innerHTML = "<button class='btn btn-secondary'>Delete</button>"

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