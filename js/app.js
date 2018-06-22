(function (window) {
    function TodoView() {
        this.todoList = $('.todo-list');
        this.newItem = $('.new-item');
        this.swipeHandler = null;
    };

    /**
     * bind some behavior with the view
     * @param {string} event different types of events to bind
     * @param {function} handler the function to bind with the view
     */
    TodoView.prototype.bind = function (event, handler) {
        var self = this;
        if (event === 'add') {
            self.newItem.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    handler(self.newItem.value);
                }
            });
        }
        if (event === 'delete') {
            this.swipeHandler = handler;
        }
    };

    TodoView.prototype.addNewItem = function (newItemValue) {
        var self = this;
        newItemValue = newItemValue.trim();
        if (newItemValue === '') {
            return;
        }
        var newElement = $new('li', {
            class: 'todo-item',
            text: newItemValue
        });
        // add delete button for the new todo item
        // var delBtn = $new('button', {
        //     class: 'del-btn',
        //     text: 'X'
        // });
        // delBtn.addEventListener('click', function () {
        //     console.log('button clicked');
        //     alert('button clicked');
        // });
        // newElement.appendChild(delBtn);
        var addSwipeDeleteFunc = function (ele) {
            var xDown = null;
            var yDown = null;
            var handleTouchStart = function (event) {
                // console.log('touch start');
                xDown = event.touches[0].clientX;
                yDown = event.touches[0].clientY;
                // console.log('xDown', xDown);
            };
            var handleTouchMove = function (event) {
                if (!xDown || !yDown) {
                    return;
                }
                var xUp = event.touches[0].clientX;
                var yUp = event.touches[0].clientY;
                // console.log('xUp', xUp);
                var xDiff = xDown - xUp;
                var yDiff = yDown - yUp;
                console.log('xDiff', xDiff, 'yDiff', yDiff);
                if (Math.abs(xDiff) > Math.abs(yDiff)) {
                    // can be judged as horizontal swipe
                    if (xDiff > 0) {
                        // swipe to left
                        console.log('swipe to left');
                        self.swipeHandler(event.target);
                        // console.log('swipe occurs on', event.target.tagName);
                    }
                    else if (xDiff < 0) {
                        // swipe to right
                        console.log('swipe to right');
                    }
                }
                // reset x and y
                xDown = null;
                yDown = null;
            };
            ele.addEventListener('touchstart', handleTouchStart, false);
            ele.addEventListener('touchmove', handleTouchMove, false);
        };
        addSwipeDeleteFunc(newElement);

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

    /**
     * remove a todo item from DOM
     * @param {DOM element} ele 
     */
    TodoView.prototype.deleteItem = function (ele) {
        ele.parentElement.removeChild(ele);
    };





    /**
     * the model of todo list
     */
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
        this.store();
    };

    /**
     * put todo items array into localStorage
     */
    TodoModel.prototype.store = function () {
        localStorage.setItem('todo', JSON.stringify(this.todoItems));
    }

    TodoModel.prototype.getAllItems = function () {
        // return a copy of the todo items
        // this is actually not so meaningful, as you can still access this.todoItems
        return this.todoItems.slice();
    };

    TodoModel.prototype.deleteItem = function (itemText) {
        var i = 0;
        for (i = 0; i < this.todoItems.length; i++) {
            if (this.todoItems[i].value === itemText) {
                break;
            }
        }
        this.todoItems.splice(i, 1);
        this.store();
    };



    function TodoController(view, model) {
        var self = this;
        self.view = view;
        self.model = model;

        // bind the "add" operation of view and model
        self.view.bind('add', function (newItemValue) {
            // console.log("new item", newItemValue);
            // add this new item into model
            self.model.addNewItem(newItemValue);
            // show this on page
            self.view.addNewItem(newItemValue);
            // and clear the input
            self.view.clearInput();
        });

        // bind the "delete" operation of view and model
        self.view.bind('delete', function (deleteElement) {
            self.model.deleteItem(deleteElement.textContent);
            self.view.deleteItem(deleteElement);
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