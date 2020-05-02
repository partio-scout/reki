import React from 'react';

type LoadingButtonProps = Readonly<{
  onClick?: () => void;
  disabled?: boolean;
  loading: boolean;
  labelWhileLoading: string;
  label: string;
}>

export const LoadingButton: React.FC<LoadingButtonProps> = ({ onClick, disabled, loading, label, labelWhileLoading }) => (
  <button
    onClick={ onClick }
    disabled={ disabled === true || loading }>
    { loading ? labelWhileLoading : label }
  </button>
);
