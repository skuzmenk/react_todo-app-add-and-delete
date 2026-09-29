import React from 'react';
import { Todo } from '../types/Todo';

type Props = {
  todos: Todo[];
  title: string;
  inputRef: React.RefObject<HTMLInputElement>;
  tempTodo: Todo | null;
  onTitleChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  handleToggle: (todo: Todo) => void;
};

export const TodoHeader: React.FC<Props> = ({
  todos,
  title,
  inputRef,
  tempTodo,
  onTitleChange,
  onSubmit,
  handleToggle,
}) => (
  <header className="todoapp__header">
    {/* this button should have `active` class only if all todos are completed */}
    {todos.length !== 0 && (
      <button
        type="button"
        className={
          todos.find(todo => !todo.completed)
            ? 'todoapp__toggle-all'
            : 'todoapp__toggle-all active'
        }
        data-cy="ToggleAllButton"
        onClick={() =>
          todos.find(todo => !todo.completed)
            ? todos.map(todo => (!todo.completed ? handleToggle(todo) : 0))
            : todos.map(todo => handleToggle(todo))
        }
      />
    )}

    {/* Add a todo on form submit */}
    <form onSubmit={onSubmit}>
      <input
        ref={inputRef}
        data-cy="NewTodoField"
        type="text"
        className="todoapp__new-todo"
        placeholder="What needs to be done?"
        autoFocus
        disabled={tempTodo !== null}
        value={title}
        onChange={event => onTitleChange(event.target.value)}
      />
    </form>
  </header>
);
