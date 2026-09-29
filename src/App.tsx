/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */

import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  USER_ID,
  addTodos,
  deleteTodos,
  getTodos,
  updateTodo,
} from './api/todos';
import { Todo } from './types/Todo';
import { TodoHeader } from './components/TodoHeader';
import { TodoList } from './components/TodoList';
import { TodoFooter } from './components/TodoFooter';
import { ErrorNotification } from './components/ErrorNotification';

type Filter = 'all' | 'completed' | 'active';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Unable to load todos');
  const [title, setTitle] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const [updatingTodoId, setUpdatingTodoId] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = (message: string) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    setErrorMessage(message);
    setHasError(true);

    errorTimeoutRef.current = setTimeout(() => {
      setHasError(false);
    }, 3000);
  };

  useEffect(() => {
    setHasError(false);

    getTodos()
      .then(setTodos)
      .catch(() => {
        showError('Unable to load todos');
      });
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      showError('Title should not be empty');

      return;
    }

    const newTempTodo: Todo = {
      id: 0,
      userId: USER_ID,
      title: trimmedTitle,
      completed: false,
    };

    setTempTodo(newTempTodo);

    addTodos({
      userId: USER_ID,
      title: trimmedTitle,
      completed: false,
    })
      .then(newTodo => {
        setTodos(currentTodos => [...currentTodos, newTodo]);
        setTitle('');
      })
      .catch(() => {
        showError('Unable to add a todo');
      })
      .finally(() => {
        setTempTodo(null);

        setTimeout(() => {
          inputRef.current?.focus();
        });
      });
  };

  const handleDelete = (todoId: number) => {
    setDeletingTodoId(todoId);
    setHasError(false);

    deleteTodos(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        showError('Unable to delete a todo');
      })
      .finally(() => {
        setDeletingTodoId(null);
        inputRef.current?.focus();
      });
  };

  const handleToggle = (todo: Todo) => {
    setUpdatingTodoId(todo.id);

    updateTodo(todo.id, {
      completed: !todo.completed,
    })
      .then(updatedTodo => {
        setTodos(currentTodos =>
          currentTodos.map(currentTodo =>
            currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo,
          ),
        );
      })
      .catch(() => {
        showError('Unable to update a todo');
      })
      .finally(() => {
        setUpdatingTodoId(null);
      });
  };

  const handleRename = (todoId: number, titl: string): Promise<boolean> => {
    setUpdatingTodoId(todoId);

    return updateTodo(todoId, {
      title: titl,
    })
      .then(updatedTodo => {
        setTodos(currentTodos =>
          currentTodos.map(currentTodo =>
            currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo,
          ),
        );

        return true;
      })
      .catch(() => {
        showError('Unable to update a todo');

        return false;
      })
      .finally(() => {
        setUpdatingTodoId(null);
      });
  };

  const handleClearCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    setHasError(false);

    Promise.allSettled(completedTodos.map(todo => deleteTodos(todo.id))).then(
      results => {
        const deletedIds = completedTodos
          .filter((_, index) => results[index].status === 'fulfilled')
          .map(todo => todo.id);

        setTodos(currentTodos =>
          currentTodos.filter(todo => !deletedIds.includes(todo.id)),
        );

        if (results.some(result => result.status === 'rejected')) {
          showError('Unable to delete a todo');
        }

        inputRef.current?.focus();
      },
    );
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  const visibleTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;

      case 'completed':
        return todo.completed;

      default:
        return true;
    }
  });

  const activeTodosCount = todos.filter(todo => !todo.completed).length;

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <TodoHeader
          todos={todos}
          title={title}
          inputRef={inputRef}
          tempTodo={tempTodo}
          onTitleChange={setTitle}
          onSubmit={handleSubmit}
          handleToggle={handleToggle}
        />

        {(todos.length > 0 || tempTodo !== null) && (
          <TodoList
            todos={visibleTodos}
            tempTodo={tempTodo}
            deletingTodoId={deletingTodoId}
            updatingTodoId={updatingTodoId}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        )}

        {todos.length > 0 && (
          <TodoFooter
            filter={filter}
            activeTodosCount={activeTodosCount}
            hasCompletedTodos={todos.some(todo => todo.completed)}
            onFilterChange={setFilter}
            onClearCompleted={handleClearCompleted}
          />
        )}
      </div>

      <ErrorNotification
        hasError={hasError}
        errorMessage={errorMessage}
        onClose={() => setHasError(false)}
      />
    </div>
  );
};
