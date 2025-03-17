import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';

type Props = {
  errorMsg: string;
  changeError: (er: string) => void;
};

export const ErrorNotification: React.FC<Props> = ({
  errorMsg,
  changeError,
}) => {
  const errorDiv = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      errorDiv.current?.classList.add('hidden');
    }, 3000);
  }, [errorMsg]);

  return (
    <div
      data-cy="ErrorNotification"
      className={classNames(
        'notification is-danger is-light has-text-weight-normal',
        { hidden: errorMsg.length === 0 },
      )}
      ref={errorDiv}
    >
      <button
        data-cy="HideErrorButton"
        type="button"
        className="delete"
        onClick={() => changeError('')}
      />
      {errorMsg}
    </div>
  );
};
