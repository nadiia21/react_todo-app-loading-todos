/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useMemo, useState } from 'react';
import { UserWarning } from './UserWarning';
import * as api from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';

type FilterTodo = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [filtered, setFiltered] = useState<FilterTodo>('all');

  const visibleTodos = useMemo(() => {
    let visibles = todos;

    switch (filtered) {
      case 'active':
        visibles = visibles.filter(td => td.completed === false);
        break;
      case 'completed':
        visibles = visibles.filter(td => td.completed === true);
        break;
      default:
        break;
    }

    return visibles;
  }, [filtered, todos]);

  useEffect(() => {
    setLoading(true);
    api
      .getTodos()
      .then(setTodos)
      .catch(() => setErrorMsg('Unable to load todos'))
      .finally(() => setLoading(false));
  }, []);

  async function addTodo(titleToAdd: string) {
    try {
      const addedTodo = await api.addTodo(titleToAdd);

      setTodos(prevTodo => {
        return [...prevTodo, addedTodo];
      });
    } catch (e) {
      setErrorMsg('Unable to add a todo');

      throw e;
    }
  }

  async function updateTodo(todoToUpdate: Todo) {
    try {
      const updatedTodo = await api.updateTodo(todoToUpdate);

      setTodos(prevTodos => {
        return prevTodos.map(todo =>
          todo.id === updatedTodo.id ? updatedTodo : todo,
        );
      });
    } catch (e) {
      setErrorMsg('Unable to update a todo');

      throw e;
    }
  }

  async function deleteTodo(todoId: number) {
    try {
      await api.deleteTodo(todoId);

      setTodos(prevTodo => prevTodo.filter(td => td.id !== todoId));
    } catch (e) {
      setErrorMsg('Unable to delete a todo');

      throw e;
    }
  }

  if (!api.USER_ID) {
    return <UserWarning />;
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title) {
      setErrorMsg('Title should not be empty');
    }

    addTodo(title);
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={onSubmit}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
              }}
            />
          </form>
        </header>

        {!loading && (
          <section className="todoapp__main" data-cy="TodoList">
            {visibleTodos.map(todo => (
              <div
                data-cy="Todo"
                className={classNames('todo', { completed: todo.completed })}
                key={todo.id}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    onDoubleClick={() => {
                      updateTodo(todo);
                      setEditing(true);
                    }}
                    checked={todo.completed}
                  />
                </label>

                {editing ? (
                  <form>
                    <input
                      data-cy="TodoTitleField"
                      type="text"
                      className="todo__title-field"
                      placeholder="Empty todo will be deleted"
                      value="Todo is being edited now"
                    />
                  </form>
                ) : (
                  <>
                    <span data-cy="TodoTitle" className="todo__title">
                      {todo.title}
                    </span>

                    <button
                      type="button"
                      className="todo__remove"
                      data-cy="TodoDelete"
                      onClick={() => deleteTodo}
                    >
                      ×
                    </button>
                  </>
                )}

                <div
                  data-cy="TodoLoader"
                  className={classNames('modal overlay', {
                    'is-active': editing,
                  })}
                >
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Hide the footer if there are no todos */}
        <footer className="todoapp__footer" data-cy="Footer">
          <span className="todo-count" data-cy="TodosCounter">
            3 items left
          </span>

          {/* Active link should have the 'selected' class */}
          <nav className="filter" data-cy="Filter">
            <a
              href="#/"
              className="filter__link selected"
              data-cy="FilterLinkAll"
              onClick={() => setFiltered('all')}
            >
              All
            </a>

            <a
              href="#/active"
              className="filter__link"
              data-cy="FilterLinkActive"
              onClick={() => setFiltered('active')}
            >
              Active
            </a>

            <a
              href="#/completed"
              className="filter__link"
              data-cy="FilterLinkCompleted"
              onClick={() => setFiltered('completed')}
            >
              Completed
            </a>
          </nav>

          {/* this button should be disabled if there are no completed todos */}
          <button
            type="button"
            className="todoapp__clear-completed"
            data-cy="ClearCompletedButton"
          >
            Clear completed
          </button>
        </footer>
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      {errorMsg.length !== 0 && (
        <div
          data-cy="ErrorNotification"
          className="notification is-danger is-light has-text-weight-normal"
        >
          <button data-cy="HideErrorButton" type="button" className="delete" />
          {/* show only one message at a time */}
          {errorMsg}
        </div>
      )}
    </div>
  );
};
