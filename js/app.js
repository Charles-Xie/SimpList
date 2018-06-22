(function (window) {
    function TodoView() {
        this.todoList = $('.todo-list');
        this.newItem = $('.new-item');
    };

    TodoView.prototype.bind = function (event, handler) {
        var self = this;
        if (event === 'add') {
            self.newItem.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    handler(self.newItem.value);
                }
            });
        }
    };

    TodoView.prototype.addNewItem = function (newItemValue) {
        newItemValue = newItemValue.trim();
        if (newItemValue === '') {
            return;
        }
        var self = this;
        var newElement = $new('li', {
            class: 'todo-item',
            text: newItemValue
        });
        self.todoList.appendChild(newElement);
    };

    TodoView.prototype.clearInput = function (newItemValue) {
        this.newItem.value = '';
    };

    TodoView.prototype.showAll = function (allItems) {
        var self = this;
        allItems.forEach(function (item) {
            self.addNewItem(item.value);
        });
    };




    function TodoModel() {
        this.todoItems = JSON.parse(localStorage.getItem('todo')) || [];
    };


    TodoModel.prototype.addNewItem = function (newItemValue) {
        newItemValue = newItemValue.trim();
        if (newItemValue === '') {
            return;
        }
        this.todoItems.push({
            value: newItemValue,
            active: true
        });
        // store data into localStorage
        localStorage.setItem('todo', JSON.stringify(this.todoItems));
    };

    TodoModel.prototype.getAllItems = function () {
        // return a copy of the todo items
        // this is actually not so meaningful, as you can still access this.todoItems
        return this.todoItems.slice();
    };

    function TodoController(view, model) {
        var self = this;
        self.view = view;
        self.model = model;

        self.view.bind('add', function (newItemValue) {
            // console.log("new item", newItemValue);
            // add this new item into model
            self.model.addNewItem(newItemValue);
            // show this on page
            self.view.addNewItem(newItemValue);
            // and clear the input
            self.view.clearInput();
        });

        self.view.showAll(self.model.getAllItems());
    };

    function TodoMVC() {
        this.view = new TodoView();
        this.model = new TodoModel();
        this.controller = new TodoController(this.view, this.model);
    };

    window.TodoMVC = TodoMVC;

})(window);