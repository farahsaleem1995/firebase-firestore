let mode = "add";

const cafeList = document.querySelector("#cafe-list");
const cafeForm = document.querySelector("#add-cafe-form");

const handleCafeListItemClick = (e) => {
  e.stopPropagation();

  mode = "edit";

  const selectedLi = e.target;

  cafeForm.name.value = selectedLi.childNodes[0].innerHTML;
  cafeForm.city.value = selectedLi.childNodes[1].innerHTML;

  cafeForm.querySelector("button").textContent = "Update";

  let hiddenId = document.querySelector("input[type='hidden']");
  if (!hiddenId) {
    hiddenId = document.createElement("input");
    hiddenId.setAttribute("type", "hidden");
    hiddenId.setAttribute("name", "id");
  }
  hiddenId.setAttribute("value", selectedLi.getAttribute("data-id"));

  cafeForm.appendChild(hiddenId);
};

const handleCafeListItemCrossClick = (e) => {
  e.stopPropagation();

  const cafes = db.collection("cafes");

  const id = e.target.parentElement.getAttribute("data-id");

  removeDoc(cafes, id);
};

const handeCafeFormSubmit = (e) => {
  e.preventDefault();

  const cafes = db.collection("cafes");

  if (mode === "add") {
    addDoc(cafes, cafeForm);
  }

  if (mode === "edit") {
    updateDoc(cafes, cafeForm.id.value, cafeForm);
  }
};

const renderCafe = (doc) => {
  let li = document.createElement("li");
  let name = document.createElement("span");
  let city = document.createElement("span");
  let cross = document.createElement("div");

  li.setAttribute("data-id", doc.id);

  name.textContent = doc.data().name;
  city.textContent = doc.data().city;
  cross.textContent = "x";

  li.appendChild(name);
  li.appendChild(city);
  li.appendChild(cross);

  cafeList.appendChild(li);

  li.addEventListener("click", handleCafeListItemClick);

  cross.addEventListener("click", handleCafeListItemCrossClick);
};

const fetchDocs = (collection) => {
  collection.orderBy("name").onSnapshot((snapshot) => {
    let changes = snapshot.docChanges();
    changes.forEach((change) => {
      switch (change.type) {
        case "added":
          renderCafe(change.doc);
          break;

        case "removed":
          let li = cafeList.querySelector(`[data-id=${change.doc.id}]`);
          cafeList.removeChild(li);
          break;

        case "modified":
          let updatedLi = cafeList.querySelector(`[data-id=${change.doc.id}]`);

          updatedLi.childNodes[0].innerHTML = change.doc.data().name;
          updatedLi.childNodes[1].innerHTML = change.doc.data().city;
          break;

        default:
          break;
      }
    });
  });
};

const addDoc = (collection, form) => {
  collection
    .add({
      name: form.name.value,
      city: form.city.value,
    })
    .then((docRef) => {
      console.log(`New document "${docRef.id}"`);

      form.name.value = "";
      form.city.value = "";
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
};

const updateDoc = (collection, docId, form) => {
  mode = "add";

  collection
    .doc(docId)
    .set({
      name: form.name.value,
      city: form.city.value,
    })
    .then(() => {
      form.name.value = "";
      form.city.value = "";
    })
    .catch((error) => {
      console.error("Error editing document: ", error);
    });
};

const removeDoc = (collection, docId) => {
  collection
    .doc(docId)
    .delete()
    .then(() => {
      console.log(`Document "${docId}" deleted`);
    })
    .catch((error) => {
      console.error("Error deleteing document: ", error);
    });
};

cafeForm.addEventListener("submit", handeCafeFormSubmit);

window.addEventListener("load", fetchDocs(db.collection("cafes")));

// db.collection("cafes")
//   // .where("city", "==", "Marioland")
//   // .orderBy("name", "desc")
//   .orderBy("name")
//   .get()
//   .then((snapshot) => {
//     snapshot.docs.forEach((doc) => {
//       renderCafe(doc);
//     });
//   })
//   .catch((error) => {
//     console.error("Error getting documents: ", error);
//   });
