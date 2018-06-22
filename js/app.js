(function (window) {
    'use strict';
    function TodoView() {
        // web view widget
        this.todoList = $('.todo-list');
        this.newItem = $('.new-item');
        this.finishAllBtn = $('.finish-all');
        this.removeCompBtn = $('.remove-completed');

        this.swipeLeftHandler = null;
        this.checkHandler = null;
        this.swipeRightHandler = null;
        this.editDoneHandler = null;
        this.toggleCompleteRecord = true;

        // put the item being edited
        this.editedItem = null;
    };

    /**
     * bind some behavior with the view
     * @param {string} event different types of events to bind
     * @param {function} handler the function to bind with the view
     */
    TodoView.prototype.bind = function (event, handler, callback) {
        var self = this;
        switch (event) {
            case 'add':
                self.newItem.addEventListener('keydown', function (event) {
                    if (event.key === 'Enter') {
                        handler(self.newItem.value);
                    }
                });
                break;

            case 'delete':
                self.swipeLeftHandler = handler;
                break;

            case 'check':
                self.checkHandler = handler;
                break;

            case 'finishAll':
                self.finishAllBtn.addEventListener('click', function () {
                    // alert("Are you sure?");
                    handler(self.toggleCompleteRecord);
                    self.toggleCompleteRecord = !self.toggleCompleteRecord;
                });
                break;

            case 'removeCompleted':
                self.removeCompBtn.addEventListener('click', function () {
                    handler();
                })
                break;

            case 'edit':
                self.swipeRightHandler = handler;
                self.editDoneHandler = callback;
                break;
        }
    };

    /**
     * 
     * @param {string} newItemValue the new todo item content
     * @param {boolean} complete item complete or not, false by default
     */
    TodoView.prototype.addNewItem = function (newItemValue, complete) {
        var self = this;
        newItemValue = newItemValue.trim();
        if (newItemValue === '') {
            return;
        }
        var newElement = $new('li', {
            class: 'todo-item',
            text: newItemValue
        });
        // add complete checkbox
        complete = complete ? true : false;

        var newCheckbox = $new('input', {
            type: 'checkbox',
            class: 'complete-checkbox',
            checked: complete
        });
        newCheckbox.addEventListener('change', function (event) {
            self.checkHandler(event.target.parentElement.textContent, event.target.checked);
        })
        newElement.insertBefore(newCheckbox, newElement.childNodes[0]);

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
                        self.swipeLeftHandler(event.target);
                        // console.log('swipe occurs on', event.target.tagName);
                    }
                    else if (xDiff < 0) {
                        // swipe to right
                        console.log('swipe to right');
                        self.swipeRightHandler(event.target);
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
            self.addNewItem(item.value, item.complete);
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
     * set all todos on the screen as finished (or all unfinished)
     * @param {boolean} completeOrCancel 
     */
    TodoView.prototype.toggleCompleteAll = function (completeOrCancel) {
        $all('.complete-checkbox').forEach(function (completeBox) {
            // console.log(todoItem.textContent);
            // console.log($('.complete-checkbox', todoItem).checked);
            completeBox.checked = completeOrCancel;
        });
    };

    TodoView.prototype.removeCompleted = function () {
        var self = this;
        $all('.complete-checkbox').forEach(function (box) {
            if (box.checked === true) {
                console.log(box.parentElement.textContent);
                // remove element
                self.todoList.removeChild(box.parentElement);
            }
        })
    };

    TodoView.prototype.makeItemEditable = function (item) {
        var self = this;
        var box = item.childNodes[0];
        var text = item.childNodes[1];
        console.log('item', item);
        item.removeChild(box);
        item.removeChild(text);
        var editable = $new('input', {
            class: 'editable',
            type: 'text'
        });
        item.appendChild(editable);
        editable.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                console.log('edit finish');
                // compare, save, restore
                item.removeChild(editable);
                console.log('box', box);
                console.log('text', text);
                item.appendChild(box);
                console.log('item', item);
                var editedText = editable.value.trim();
                console.log('edited text', editedText);
                item.appendChild(text);
                if (editedText !== '') {
                    // update model
                    self.editDoneHandler(item.textContent, editedText)
                    // update view
                    // item.textContent = editedText;
                    item.appendChild(text);
                    text.textContent = editedText;
                }
            }
        });
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
            complete: false
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

    TodoModel.prototype.changeItemComplete = function (itemText, complete) {
        var i = 0;
        for (i = 0; i < this.todoItems.length; i++) {
            if (this.todoItems[i].value === itemText) {
                break;
            }
        }
        this.todoItems[i].complete = complete;
        this.store();
    }

    /**
     * set all todos stored as finished (or all unfinished)
     */
    TodoModel.prototype.toggleCompleteAll = function (completeOrCancel) {
        this.todoItems.forEach(function (item) {
            item.complete = completeOrCancel;
        });
        this.store();
    };


    TodoModel.prototype.removeCompleted = function () {
        var backup = [];
        while (this.todoItems.length > 0) {
            var item = this.todoItems.pop();
            if (!item.complete) {
                backup.push(item);
            }
        }
        this.todoItems = backup.reverse();
        // save
        this.store();
    };

    TodoModel.prototype.replaceEdited = function (textOld, textNew) {
        console.log('replaceEdited() called', textOld, textNew);
        for (var i = 0; i < this.todoItems.length; i++) {
            if (this.todoItems[i].value === textOld) {
                this.todoItems[i].value = textNew;
                break;
            }
        }
        console.log('relace find', i);
        console.log('updated model', this.todoItems);
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

        // bind the "complete" operation of view and model
        self.view.bind('check', function (itemValue, complete) {
            self.model.changeItemComplete(itemValue, complete);
        });

        self.view.bind('finishAll', function (toggle) {
            self.view.toggleCompleteAll(toggle);
            self.model.toggleCompleteAll(toggle);
        });

        self.view.bind('removeCompleted', function () {
            self.view.removeCompleted();
            self.model.removeCompleted();
        });

        self.view.bind(
            'edit',
            function (item) {
                self.view.makeItemEditable(item);
                // self.model.replaceEdited(textOld, textNew);
            },
            function (textOld, textNew) {
                self.model.replaceEdited(textOld, textNew);
            }
        );


        self.view.showAll(self.model.getAllItems());
    };

    function TodoMVC() {
        this.view = new TodoView();
        this.model = new TodoModel();
        this.controller = new TodoController(this.view, this.model);
    };

    window.TodoMVC = TodoMVC;

})(window);