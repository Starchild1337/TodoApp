const StorageCtrl = (() => {
  return {
    getItemsFromLS: () => {
      let todos;

      if (localStorage.getItem("todos") === null) {
        todos = [];
      } else {
        todos = JSON.parse(localStorage.getItem("todos"));
      }

      return todos;
    },
    setItemToLS: (item) => {
      let todos = StorageCtrl.getItemsFromLS();
      todos.push(item);

      localStorage.setItem("todos", JSON.stringify(todos));

      return todos;
    },
  };
})();

const ItemCtrl = (() => {
  class Item {
    constructor(name, id) {
      this.id = id;
      this.name = name;
      this.completed = false;
    }
  }

  const state = {
    items: StorageCtrl.getItemsFromLS(),
    itemsLeft: 0,
  };

  return {
    addItem: (item) => {
      let ID;
      if (state.items.length > 0) {
        ID = state.items.length;
      } else {
        ID = 0;
      }

      const newItem = new Item(item, ID);
      state.items.push(newItem);
      StorageCtrl.setItemToLS(newItem);

      return newItem;
    },
    deleteItem: (id) => {
      const ids = state.items.map((item) => item.id);

      const index = ids.indexOf(id);
      state.items.splice(index, 1);
      localStorage.setItem("todos", JSON.stringify(state.items));
    },
    completedItem: (id) => {
      state.items.forEach((item) => {
        if (item.id === id) {
          item.completed = !item.completed;
        }
      });

      let todos = StorageCtrl.getItemsFromLS();

      todos.forEach((todo) => {
        if (todo.id === id) {
          todo.completed = !todo.completed;
        }
      });

      localStorage.setItem("todos", JSON.stringify(todos));
    },
    filterActive: () => {
      const active = state.items.filter((item) => item.completed === false);
      return active;
    },
    filterCompleted: () => {
      const completed = state.items.filter((item) => item.completed === true);
      return completed;
    },
    clearCompletedItems: () => {
      const items = state.items;
      const filtered = ItemCtrl.filterActive();

      const removeMatched = (items, filtered) => {
        const spreadedItems = [...items, filtered];
        return spreadedItems.filter((el) => {
          return items.includes(el) && filtered.includes(el);
        });
      };

      state.items = removeMatched(items, filtered);
      localStorage.setItem("todos", JSON.stringify(state.items));
      return state.items;
    },
    getItems: () => {
      return state.items;
    },
  };
})();

const UICtrl = (() => {
  return {
    addItemToList: (item) => {
      const li = document.createElement("li");
      li.id = `item-${item.id}`;
      li.className = "list-item";
      const span = document.createElement("span");
      span.id = `check-${item.id}`;
      const img = document.createElement("img");
      img.setAttribute("src", "images/icon-cross.svg");
      img.className = "cross";
      li.textContent = item.name;
      li.appendChild(span);
      li.appendChild(img);

      document
        .querySelector(".todo-list")
        .insertAdjacentElement("beforeend", li);
    },
    removeItemFromList: (id) => {
      const listItems = document.querySelectorAll(".list-item");
      listItems.forEach((listItem) => {
        if (listItem.id === id) {
          listItem.remove();
        }
      });
    },
    showAllItems: (allItems) => {
      let item = "";
      allItems.forEach((allItem) => {
        item += `<li id=item-${allItem.id} class="list-item ${
          allItem.completed ? "completed" : ""
        }">
            ${allItem.name}
                <span id=check-${allItem.id} class=${
          allItem.completed ? "check" : ""
        }></span>
            <img src="images/icon-cross.svg" class="cross" />
            </li>
            `;
      });
      document.querySelector(".todo-list").innerHTML = item;
    },
    showActiveItems: (activeItems) => {
      let item = "";
      activeItems.forEach((activeItem) => {
        item += `<li id=item-${activeItem.id} class="list-item">
            ${activeItem.name}
                    <span id=check-${activeItem.id} class=${
          activeItem.completed ? "check" : ""
        }></span>
            <img src="images/icon-cross.svg" class="cross" />
            </li>
            `;
      });
      document.querySelector(".todo-list").innerHTML = item;
    },
    showCompletedItems: (completedItems) => {
      let item = "";
      completedItems.forEach((completedItem) => {
        item += `<li id=item-${completedItem.id} class="list-item completed">
            ${completedItem.name}
                    <span id=check-${completedItem.id} class=${
          completedItem.completed ? "check" : ""
        }></span>
            <img src="images/icon-cross.svg" class="cross" />
            </li>
            `;
      });
      document.querySelector(".todo-list").innerHTML = item;
    },
    clearCompleted: (completed) => {
      UICtrl.showActiveItems(completed);
    },
    toggleCompletedItem: (item) => {
      item.classList.toggle("completed");
      let id = item.id;
      id = id.split("-");
      id = id[1];
      const check = document.getElementById(`check-${id}`);
      check.classList.toggle("check");
    },
    itemLeftFunc: (itemsLeft) => {
      if (itemsLeft === 1) {
        return "1 item left";
      } else {
        return `${itemsLeft} items left`;
      }
    },
    showItemCount: () => {
      const itemsLeft = ItemCtrl.filterActive().length;
      document.getElementById("items-left").innerHTML = `${
        itemsLeft === 0 ? "0 item left" : UICtrl.itemLeftFunc(itemsLeft)
      }`;
    },
    dragItems: () => {
      const todoList = document.querySelector(".todo-list");
      new Sortable(todoList, {
        animation: 200,
      });
    },
  };
})();

const App = (() => {
  const loadEventListeners = () => {
    document.getElementById("theme-icon").addEventListener("click", () => {
      const body = document.body;
      body.classList.toggle("light-theme");
      if (body.classList.contains("light-theme")) {
        document.getElementById("theme-icon").src = "images/icon-moon.svg";
      } else {
        document.getElementById("theme-icon").src = "images/icon-sun.svg";
      }
    });

    document.getElementById("form").addEventListener("submit", addItem);

    document
      .querySelector(".todo-list")
      .addEventListener("click", completedItemHandler);

    document.querySelector(".container").addEventListener("click", removeItem);

    document.getElementById("all").addEventListener("click", showAll);

    document.getElementById("active").addEventListener("click", showActive);

    document
      .getElementById("completed")
      .addEventListener("click", showCompleted);

    document.getElementById("clear").addEventListener("click", clearItems);
  };

  const addItem = (e) => {
    const input = document.getElementById("todo-input").value;
    if (input !== "") {
      const newItem = ItemCtrl.addItem(input);
      UICtrl.addItemToList(newItem);
    }

    UICtrl.showItemCount();
    document.getElementById("todo-input").value = "";

    e.preventDefault();
  };

  const completedItemHandler = (e) => {
    if (e.target.classList.contains("list-item")) {
      UICtrl.toggleCompletedItem(e.target);

      const ID = e.target.id.split("-");
      itemID = parseInt(ID[1]);
      ItemCtrl.completedItem(itemID);
    }

    UICtrl.showItemCount();
  };

  const removeItem = (e) => {
    if (e.target.parentElement.classList.contains("list-item")) {
      const ID = e.target.parentElement.id.split("-");
      itemID = parseInt(ID[1]);
      ItemCtrl.deleteItem(itemID);
      UICtrl.removeItemFromList(e.target.parentElement.id);

      UICtrl.showItemCount();
    }
  };

  const showAll = () => {
    const allItems = ItemCtrl.getItems();
    UICtrl.showAllItems(allItems);

    const all = document.getElementById("all");
    const active = document.getElementById("active");
    const completed = document.getElementById("completed");
    all.classList.add("active");
    active.classList.remove("active");
    completed.classList.remove("active");

    UICtrl.showItemCount();
  };

  const showActive = () => {
    const activeItems = ItemCtrl.filterActive();
    UICtrl.showActiveItems(activeItems);

    const all = document.getElementById("all");
    const active = document.getElementById("active");
    const completed = document.getElementById("completed");
    all.classList.remove("active");
    active.classList.add("active");
    completed.classList.remove("active");

    UICtrl.showItemCount();
  };

  const showCompleted = () => {
    const completedItems = ItemCtrl.filterCompleted();
    UICtrl.showCompletedItems(completedItems);

    const all = document.getElementById("all");
    const active = document.getElementById("active");
    const completed = document.getElementById("completed");
    all.classList.remove("active");
    active.classList.remove("active");
    completed.classList.add("active");

    UICtrl.showItemCount();
  };

  const clearItems = () => {
    const completed = ItemCtrl.clearCompletedItems();
    UICtrl.clearCompleted(completed);
    UICtrl.showItemCount();

    const all = document.getElementById("all");
    const active = document.getElementById("active");
    const complete = document.getElementById("completed");
    all.classList.add("active");
    active.classList.remove("active");
    complete.classList.remove("active");
  };

  return {
    init: () => {
      loadEventListeners();
      const allItems = ItemCtrl.getItems();
      UICtrl.showAllItems(allItems);
      UICtrl.showItemCount();
      UICtrl.dragItems();
    },
  };
})();

App.init();
