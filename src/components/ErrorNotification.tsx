import React from 'react';

type Props = {
  hasError: boolean;
  errorMessage: string;
  onClose: () => void;
};

export const ErrorNotification: React.FC<Props> = ({
  hasError,
  errorMessage,
  onClose,
}) => (
  <div
    data-cy="ErrorNotification"
    className={`notification is-danger is-light has-text-weight-normal ${
      hasError ? '' : 'hidden'
    }`}
  >
    <button
      data-cy="HideErrorButton"
      type="button"
      className="delete"
      onClick={onClose}
    />

    {errorMessage}
  </div>
);
